import { Component, OnInit, Input } from '@angular/core'
import BigNumber from 'bignumber.js'

import { BsModalService } from 'ngx-bootstrap/modal'
import { AuctionModalComponent } from 'src/app/components/auction-modal/auction-modal.component'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { Color } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-color-card-item',
  templateUrl: './color-card-item.component.html',
  styleUrls: ['./color-card-item.component.scss'],
})
export class ColorCardItemComponent implements OnInit {
  @Input()
  color: Color | undefined

  @Input()
  isOwned: boolean = false

  @Input()
  isAuction: boolean = false

  bidAmount: string | undefined

  categoryName: 'legendary' | 'epic' | 'Standard' = 'Standard'

  isOver: boolean = false

  constructor(
    private readonly modalService: BsModalService,
    private readonly beaconService: BeaconService
  ) {}

  ngOnInit(): void {
    if (this.color?.category === 'E') {
      this.categoryName = 'legendary'
    }
    if (this.color?.category === 'R') {
      this.categoryName = 'epic'
    }

    if (this.color && this.color.auction) {
      this.bidAmount = new BigNumber(this.color.auction.bidAmount)
        .plus(100_000)
        .shiftedBy(-6)
        .toString()
    }
  }

  openAuctionModal() {
    if (!this.color) {
      return
    }
    const modalRef = this.modalService.show(AuctionModalComponent, {
      initialState: {
        color: this.color,
      },
      class: 'modal-lg modal-dialog-centered',
    })
  }

  bid() {
    if (this.color && this.color.auction && this.bidAmount) {
      const bidAmount = new BigNumber(this.bidAmount).shiftedBy(6).toString()
      this.beaconService.bid(this.color.auction.auctionId, bidAmount)
    }
  }

  claim() {
    if (this.color && this.color.auction) {
      this.beaconService.claim(this.color.auction.auctionId)
    }
  }

  createInitialAuction() {
    if (this.color) {
      this.beaconService.createInitialAuction(this.color.token_id)
    }
  }

  auctionOverEvent() {
    // TODO: Trigger reload to make sure auction was not extended
    this.isOver = true
  }
}
