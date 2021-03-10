import { Component, OnInit } from '@angular/core'
import BigNumber from 'bignumber.js'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { Color } from 'src/app/services/store/store.service'
import * as bs58check from 'bs58check'

function getDecoded(address: string) {
  try {
    return bs58check.decode(address)
  } catch (e) {
    // if decoding fails, assume invalid address
    return null
  }
}

export enum AuctionModalType {
  AUCTION,
  SEND,
}

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

  addressError: string = ''

  sendingRecipient: string = ''
  modalType: typeof AuctionModalType = AuctionModalType

  type: AuctionModalType = AuctionModalType.AUCTION

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private readonly beaconService: BeaconService
  ) {}

  ngOnInit(): void {}

  async createAuction() {
    if ((await this.validateAuction()) && this.color && this.color.owner) {
      this.beaconService.createAuction(
        this.color.owner,
        this.color.token_id,
        this.bidAmount,
        this.durationDays
      )
      this.modalService.hide()
    }
  }

  async send() {
    if ((await this.validateSend()) && this.color && this.color.owner) {
      this.beaconService.sendColor(
        this.color.owner,
        this.sendingRecipient,
        this.color.token_id
      )
      this.modalService.hide()
    }
  }

  async validateSend(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const address = this.sendingRecipient

        const prefixes = ['tz1', 'tz2', 'tz3']

        var decoded = getDecoded(address)

        if (
          !prefixes.some((p) =>
            address.toLowerCase().startsWith(p.toLowerCase())
          )
        ) {
          this.addressError = 'Address needs to start with tz..'
          return resolve(false)
        }
        if (!decoded) {
          this.addressError = 'Address seems to be invalid.'
          return resolve(false)
        }
        if (decoded.length !== 23) {
          this.addressError = 'Address is either too long or too short.'
          return resolve(false)
        }

        this.addressError = ''
        return resolve(true)
      }, 0)
    })
  }

  async validateAuction(): Promise<boolean> {
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
