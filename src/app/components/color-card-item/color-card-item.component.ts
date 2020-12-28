import { Component, OnInit, Input } from '@angular/core'

import { BsModalService } from 'ngx-bootstrap/modal'
import { AuctionModalComponent } from 'src/app/components/auction-modal/auction-modal.component'

@Component({
  selector: 'app-color-card-item',
  templateUrl: './color-card-item.component.html',
  styleUrls: ['./color-card-item.component.scss'],
})
export class ColorCardItemComponent implements OnInit {
  @Input()
  isOwned: boolean = false

  constructor(private readonly modalService: BsModalService) {}

  ngOnInit(): void {}

  openAuctionModal() {
    const modalRef = this.modalService.show(AuctionModalComponent, {
      class: 'modal-lg modal-dialog-centered',
    })
  }
}
