import { Component, OnInit, Input } from '@angular/core'

import { BsModalService } from 'ngx-bootstrap/modal'
import { Color } from 'src/app/app.reducer'
import { AuctionModalComponent } from 'src/app/components/auction-modal/auction-modal.component'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { AuctionItem } from 'src/app/store.service'

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

  @Input()
  auction: AuctionItem | undefined

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
    if (this.auction && this.bidAmount) {
      this.beaconService.bid(this.auction.tokenId, this.bidAmount)
    }
  }

  withdraw() {
    if (this.auction) {
      // TODO: Remove hardcoded value
      this.beaconService.withdraw(2)
    }
  }

  auctionOverEvent() {
    // TODO: Trigger reload to make sure auction was not extended
    this.isOver = true
  }
}
