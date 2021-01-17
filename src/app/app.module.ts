import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AlertModule } from 'ngx-bootstrap/alert'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { CollapseModule } from 'ngx-bootstrap/collapse'

import { HeaderItemComponent } from './components/header-item/header-item.component'
import { LandingComponent } from './pages/landing/landing.component'
import { FooterItemComponent } from './components/footer-item/footer-item.component'
import { ColorCardItemComponent } from './components/color-card-item/color-card-item.component'
import { ExploreComponent } from './pages/explore/explore.component'
import { AuctionsComponent } from './pages/auctions/auctions.component'
import { MyColorsComponent } from './pages/my-colors/my-colors.component'
import { AuctionModalComponent } from './components/auction-modal/auction-modal.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { ConnectWalletEffects } from './connect-wallet.effects'

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    CollapseModule.forRoot(),
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    EffectsModule.forRoot([AppEffects, ConnectWalletEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [],
  bootstrap: [AppComponent, BsModalService],
})
export class AppModule { }
