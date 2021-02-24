import { Component, OnInit } from '@angular/core'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'

import { Color } from 'src/app/services/store/store.service'
import { ApiService, HistoryItem } from 'src/app/services/api/api.service'

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
      this.history = await this.api.getBidsForAuction(
        this.color.auction.auctionId
      )
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

      auctions.forEach(async (a: any) => {
        a.bids = await this.api.getBidsForAuction(
          a.parameters.children[0].value
        )
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
