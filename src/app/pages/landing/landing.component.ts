import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Color, StoreService } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()
  public colorsCount$: Observable<number> = new Observable()

  constructor(private readonly storeService: StoreService) {
    this.storeService.resetFilters()
    this.storeService.setView('auctions')
    this.storeService.setSortType('time')
    this.storeService.setSortDirection('asc')
    this.storeService.setSearchString('')
    this.colors$ = this.storeService.colors$.pipe(map((m) => m.slice(0, 7)))
    this.colorsCount$ = this.storeService.colorsCount$
  }

  ngOnInit(): void {}
}
