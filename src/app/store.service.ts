import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
const MichelsonCodec = require('@taquito/local-forging/dist/lib/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')
import { Uint8ArrayConsumer } from '@taquito/local-forging'

const colors: Color[] = require('../assets/colors.json')

export interface Color {
  name: string
  description: string
  symbol: string
  token_id: number
  category: string
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
  tokenAddress: string
  tokenId: number
  tokenAmount: number
  endTimestamp: Date
  seller: string
  bidAmount: string
  bidder: string
  color: Color
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public colors$: Observable<Color[]>
  public myColors$: Observable<Color[]>
  public auctions$: Observable<AuctionItem[]>

  private _colors$: ReplaySubject<Color[]> = new ReplaySubject(1)
  private _myColors$: ReplaySubject<Color[]> = new ReplaySubject(1)
  private _auctions$: ReplaySubject<AuctionItem[]> = new ReplaySubject(1)

  constructor(private readonly http: HttpClient) {
    this.colors$ = this._colors$.asObservable()
    this.myColors$ = this._myColors$.asObservable()
    this.auctions$ = this._auctions$.asObservable()

    this._colors$.next(colors)

    this.getColorOwners()
    this.getAuctions()
  }

  async getColorOwners() {
    const data = await this.http
      .get<RootObject[]>(
        'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://better-call.dev/v1/bigmap/delphinet/35646/keys?q=&offset=0'
      )
      .toPromise()

    const filteredData = data
      .filter((d) => d.data.value !== null)
      .map((d) => {
        const splits = d.data.key_string.split(' ')
        return {
          address: MichelsonCodec.addressDecoder(
            Uint8ArrayConsumer.fromHexString(splits[2].slice(2))
          ),
          tokenId: Number(splits[1]),
        }
      })

    const myColors: Color[] = []
    filteredData.forEach((data) => {
      if (data.address === 'tz1Mj7RzPmMAqDUNFBn5t5VbXmWW4cSUAdtT') {
        // TODO: Replace with own address
        const color = colors.find((c) => c.token_id === data.tokenId)
        if (color) {
          myColors.push(color)
        }
      }
    })

    this._myColors$.next(myColors)

    console.log(filteredData)
  }

  async getAuctions() {
    const data = await this.http
      .get<RootObject[]>(
        'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=https://better-call.dev/v1/bigmap/delphinet/35649/keys?q=&offset=0'
      )
      .toPromise()

    const auctions: AuctionItem[] = []
    data.forEach((d) => {
      const tokenAddress = d.data.value.children[0].value
      const tokenId = Number(d.data.value.children[1].value)
      const tokenAmount = Number(d.data.value.children[2].value)
      const endTimestamp = new Date(d.data.value.children[3].value)
      const seller = d.data.value.children[4].value
      const bidAmount = d.data.value.children[5].value
      const bidder = d.data.value.children[6].value

      const color = colors.find((c) => c.token_id === tokenId)
      if (color) {
        let auction: AuctionItem = {
          tokenAddress,
          tokenId,
          tokenAmount,
          endTimestamp,
          seller,
          bidAmount,
          bidder,
          color,
        }
        auctions.push(auction)
      }
    })

    this._auctions$.next(auctions)
  }
}
