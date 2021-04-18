import { Component, OnInit } from '@angular/core'
import { Color } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-staking-modal',
  templateUrl: './staking-modal.component.html',
  styleUrls: ['./staking-modal.component.scss'],
})
export class StakingModalComponent implements OnInit {
  color: Color | undefined
  categoryName: string = 'category'

  constructor() {}

  ngOnInit(): void {}
}
