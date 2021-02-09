import { Component, OnInit } from '@angular/core'
import BigNumber from 'bignumber.js'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { Color } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-auction-modal',
  templateUrl: './auction-modal.component.html',
  styleUrls: ['./auction-modal.component.scss'],
})
export class AuctionModalComponent implements OnInit {
  color: Color | undefined
  categoryName: string = 'category'

  bidAmount: string = '0.1'
  durationDays: string = '1'

  amountError: string = ''
  durationError: string = ''

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private readonly beaconService: BeaconService
  ) {}

  ngOnInit(): void {}

  async createAuction() {
    if ((await this.validate()) && this.color && this.color.owner) {
      this.beaconService.createAuction(
        this.color.owner,
        this.color.token_id,
        this.bidAmount,
        this.durationDays
      )
      this.modalService.hide()
    }
  }

  async validate(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const amount = new BigNumber(this.bidAmount)
        if (!amount.multipliedBy(10).modulo(1).eq(0)) {
          this.amountError = 'Amount is not a multiple of 0.1'
        } else if (amount.lt(0.1)) {
          this.amountError = 'Amount is lower than 0.1'
        } else {
          this.amountError = ''
        }

        const duration = new BigNumber(this.durationDays)
        if (duration.lt(0.5)) {
          this.durationError = 'Duration is lower than 0.5 days'
        } else if (duration.gt(7)) {
          this.durationError = 'Duration is higher than 7 days'
        } else {
          this.durationError = ''
        }

        resolve(!(Boolean(this.amountError) || Boolean(this.durationError)))
      }, 0)
    })
  }
}
