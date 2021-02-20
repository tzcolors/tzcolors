import { Injectable } from '@angular/core'
import {
  BehaviorSubject,
  combineLatest,
  interval,
  Observable,
  ReplaySubject,
} from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import { environment } from 'src/environments/environment'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  tap,
} from 'rxjs/operators'
import { AccountInfo } from '@airgap/beacon-sdk'
var deepEqual = require('fast-deep-equal/es6')

const colorsFromStorage: Color[] = require('../../../assets/colors.json')

export interface Color {
  name: string
  description: string
  symbol: string
  token_id: number
  category: string
  auction: AuctionItem | undefined
  owner: string | undefined
  loading: boolean
  isFavorite: boolean
  previousAuction: PreviousAuctionItem | undefined
}

export interface Child {
  prim: string
  type: string
  name: string
  value: string
}

export interface Key {
  prim: string
  type: string
  children: Child[]
}

export interface Value {
  prim: string
  type: string
  value: string
  children: Child[]
}

export interface Data {
  key: Key
  value: Value | undefined
  key_hash: string
  key_string: string
  level: number
  timestamp: Date
}

export interface RootObject {
  data: Data
  count: number
}

export interface AuctionItem {
  auctionId: number
  tokenAddress: string
  tokenId: number
  tokenAmount: number
  endTimestamp: Date
  seller: string
  bidAmount: string
  bidder: string
}

export interface PreviousAuctionItem {
  auctionId: number
  tokenAddress: string
  tokenId: number
  tokenAmount: number
  endTimestamp: Date
  seller: string
  bidAmount: string
  bidder: string
}

export type ViewTypes = 'explore' | 'auctions' | 'my-colors' | 'watchlist'

export type ColorCategory = 'all' | 'legendary' | 'epic' | 'standard'

export type SortTypes = 'name' | 'price' | 'activity' | 'time'
export type SortDirection = 'asc' | 'desc'

const STORAGE_KEY_FAVORITES = 'tzcolor:favorites'

export const isOwner = (color: Color, accountInfo?: AccountInfo) => {
  return color.owner && color.owner === accountInfo?.address
}

export const isActiveAuction = (color: Color) => {
  return (
    !!color.auction &&
    color.auction.endTimestamp.getTime() > new Date().getTime()
  )
}

export const isClaimable = (color: Color, accountInfo?: AccountInfo) => {
  return (
    !!color.auction &&
    color.auction.endTimestamp.getTime() < new Date().getTime() &&
    (color.auction.bidder === accountInfo?.address ||
      color.auction.seller === accountInfo?.address)
  )
}

export const isSeller = (color: Color, accountInfo?: AccountInfo) => {
  return color.auction && color.auction.seller === accountInfo?.address
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public colors$: Observable<Color[]>
  public colorsCount$: Observable<number>
  public accountInfo$: Observable<AccountInfo | undefined>

  public sortType$: Observable<SortTypes>
  public sortDirection$: Observable<SortDirection>
  public category$: Observable<ColorCategory>
  public view$: Observable<ViewTypes>
  public dogvision$: ReplaySubject<boolean> = new ReplaySubject()

  public loading$: Observable<boolean>
  public favorites$: Observable<number[]>

  private _colors$: ReplaySubject<Color[]> = new ReplaySubject(1)

  private _favorites: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(
    []
  )

  private _numberOfItems: BehaviorSubject<number> = new BehaviorSubject(12)
  private _searchTerm: BehaviorSubject<string> = new BehaviorSubject('')
  private _sortType: BehaviorSubject<SortTypes> = new BehaviorSubject<SortTypes>(
    'time'
  )
  private _sortDirection: BehaviorSubject<SortDirection> = new BehaviorSubject<SortDirection>(
    'desc'
  )
  private _category: BehaviorSubject<ColorCategory> = new BehaviorSubject<ColorCategory>(
    'all'
  )
  private _view: BehaviorSubject<ViewTypes> = new BehaviorSubject<ViewTypes>(
    'explore'
  )

  private _ownerInfo: BehaviorSubject<
    Map<number, string>
  > = new BehaviorSubject(new Map())
  private _auctionInfo: BehaviorSubject<
    Map<number, AuctionItem>
  > = new BehaviorSubject(new Map())
  private _previousAuctionInfo: BehaviorSubject<
    Map<number, PreviousAuctionItem>
  > = new BehaviorSubject(new Map())
  private _colorStates: BehaviorSubject<
    Map<number, boolean>
  > = new BehaviorSubject(new Map())

  private _accountInfo: BehaviorSubject<
    AccountInfo | undefined
  > = new BehaviorSubject<AccountInfo | undefined>(undefined)

  private _loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    true
  )

  constructor(
    private readonly http: HttpClient,
    private readonly store$: Store<State>
  ) {
    this.store$
      .select(
        (state) => (state as any).app.connectedWallet as AccountInfo | undefined
      )
      .subscribe((accountInfo) => {
        this._accountInfo.next(accountInfo)
      }) // TODO: Refactor?

    this.accountInfo$ = this._accountInfo.asObservable()
    this.sortType$ = this._sortType.asObservable()
    this.sortDirection$ = this._sortDirection.asObservable()
    this.category$ = this._category.asObservable()
    this.view$ = this._view.asObservable()
    this.loading$ = this._loading.asObservable()
    this.favorites$ = this._favorites.asObservable()

    this.initFromStorage()

    let internalColors$ = combineLatest([
      this._colors$.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('colors changed', x))
      ),
      this._category.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('category changed', x))
      ),
      this._view.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('view changed', x))
      ),
      this._ownerInfo.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('ownerInfo changed', x))
      ),
      this._auctionInfo.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('auctionInfo changed', x))
      ),
      this._previousAuctionInfo.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('previousAuctionInfo changed', x))
      ),
      this._colorStates.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('colorStates changed', x))
      ),
      this._favorites.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('favorites changed', x))
      ),
      this._accountInfo.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('accountInfo changed', x))
      ),
      this._searchTerm.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('_searchTerm changed', x))
      ),
      this._sortType.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('_sortType changed', x))
      ),
      this._sortDirection.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('_sortDirection changed', x))
      ),
    ]).pipe(
      map((x) => x as any), // TODO: Fix typing?
      tap(() => {
        this._loading.next(true)
      }),
      debounceTime(10),
      map(
        ([
          colors,
          category,
          view,
          ownerInfo,
          auctionInfo,
          previousAuctionInfo,
          colorStates,
          favorites,
          accountInfo,
          searchTerm,
          sortType,
          sortDirection,
        ]: [
          Color[],
          ColorCategory,
          ViewTypes,
          Map<number, string>,
          Map<number, AuctionItem>,
          Map<number, PreviousAuctionItem>,
          Map<number, boolean>,
          number[],
          AccountInfo | undefined,
          string,
          SortTypes,
          SortDirection
        ]) =>
          colors
            .map((c) => ({
              ...c,
              auction: auctionInfo.get(c.token_id),
              owner: ownerInfo.get(c.token_id),
              loading: colorStates.get(c.token_id) ?? false,
              isFavorite: favorites.includes(c.token_id), // TODO: use map
              previousAuction: previousAuctionInfo.get(c.token_id),
            }))
            .filter((c) =>
              view === 'explore'
                ? true
                : view === 'watchlist'
                ? c.isFavorite
                : view === 'auctions'
                ? isActiveAuction(c)
                : view === 'my-colors'
                ? isOwner(c, accountInfo) ||
                  isClaimable(c, accountInfo) ||
                  isSeller(c, accountInfo)
                : true
            )
            .filter((c) => category === 'all' || c.category === category)
            .filter(
              (c) =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.owner?.toLowerCase() === searchTerm.toLowerCase() ||
                c.auction?.bidder?.toLowerCase() === searchTerm.toLowerCase() ||
                c.auction?.seller?.toLowerCase() === searchTerm.toLowerCase()
            )
            .sort((a_, b_) => {
              const { a, b } =
                sortDirection === 'asc' ? { a: a_, b: b_ } : { a: b_, b: a_ }

              const aAuction = a.auction
              const bAuction = b.auction

              if (sortType === 'time') {
                // TODO: Improve sorting code
                if (!aAuction) {
                  return sortDirection === 'asc' ? 1 : -1
                }
                if (aAuction.endTimestamp.getTime() < new Date().getTime()) {
                  return sortDirection === 'asc' ? 1 : -1
                }
                if (!bAuction) {
                  return sortDirection === 'asc' ? -1 : 1
                }
                if (bAuction.endTimestamp.getTime() < new Date().getTime()) {
                  return sortDirection === 'asc' ? -1 : 1
                }
                if (aAuction && bAuction) {
                  return (
                    (aAuction.endTimestamp?.getTime() ?? 0) -
                    (bAuction.endTimestamp?.getTime() ?? 0)
                  )
                } else {
                  if (aAuction?.endTimestamp && !bAuction?.endTimestamp) {
                    return 1
                  }
                  if (!aAuction?.endTimestamp && bAuction?.endTimestamp) {
                    return -1
                  }
                }
              } else if (sortType === 'price') {
                if (view === 'auctions') {
                  if (aAuction && bAuction) {
                    return (
                      (Number(aAuction.bidAmount) ?? 0) -
                      (Number(bAuction.bidAmount) ?? 0)
                    )
                  } else {
                    return -1
                  }
                } else {
                  const aBid = Number(aAuction?.bidAmount)
                  const aPreviousBid = Number(a.previousAuction?.bidAmount)
                  const aPrice = !isNaN(aBid)
                    ? aBid
                    : !isNaN(aPreviousBid)
                    ? aPreviousBid
                    : 0
                  const bBid = Number(bAuction?.bidAmount)
                  const bPreviousBid = Number(b.previousAuction?.bidAmount)
                  const bPrice = !isNaN(bBid)
                    ? bBid
                    : !isNaN(bPreviousBid)
                    ? bPreviousBid
                    : 0

                  return aPrice - bPrice
                }
              }

              return a.name.localeCompare(b.name)
            })
      ),
      shareReplay(1)
    )

    this.colorsCount$ = internalColors$.pipe(
      map((colors) => colors.length),
      shareReplay(1)
    )
    this.colors$ = combineLatest([internalColors$, this._numberOfItems]).pipe(
      map(([colors, numberOfItems]) => colors.slice(0, numberOfItems)),
      tap(() => this._loading.next(false)),
      shareReplay(1)
    )

    this._colors$.next(colorsFromStorage)

    this.getColorOwners()
    this.getAuctions()
    this.getPreviousAuctions()
    this.updateState()
  }

  initFromStorage() {
    try {
      const storedFavorites: string =
        localStorage.getItem(STORAGE_KEY_FAVORITES) ?? '[]'
      const favorites: number[] = JSON.parse(storedFavorites)
      this._favorites.next(favorites)
    } catch (e) {}
  }

  setView(view: ViewTypes) {
    this._view.next(view)
  }
  resetFilters() {
    this._category.next('all')
    this._searchTerm.next('')
    this._numberOfItems.next(12)
  }
  setCategory(category: ColorCategory) {
    this._category.next(category)
  }
  setFilter() {}
  setSortType(type: SortTypes) {
    this._sortType.next(type)
  }
  setSortDirection(direction: SortDirection) {
    this._sortDirection.next(direction)
  }
  setSearchString(searchTerm: string) {
    this._searchTerm.next(searchTerm)
  }

  setNumberOfItems(numberOfItems: number) {
    this._numberOfItems.next(numberOfItems)
  }
  setColorLoadingState(tokenId: number, loading: boolean) {
    const map = this._colorStates.value
    map.set(tokenId, loading)
    this._colorStates.next(map)
  }
  resetColorLoadingStates() {
    this._colorStates.next(new Map())
  }

  setFavorite(token_id: number, isFavorite: boolean) {
    let favorites = this._favorites.value
    if (isFavorite && !favorites.includes(token_id)) {
      favorites.push(token_id)
    } else if (!isFavorite) {
      favorites = favorites.filter((favorite) => favorite !== token_id)
    }
    this._favorites.next(favorites)
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites))
  }

  async getColorOwners() {
    const data = await this.http
      .get<RootObject[]>(`${environment.colorsBigmapUrl}`)
      .toPromise()

    const ownerInfo = new Map<number, string>()

    data
      .filter((d) => d.data.value !== null)
      .forEach((d) => {
        ownerInfo.set(
          Number(d.data.key.children[0].value),
          d.data.key.children[1].value
        )
      })

    if (!deepEqual(this._ownerInfo.value, ownerInfo)) {
      console.log('Owners: Not equal, updating')
      this._ownerInfo.next(ownerInfo)
      this._colorStates.next(new Map())
    } else {
      console.log('Owners: responses are equal')
    }
  }

  async getAuctions() {
    const data = await this.http
      .get<RootObject[]>(`${environment.auctionBigmapUrl}`)
      .toPromise()

    const auctionInfo = new Map<number, AuctionItem>()

    data.forEach((d) => {
      const value = d.data.value

      if (!value) {
        return
      }
      const tokenAddress = value.children[0].value
      const tokenId = Number(value.children[1].value)
      const tokenAmount = Number(value.children[2].value)
      const endTimestamp = this.getDate(value.children[3].value)
      const seller = value.children[4].value
      const bidAmount = value.children[5].value
      const bidder = value.children[6].value

      const auctionItem = {
        auctionId: Number(d.data.key_string),
        tokenAddress,
        tokenId,
        tokenAmount,
        endTimestamp,
        seller,
        bidAmount,
        bidder,
      }

      auctionInfo.set(tokenId, auctionItem)
    })

    // TODO: This will only update the "loading" state if the color was actually affected by the update
    // const currentAuction = this._auctionInfo.value
    // for (const key of currentAuction.keys()) {
    //   console.log('KEY,', key)
    //   if (deepEqual(currentAuction.get(key), auctionInfo.get(key))) {
    //     continue
    //   } else {
    //     console.log(`TOKEN "${key}" WAS UPDATED`)
    //     this.setColorLoadingState(key, false)
    //   }
    // }

    if (!deepEqual(this._auctionInfo.value, auctionInfo)) {
      console.log('Auctions: Not equal, updating')
      this._auctionInfo.next(auctionInfo)
      this._colorStates.next(new Map())
    } else {
      console.log('Auctions: responses are equal')
    }
  }

  async getPreviousAuctions() {
    // TODO: Add response type
    const data = await this.http
      .get<any>(
        `${environment.indexerUrl}auction/operations?status=applied&entrypoint=withdraw`
      )
      .toPromise()

    const previousAuctionInfo = new Map<number, PreviousAuctionItem>()

    data
      .filter((o: any) => o.entrypoint === 'withdraw')
      .forEach((o: any) => {
        const value = o.storage_diff?.children[0]?.children

        if (!value) {
          return
        }
        const tokenAddress = value[0].value
        const tokenId = Number(value[1].value)
        const tokenAmount = Number(value[2].value)
        const endTimestamp = this.getDate(value[3].value)
        const seller = value[4].value
        const bidAmount = value[5].value
        const bidder = value[6].value

        const auctionItem = {
          auctionId: Number(o.parameters.value),
          tokenAddress,
          tokenId,
          tokenAmount,
          endTimestamp,
          seller,
          bidAmount,
          bidder,
        }

        if (auctionItem.bidder !== auctionItem.seller) {
          // This check is here because otherwise the owner can "fake" the previous auction price
          previousAuctionInfo.set(tokenId, auctionItem)
        }
      })

    // TODO: This will only update the "loading" state if the color was actually affected by the update
    // const currentAuction = this._auctionInfo.value
    // for (const key of currentAuction.keys()) {
    //   console.log('KEY,', key)
    //   if (deepEqual(currentAuction.get(key), auctionInfo.get(key))) {
    //     continue
    //   } else {
    //     console.log(`TOKEN "${key}" WAS UPDATED`)
    //     this.setColorLoadingState(key, false)
    //   }
    // }

    if (!deepEqual(this._previousAuctionInfo.value, previousAuctionInfo)) {
      console.log('Previous Auctions: Not equal, updating')
      this._previousAuctionInfo.next(previousAuctionInfo)
      this._colorStates.next(new Map())
    } else {
      console.log('Previous Auctions: responses are equal')
    }
  }

  updateState() {
    let subscription = interval(10_000).subscribe((x) => {
      console.log('refresh')
      this.getColorOwners()
      this.getAuctions()
      this.getPreviousAuctions()
    })
  }

  private getDate(value: string): Date {
    const year = value.substring(0, 4).padStart(2, '0')
    const month = value.substring(5, 7).padStart(2, '0')
    const day = value.substring(8, 10).padStart(2, '0')
    const hour = value.substring(11, 13).padStart(2, '0')
    const minute = value.substring(14, 16).padStart(2, '0')
    const second = value.substring(17, 19).padStart(2, '0')

    const date = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
    )

    if (!isNaN(date.getTime())) {
      return date
    }
    throw new Error('CANNOT PARSE DATE')
  }
}
