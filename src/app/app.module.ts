import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AlertModule } from 'ngx-bootstrap/alert';
import { HeaderItemComponent } from './components/header-item/header-item.component';
import { LandingComponent } from './pages/landing/landing.component';

@NgModule({
  declarations: [AppComponent, HeaderItemComponent, LandingComponent],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, AlertModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
