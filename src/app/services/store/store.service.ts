import { Injectable } from '@angular/core'
import {
  BehaviorSubject,
  combineLatest,
  interval,
  Observable,
  ReplaySubject,
} from 'rxjs'
import { HttpClient } from '@angular/common/http'
const MichelsonCodec = require('@taquito/local-forging/dist/lib/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')
import { Uint8ArrayConsumer } from '@taquito/local-forging'
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import { environment } from 'src/environments/environment'
import {
  auditTime,
  debounceTime,
  distinctUntilChanged,
  map,
  tap,
} from 'rxjs/operators'
import { AccountInfo } from '@airgap/beacon-sdk'

const colorsFromStorage: Color[] = require('../../../assets/colors.json')

export interface Color {
  name: string
  description: string
  symbol: string
  token_id: number
  category: string
  auction: AuctionItem | undefined
  owner: string | undefined
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

export type ViewTypes = 'explore' | 'auctions' | 'my-colors'

export type SortTypes = 'alphabetical' | 'price' | 'activity' | 'time'
export type SortDirection = 'asc' | 'desc'

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
    color.auction.bidder === accountInfo?.address
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

  private _colors$: ReplaySubject<Color[]> = new ReplaySubject(1)

  private _numberOfItems: BehaviorSubject<number> = new BehaviorSubject(12)
  private _searchTerm: BehaviorSubject<string> = new BehaviorSubject('')
  private _sortType: BehaviorSubject<SortTypes> = new BehaviorSubject<SortTypes>(
    'time'
  )
  private _sortDirection: BehaviorSubject<SortDirection> = new BehaviorSubject<SortDirection>(
    'desc'
  )
  private _category: BehaviorSubject<string | undefined> = new BehaviorSubject<
    string | undefined
  >(undefined)
  private _view: BehaviorSubject<ViewTypes> = new BehaviorSubject<ViewTypes>(
    'explore'
  )

  private _ownerInfo: BehaviorSubject<
    Map<number, string>
  > = new BehaviorSubject(new Map())
  private _auctionInfo: BehaviorSubject<
    Map<number, AuctionItem>
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

    this._loading.subscribe(console.warn)

    let temp$ = combineLatest([
      this._colors$.pipe(
        distinctUntilChanged(),
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
        distinctUntilChanged(),
        tap((x) => console.log('ownerInfo changed', x))
      ),
      this._auctionInfo.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('auctionInfo changed', x))
      ),
      this._accountInfo.pipe(
        distinctUntilChanged(),
        tap((x) => console.log('accountInfo changed', x))
      ),
    ]).pipe(
      distinctUntilChanged(),
      tap(([colors, category, view, ownerInfo, auctionInfo, accountInfo]) => {
        console.log('running TAP')
        this._loading.next(true)
      }),
      map(([colors, category, view, ownerInfo, auctionInfo, accountInfo]) =>
        colors
          .map((c) => ({
            ...c,
            auction: auctionInfo.get(c.token_id),
            owner: ownerInfo.get(c.token_id),
          }))
          .filter((c) =>
            view === 'explore'
              ? true
              : view === 'auctions'
              ? isActiveAuction(c)
              : view === 'my-colors'
              ? isOwner(c, accountInfo) ||
                isClaimable(c, accountInfo) ||
                isSeller(c, accountInfo)
              : true
          )
          .filter((c) => !category || (category && c.category === category))
      )
    )
    let internalColors$ = combineLatest([
      temp$,
      this._searchTerm,
      this._sortType,
      this._sortDirection,
    ]).pipe(
      map(([colors, searchTerm, sortType, sortDirection]) =>
        colors
          .filter((c) =>
            c.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          )
          .sort((a_, b_) => {
            const { a, b } =
              sortDirection === 'asc' ? { a: a_, b: b_ } : { a: b_, b: a_ }

            const aAuction = a.auction
            const bAuction = b.auction

            if (sortType === 'time') {
              if (aAuction && bAuction) {
                return (
                  (aAuction.endTimestamp?.getTime() ?? 0) -
                  (bAuction.endTimestamp?.getTime() ?? 0)
                )
              } else {
                return -1
              }
            } else if (sortType === 'price') {
              if (aAuction && bAuction) {
                return (
                  (Number(aAuction.bidAmount) ?? 0) -
                  (Number(bAuction.bidAmount) ?? 0)
                )
              } else {
                return -1
              }
            }

            return a.name.localeCompare(b.name)
          })
      ),
      tap(() => this._loading.next(false))
    )
    this.colorsCount$ = internalColors$.pipe(map((colors) => colors.length))
    this.colors$ = combineLatest([internalColors$, this._numberOfItems]).pipe(
      map(([colors, numberOfItems]) => colors.slice(0, numberOfItems))
    )

    this._colors$.next(colorsFromStorage)

    this.getColorOwners()
    this.getAuctions()
    this.updateState()
  }

  setView(view: ViewTypes) {
    this._view.next(view)
  }
  resetFilters() {
    this._category.next(undefined)
    this._searchTerm.next('')
    this._numberOfItems.next(12)
  }
  setCategory(category: string | undefined) {
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

  async getColorOwners() {
    const data = await this.http
      .get<RootObject[]>(
        `${environment.proxyUrl}${environment.colorsBigmapUrl}`
      )
      .toPromise()

    const ownerInfo = new Map<number, string>()

    data
      .filter((d) => d.data.value !== null)
      .forEach((d) => {
        const splits = d.data.key_string.split(' ')
        ownerInfo.set(
          Number(splits[1]),
          MichelsonCodec.addressDecoder(
            Uint8ArrayConsumer.fromHexString(splits[2].slice(2))
          )
        )
      })

    // TODO: Deep equal
    if (this._ownerInfo.value.size !== ownerInfo.size) {
      console.log('Owners: Size is not equal, updating')
      this._ownerInfo.next(ownerInfo)
    }
  }

  async getAuctions() {
    const data = await this.http
      .get<RootObject[]>(
        `${environment.proxyUrl}${environment.auctionBigmapUrl}`
      )
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
      const endTimestamp = new Date(value.children[3].value)
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

    // TODO: Deep equal
    if (this._auctionInfo.value.size !== auctionInfo.size) {
      console.log('Auctions: Size is not equal, updating')
      this._auctionInfo.next(auctionInfo)
    }
  }

  updateState() {
    let subscription = interval(10_000).subscribe((x) => {
      console.log('refresh')
      this.getColorOwners()
      this.getAuctions()
    })
  }
}
