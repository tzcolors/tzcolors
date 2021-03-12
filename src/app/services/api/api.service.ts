import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

export interface Result {
  consumed_gas: number
  storage_size: number
  paid_storage_size_diff?: number
}

export interface Child4 {
  prim: string
  type: string
  name: string
  value: string
}

export interface Child3 {
  prim: string
  type: string
  children: Child4[]
}

export interface Child2 {
  prim: string
  type: string
  value: string
  name: string
  children: Child3[]
}

export interface Child {
  prim: string
  type: string
  name: string
  value: string
  children: Child2[]
}

export interface Parameters {
  prim: string
  type: string
  value: string
  children: Child[]
  name: string
}

export interface Child6 {
  prim: string
  type: string
  name: string
  value: any
  from: string
  diff_type: string
}

export interface Child5 {
  prim: string
  type: string
  name: string
  children: Child6[]
  value: any
  diff_type: string
}

export interface StorageDiff {
  prim: string
  type: string
  children: Child5[]
}

export interface HistoryItem {
  level: number
  fee: number
  counter: number
  gas_limit: number
  amount: number
  content_index: number
  result: Result
  parameters: Parameters
  storage_diff: StorageDiff
  timestamp: Date
  id: string
  protocol: string
  hash: string
  network: string
  kind: string
  source: string
  destination: string
  status: string
  entrypoint: string
  internal: boolean
  mempool: boolean
  storage_limit?: number
  burned?: number
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getAllBidsForAllAuctions() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/count?entrypoint=bid&groupBy=storage_diff.children.0.name`
      )
      .toPromise()
  }
  getMaxBidForAllAuctions() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/max?entrypoint=bid&groupBy=storage_diff.children.0.name`
      )
      .toPromise()
  }
  getMaxBidForAllTokens() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/max?entrypoint=bid&groupBy=storage_diff.children.0.children.1.value`
      )
      .toPromise()
  }
  getBidCountForAllTokens() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/count?entrypoint=bid&groupBy=storage_diff.children.0.children.1.value`
      )
      .toPromise()
  }
  getAllAuctionsForToken(tokenId: number) {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations?entrypoint=create_auction&parameters.children.5.value=${tokenId}`
      )
      .toPromise()
  }
  getBidsForAuction(auctionId: number) {
    return this.http
      .get<HistoryItem[]>(
        `${environment.indexerUrl}auction/operations?entrypoint=bid&parameters.value=${auctionId}`
      )
      .toPromise()
  }

  getOperationCount(entrypoint?: string) {
    const params = entrypoint ? `?entrypoint=${entrypoint}` : ``
    return this.http
      .get<number>(`${environment.indexerUrl}auction/operations/count${params}`)
      .toPromise()
  }

  getSum(field?: string) {
    const params = field ? `?aggregate=${field}` : ``
    return this.http
      .get<number>(`${environment.indexerUrl}auction/operations/sum${params}`)
      .toPromise()
  }

  getOperationsSince(from: number) {
    const params = from ? `?from=${from}` : `?`
    return this.http
      .get<any>(
        `https://api.better-call.dev/v1/contract/mainnet/${environment.tzColorsAuctionContract}/operations${params}&with_storage_diff=true&status=applied&size=20`
      )
      .toPromise()
  }
}
