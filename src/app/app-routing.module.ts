import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { LandingComponent } from './pages/landing/landing.component'

const routes: Routes = [{ path: '', component: LandingComponent }]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
