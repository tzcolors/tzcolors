import { Injectable } from '@angular/core'
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
const MichelsonCodec = require('@taquito/local-forging/dist/lib/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')
import { Uint8ArrayConsumer } from '@taquito/local-forging'
import { Store } from '@ngrx/store'
import { State } from 'src/app/app.reducer'
import { environment } from 'src/environments/environment'
import { map } from 'rxjs/operators'
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
  value: Value
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

export type SortTypes = 'alphabetical' | 'price' | 'activity'
export type SortDirection = 'asc' | 'desc'

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public colors$: Observable<Color[]>
  public colorsCount$: Observable<number>

  private _colors$: ReplaySubject<Color[]> = new ReplaySubject(1)

  private _numberOfItems: BehaviorSubject<number> = new BehaviorSubject(12)
  private _searchTerm: BehaviorSubject<string> = new BehaviorSubject('')
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

    let internalColors$ = combineLatest([
      this._colors$,
      this._searchTerm,
      this._category,
      this._view,
      this._ownerInfo,
      this._auctionInfo,
    ]).pipe(
      map(([colors, searchTerm, category, view, ownerInfo, auctionInfo]) =>
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
              ? !!c.auction
              : view === 'my-colors'
              ? c.owner && c.owner === this._accountInfo.value?.address
              : true
          )
          .filter((c) => !category || (category && c.category === category))
          .filter((c) =>
            c.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          )
      )
    )
    this.colorsCount$ = internalColors$.pipe(map((colors) => colors.length))
    this.colors$ = combineLatest([internalColors$, this._numberOfItems]).pipe(
      map(([colors, numberOfItems]) => colors.slice(0, numberOfItems))
    )

    this._colors$.next(colorsFromStorage)

    this.getColorOwners()
    this.getAuctions()
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
  setSort() {}
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

    this._ownerInfo.next(ownerInfo)
  }

  async getAuctions() {
    const data = await this.http
      .get<RootObject[]>(
        `${environment.proxyUrl}${environment.auctionBigmapUrl}`
      )
      .toPromise()

    const auctionInfo = new Map<number, AuctionItem>()

    data.forEach((d) => {
      const tokenAddress = d.data.value.children[0].value
      const tokenId = Number(d.data.value.children[1].value)
      const tokenAmount = Number(d.data.value.children[2].value)
      const endTimestamp = new Date(d.data.value.children[3].value)
      const seller = d.data.value.children[4].value
      const bidAmount = d.data.value.children[5].value
      const bidder = d.data.value.children[6].value

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

    this._auctionInfo.next(auctionInfo)
  }
}
