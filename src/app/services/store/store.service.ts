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
import {
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  tap,
} from 'rxjs/operators'
import { AccountInfo } from '@airgap/beacon-sdk'
import { ApiService } from '../api/api.service'
import { wrapApiRequest } from 'src/app/utils'
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
  lastBidAmount: number
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
  endTimestamp: Date // TODO: Remove
  end_timestamp: Date
  seller: string
  bidAmount: string // TODO: Remove
  bid_amount: string
  numberOfBids: number
  bidder: string
  status: string
}

export interface PreviousAuctionItem {
  auctionId: number
  tokenAddress: string
  tokenId: number
  tokenAmount: number
  endTimestamp: Date
  seller: string
  bidAmount: string // TODO: Remove
  bid_amount: string
  bidder: string
}

interface TokenInfo {
  owner: string
  lastBidAmount: number
  auction: AuctionItem | undefined
}

export type ViewTypes =
  | 'explore'
  | 'auctions'
  | 'my-colors'
  | 'watchlist'
  | 'address'

export type ColorCategory = 'all' | 'legendary' | 'epic' | 'standard'

export type SortTypes = 'name' | 'price' | 'activity' | 'time' | 'bids'
export type SortDirection = 'asc' | 'desc'

const STORAGE_KEY_FAVORITES = 'tzcolor:favorites'

export const isOwner = (color: Color, accountInfo?: AccountInfo) => {
  return color.owner && color.owner === accountInfo?.address
}

export const isActiveAuction = (color: Color) => {
  return (
    color.auction &&
    new Date(color.auction.end_timestamp).getTime() > new Date().getTime()
  )
}

export const isClaimable = (color: Color, accountInfo?: AccountInfo) => {
  return (
    !!color.auction &&
    new Date(color.auction.end_timestamp).getTime() < new Date().getTime() &&
    (color.auction.bidder === accountInfo?.address ||
      color.auction.seller === accountInfo?.address) &&
    color.auction.status === '0' // "0" means "unclaimed"
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
    Map<number, TokenInfo>
  > = new BehaviorSubject(new Map())
  private _auctionInfo: BehaviorSubject<
    Map<number, AuctionItem>
  > = new BehaviorSubject(new Map())
  private _previousAuctionInfo: BehaviorSubject<
    Map<number, PreviousAuctionItem>
  > = new BehaviorSubject(new Map())
  private _auctionBids: BehaviorSubject<
    Map<number, number>
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
    private readonly store$: Store<State>,
    private readonly api: ApiService
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
      this._auctionBids.pipe(
        // distinctUntilChanged(),
        tap((x) => console.log('auctionBids changed', x))
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
          auctionBids,
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
          Map<number, TokenInfo>,
          Map<number, AuctionItem>,
          Map<number, PreviousAuctionItem>,
          Map<number, number>,
          Map<number, boolean>,
          number[],
          AccountInfo | undefined,
          string,
          SortTypes,
          SortDirection
        ]) =>
          colors
            .map((c) => {
              const tokenInfo = ownerInfo.get(c.token_id)

              return {
                ...c,
                auction: tokenInfo?.auction,
                owner: tokenInfo?.owner,
                loading: colorStates.get(c.token_id) ?? false,
                isFavorite: favorites.includes(c.token_id), // TODO: use map
                previousAuction: previousAuctionInfo.get(c.token_id),
                lastBidAmount: tokenInfo?.lastBidAmount ?? 0,
              }
            })
            .filter((c) =>
              view === 'explore' || view === 'address'
                ? true
                : view === 'watchlist'
                ? c.isFavorite
                : view === 'auctions'
                ? isActiveAuction(c)
                : view === 'my-colors'
                ? isOwner(c, accountInfo) ||
                  isClaimable(c, accountInfo) ||
                  (isActiveAuction(c) && isSeller(c, accountInfo))
                : true
            )
            .filter((c) => category === 'all' || c.category === category)
            .filter(
              (c) =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.owner?.toLowerCase() === searchTerm.toLowerCase() ||
                (c.auction &&
                  c.auction.endTimestamp > new Date() &&
                  c.auction.bidder.toLowerCase() ===
                    searchTerm.toLowerCase()) ||
                (c.auction &&
                  c.auction.endTimestamp > new Date() &&
                  c.auction.seller.toLowerCase() === searchTerm.toLowerCase())
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
              } else if (sortType === 'bids') {
                if (aAuction && bAuction) {
                  return (
                    (Number(aAuction.numberOfBids) ?? 0) -
                    (Number(bAuction.numberOfBids) ?? 0)
                  )
                } else {
                  return -1
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

              return a.token_id - b.token_id
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
    const holders = await this.api.getAllHolders()
    console.log('OWNERS', holders)

    const info = holders.data.tokens.map((el) => {
      const auction = el.auction_infos[0].auction
      return {
        tokenId: el.id,
        address: el.holder.address,
        lastBidAmount: el.last_bid_amount,
        auction: {
          key: auction.id,
          auctionId: auction.id,
          tokenAddress: 'tz1...',
          tokenId: auction.token_id,
          tokenAmount: Number(1),
          endTimestamp: new Date(auction.end_timestamp),
          end_timestamp: new Date(auction.end_timestamp),
          numberOfBids: Number(auction.bid_count),
          seller: auction.seller.address,
          bidAmount: auction.bid_amount.toString(),
          bid_amount: auction.bid_amount.toString(),
          bidder: auction.bidder.address,
          status: auction.status,
        },
      }
    })
    const ownerInfo = new Map(this._ownerInfo.value)

    info.forEach((d) => {
      ownerInfo.set(Number(d.tokenId), {
        owner: d.address,
        lastBidAmount: d.lastBidAmount,
        auction: d.auction,
      })
    })

    if (!deepEqual(this._ownerInfo.value, ownerInfo)) {
      console.log(
        'Owners: Not equal, updating',
        this._ownerInfo.value.size,
        ownerInfo.size
      )
      this._ownerInfo.next(ownerInfo)
      this._colorStates.next(new Map())
    } else {
      console.log(
        'Owners: responses are equal',
        this._ownerInfo.value.size,
        ownerInfo.size
      )
    }
  }

  updateState() {
    wrapApiRequest('getColorOwners', () => {
      return this.getColorOwners()
    })

    let subscription = interval(30_000).subscribe((x) => {
      console.log('refresh')
      wrapApiRequest('getColorOwners', () => {
        return this.getColorOwners()
      })
    })
  }
}
