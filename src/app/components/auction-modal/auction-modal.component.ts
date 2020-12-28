import { Component, OnInit } from '@angular/core'
import { BsModalRef } from 'ngx-bootstrap/modal'

@Component({
  selector: 'app-auction-modal',
  templateUrl: './auction-modal.component.html',
  styleUrls: ['./auction-modal.component.scss'],
})
export class AuctionModalComponent implements OnInit {
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {}
}
