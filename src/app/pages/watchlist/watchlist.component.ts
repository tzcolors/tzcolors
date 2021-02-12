import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { Color, StoreService } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()
  public colorsCount$: Observable<number> = new Observable()

  constructor(private readonly storeService: StoreService) {
    this.storeService.setView('watchlist')
    this.storeService.setSortType('name')
    this.storeService.setSortDirection('asc')
    this.storeService.setSearchString('')
    this.colors$ = this.storeService.colors$
    this.colorsCount$ = this.storeService.colorsCount$
  }

  ngOnInit(): void {}
}
