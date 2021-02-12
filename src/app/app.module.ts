import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AlertModule } from 'ngx-bootstrap/alert'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { CollapseModule } from 'ngx-bootstrap/collapse'
import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome'
import {
  faStar as farStar,
  faMoon as farMoon,
  faSun as farSun,
} from '@fortawesome/free-regular-svg-icons'
import {
  faStar as fasStar,
  faCog,
  faDog,
  faSortAmountUp,
  faSortAmountDown,
  faSortAlphaUp,
  faSortAlphaDown,
} from '@fortawesome/free-solid-svg-icons'

import { HeaderItemComponent } from './components/header-item/header-item.component'
import { LandingComponent } from './pages/landing/landing.component'
import { FooterItemComponent } from './components/footer-item/footer-item.component'
import { ColorCardItemComponent } from './components/color-card-item/color-card-item.component'
import { ExploreComponent } from './pages/explore/explore.component'
import { AuctionsComponent } from './pages/auctions/auctions.component'
import { MyColorsComponent } from './pages/my-colors/my-colors.component'
import { AuctionModalComponent } from './components/auction-modal/auction-modal.component'
import { StoreModule } from '@ngrx/store'
import { reducers, metaReducers } from './reducers'
import { EffectsModule } from '@ngrx/effects'
import { AppEffects } from './app.effects'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { environment } from '../environments/environment'
import { ConnectWalletEffects } from './connect-wallet.effects'
import { FormsModule } from '@angular/forms'
import { ShortenPipe } from './pipes/shorten.pipe'
import { AmountConverterPipe } from './pipes/amount.pipe'
import { CountdownComponent } from './components/countdown/countdown.component'
import { ColorCardListComponent } from './components/color-card-list/color-card-list.component'

@NgModule({
  declarations: [
    AppComponent,
    HeaderItemComponent,
    LandingComponent,
    FooterItemComponent,
    ColorCardItemComponent,
    ExploreComponent,
    AuctionsComponent,
    MyColorsComponent,
    AuctionModalComponent,
    ShortenPipe,
    AmountConverterPipe,
    CountdownComponent,
    ColorCardListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    FontAwesomeModule,
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    StoreModule.forRoot(reducers, {
      metaReducers,
    }),
    EffectsModule.forRoot([AppEffects, ConnectWalletEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent, BsModalService],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(fasStar, faCog, faDog)
    library.addIcons(
      farStar,
      farMoon,
      farSun,
      faSortAmountUp,
      faSortAmountDown,
      faSortAlphaUp,
      faSortAlphaDown
    )
  }
}
