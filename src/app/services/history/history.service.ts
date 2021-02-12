import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { environment } from 'src/environments/environment'
import { StoreService } from '../store/store.service'

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

export interface Operation {
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

export interface HistoryResponse {
  operations: Operation[]
  last_id: string
}

export interface BidObject {}

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  history$: Observable<Operation[]>
  bids$: Observable<Operation[]>

  private _history: ReplaySubject<Operation[]> = new ReplaySubject(1)
  private _bids: ReplaySubject<Operation[]> = new ReplaySubject(1)
  private _lastResponse: HistoryResponse | undefined

  constructor(
    private readonly http: HttpClient,
    private readonly storeService: StoreService
  ) {
    this.history$ = this._history.asObservable()
    this.bids$ = this._bids.asObservable()

    this.getContractHistory()
  }

  async getContractHistory(): Promise<void> {
    const data = await this.http
      .get<HistoryResponse>(
        `${environment.proxyUrl}https://better-call.dev/v1/contract/mainnet/${environment.tzColorsAuctionContract}/operations?with_storage_diff=true`
      )
      .toPromise()

    this._lastResponse = data

    this._history.next(data.operations)

    let bids = data.operations.filter((op) => op.entrypoint === 'bid')

    this._bids.next(bids)

    console.log(data)
  }
}
