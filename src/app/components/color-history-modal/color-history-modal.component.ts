import { Component, Input, OnInit } from '@angular/core'

import { Color } from 'src/app/services/store/store.service'
import {
  AllAuctionsForTokenResponse,
  ApiService,
  HistoryItem,
} from 'src/app/services/api/api.service'
import { handleBCDBreakingChange, parseDate } from 'src/app/utils'

@Component({
  selector: 'app-history-modal',
  templateUrl: './color-history-modal.component.html',
  styleUrls: ['./color-history-modal.component.scss'],
})
export class ColorHistoryModalComponent implements OnInit {
  @Input()
  color: Color | undefined

  history:
    | {
        id: number
        bids: {
          id: string
          bid_amount: string
          bidder_id: string
          timestamp: string
        }[]
        bids_aggregate: {
          aggregate: {
            max: { bid_amount: number }
          }
        }
      }
    | undefined

  previousAuctionGraph = []
  previousAuctions: any[] = []

  colorScheme = {
    domain: ['#000000'],
  }

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.getHistory()
    this.getAuctions()
  }

  openAddress(address: string) {
    window.open(`https://tezblock.io/account/${address}`, '_blank')
  }

  public async getHistory() {
    if (this.color && this.color.auction) {
      this.history = (
        await this.api.getBidsForAuction(this.color.auction.auctionId)
      ).data.auctions[0]
    }
  }

  public async getAuctions() {
    if (this.color) {
      const response: AllAuctionsForTokenResponse =
        await this.api.getAllAuctionsForToken(this.color.token_id)
      console.log('ALL AUCTIONS', response)

      if (response.data.auctions.length === 0) {
        return
      }

      this.previousAuctions = response.data.auctions

      const series = response.data.auctions
        .map((a) => ({ ...a }))
        .reverse()
        .map((a, index: number) => {
          return {
            name: index === 0 ? 'initial' : `${index}.`,
            value: Number(a.bids[0].bid_amount) / 1_000_000,
          }
        })
        .filter((a) => a.value !== 0)

      this.previousAuctionGraph = [
        {
          name: 'Price',
          series: series,
        },
      ] as any
    }
  }
}
