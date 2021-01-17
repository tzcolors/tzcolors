import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { State } from './app.reducer'

import * as actions from './connect-wallet.actions'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'tzcolors'

  constructor(private readonly store$: Store<State>,) {

  }

  ngOnInit() {
    this.store$.dispatch(actions.setupBeacon())
  }
}
