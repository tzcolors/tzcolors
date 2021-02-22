import { HttpClient } from '@angular/common/http'
import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { NgxChartsModule } from '@swimlane/ngx-charts'

import { Color } from 'src/app/services/store/store.service'
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

@Component({
  selector: 'app-auction-modal',
  templateUrl: './color-history-modal.component.html',
  styleUrls: ['./color-history-modal.component.scss'],
})
export class ColorHistoryModalComponent implements OnInit {
  color: Color | undefined

  history: HistoryItem[] | undefined

  previousAuctions = [
    {
      name: '',
      series: [
        {
          name: 'initial',
          value: 10,
        },
        {
          name: '1st',
          value: 150,
        },
        {
          name: '2nd',
          value: 300,
        },
        {
          name: '4th ',
          value: 10,
        },
        {
          name: '5th ',
          value: 150,
        },
        {
          name: '6th ',
          value: 1000,
        },
      ],
    },
  ]

  colorScheme = {
    domain: ['#000000'],
  }

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getHistory()
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
}
