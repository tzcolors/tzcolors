import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ActivityComponent } from './pages/activity/activity.component'
import { AuctionsComponent } from './pages/auctions/auctions.component'
import { ExploreComponent } from './pages/explore/explore.component'
import { LandingComponent } from './pages/landing/landing.component'
import { MyColorsComponent } from './pages/my-colors/my-colors.component'
import { WatchlistComponent } from './pages/watchlist/watchlist.component'
import { StatsComponent } from './pages/stats/stats.component'
import { TokenDetailComponent } from './pages/token-detail/token-detail.component'
import { AddressDetailComponent } from './pages/address-detail/address-detail.component'
import { StakingComponent } from './pages/staking/staking.component'

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'auctions', component: AuctionsComponent },
  { path: 'my-colors', component: MyColorsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'activity', component: ActivityComponent },
  { path: 'stats', component: StatsComponent },
  { path: 'address/:id', component: AddressDetailComponent },
  { path: 'color/:id', component: TokenDetailComponent },
  { path: 'staking', component: StakingComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
