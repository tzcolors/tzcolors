import { Component, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'
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

  constructor(
    public bsModalRef: BsModalRef,
    private readonly beaconService: BeaconService
  ) {}

  ngOnInit(): void {}

  createAuction() {
    if (this.color) {
      this.beaconService.createAuction(this.color.token_id, '100000', '5')
    }
  }
}
