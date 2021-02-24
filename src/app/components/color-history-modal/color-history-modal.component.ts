import { HttpClient } from '@angular/common/http'
import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { NgxChartsModule } from '@swimlane/ngx-charts'

import { Color } from 'src/app/services/store/store.service'
import { environment } from 'src/environments/environment'
import { ApiService } from 'src/app/services/api/api.service'

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

@Component({
  selector: 'app-auction-modal',
  templateUrl: './color-history-modal.component.html',
  styleUrls: ['./color-history-modal.component.scss'],
})
export class ColorHistoryModalComponent implements OnInit {
  color: Color | undefined

  history: HistoryItem[] | undefined

  previousAuctionGraph = []
  previousAuctions: any[] = []

  colorScheme = {
    domain: ['#000000'],
  }

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private readonly http: HttpClient,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.getHistory()
    this.getAuctions()
  }

  openAddress(address: string) {
    window.open(`https://tezblock.io/account/${address}`, '_blank')
  }

  public async getHistory() {
    if (this.color && this.color.auction) {
      this.history = await this.http
        .get<HistoryItem[]>(
          `${environment.indexerUrl}auction/operations?entrypoint=bid&parameters.value=${this.color.auction.auctionId}`
        )
        .toPromise()
    }
  }

  public async getAuctions() {
    if (this.color) {
      const auctions: any = await this.api.getAllAuctionsForToken(
        this.color.token_id
      )
      const maxBids: any = await this.api.getMaxBidForAllAuctions()

      if (auctions.length === 0) {
        return
      }

      this.previousAuctions = auctions.map((a: any) => {
        a.maxBid = maxBids[a.parameters.children[0].value] ?? 0
        a.ask = a.parameters.children[1].value
        return a
      })

      const series = auctions
        .reverse()
        .map((a: any) => {
          return a.parameters.children[0].value
        })
        .map((a: any, index: number) => {
          return {
            name: index === 0 ? 'initial' : `${index}.`,
            value: (maxBids[a] ?? 0) / 1_000_000,
          }
        })

      this.previousAuctionGraph = [
        {
          name: '',
          series: series,
        },
      ] as any
    }
  }
}
