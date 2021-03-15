import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { State } from './app.reducer'

import * as actions from './connect-wallet.actions'
import { IdleService } from './services/idle/idle.service'
import { StoreService } from './services/store/store.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'tzcolors'
  dogvision = false

  constructor(
    private readonly store$: Store<State>,
    private readonly store: StoreService,
    private readonly idle: IdleService
  ) {}

  ngOnInit() {
    this.store$.dispatch(actions.setupBeacon())
    this.store.dogvision$.subscribe((dogvision) => (this.dogvision = dogvision))
    this.idle.start()
  }
}
