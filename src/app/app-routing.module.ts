import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ActivityComponent } from './pages/activity/activity.component'
import { AuctionsComponent } from './pages/auctions/auctions.component'
import { ExploreComponent } from './pages/explore/explore.component'
import { LandingComponent } from './pages/landing/landing.component'
import { MyColorsComponent } from './pages/my-colors/my-colors.component'
import { WatchlistComponent } from './pages/watchlist/watchlist.component'

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'auctions', component: AuctionsComponent },
  { path: 'my-colors', component: MyColorsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'activity', component: ActivityComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
