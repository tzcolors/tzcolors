import { Component, OnInit, Input } from '@angular/core'

import { BsModalService } from 'ngx-bootstrap/modal'
import { Color } from 'src/app/app.reducer'
import { AuctionModalComponent } from 'src/app/components/auction-modal/auction-modal.component'

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

  categoryName: 'Epic' | 'Rare' | 'Common' = 'Common'

  constructor(private readonly modalService: BsModalService) {}

  ngOnInit(): void {
    if (this.color?.category === 'E') {
      this.categoryName = 'Epic'
    }
    if (this.color?.category === 'R') {
      this.categoryName = 'Rare'
    }
  }

  openAuctionModal() {
    const modalRef = this.modalService.show(AuctionModalComponent, {
      class: 'modal-lg modal-dialog-centered',
    })
  }
}
