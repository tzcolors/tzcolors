import { Component, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
import { BeaconService } from 'src/app/services/beacon/beacon.service'
import { Color } from 'src/app/store.service'

@Component({
  selector: 'app-auction-modal',
  templateUrl: './auction-modal.component.html',
  styleUrls: ['./auction-modal.component.scss'],
})
export class AuctionModalComponent implements OnInit {
  color: Color | undefined
  categoryName: string = 'category'

  constructor(
    public bsModalRef: BsModalRef,
    private readonly beaconService: BeaconService
  ) {}

  ngOnInit(): void {}

  createAuction() {
    this.beaconService.createAuction(4, '1000000', '5')
  }
}
