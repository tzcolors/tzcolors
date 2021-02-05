import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  Color,
  ColorCategory,
  SortDirection,
  SortTypes,
  StoreService,
} from 'src/app/services/store/store.service'

import {
  faSortAlphaDown,
  faSortAlphaUp,
  faSortAmountDown,
  faSortAmountUp,
} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-color-card-list',
  templateUrl: './color-card-list.component.html',
  styleUrls: ['./color-card-list.component.scss'],
})
export class ColorCardListComponent implements OnInit {
  faSortAlphaDown = faSortAlphaDown
  faSortAlphaUp = faSortAlphaUp
  faSortAmountDown = faSortAmountDown
  faSortAmountUp = faSortAmountUp

  @Input()
  public colors$: Observable<Color[]> = new Observable()

  @Input()
  public title: string = 'Colors'

  @Input()
  public emptyText: string = 'There is nothing here yet!'

  @Input()
  public count$: Observable<number> = new Observable()

  searchString: string = ''

  itemsPerPage: number = 24
  numberOfItems: number = 12

  showMoreButton: Observable<boolean> = new BehaviorSubject<boolean>(
    true
  ).asObservable()

  sortType$: Observable<SortTypes>
  sortDirection$: Observable<SortDirection>
  category$: Observable<ColorCategory>

  loading$: Observable<boolean>

  constructor(private readonly storeService: StoreService) {
    this.storeService.setNumberOfItems(this.numberOfItems)
    this.sortType$ = this.storeService.sortType$
    this.sortDirection$ = this.storeService.sortDirection$
    this.category$ = this.storeService.category$
    this.loading$ = this.storeService.loading$
  }

  ngOnInit(): void {
    this.showMoreButton = this.count$.pipe(
      map((count) => count > this.numberOfItems)
    )
  }

  setCategory(oldCategory: ColorCategory, category: ColorCategory): void {
    if (oldCategory === category) {
      this.storeService.setCategory('all')
    } else {
      this.storeService.setCategory(category)
    }
  }

  sortType(type: SortTypes) {
    this.storeService.setSortType(type)
  }
  sortDirection(oldDirection: SortDirection, newDirection: SortDirection) {
    if (oldDirection === 'asc') {
      this.storeService.setSortDirection('desc')
    } else {
      this.storeService.setSortDirection('asc')
    }
  }

  clearFilters(): void {
    this.storeService.resetFilters()
  }

  textInput(_ev: any) {
    setTimeout(() => {
      this.storeService.setSearchString(this.searchString)
    }, 0)
  }

  showMoreItems() {
    this.numberOfItems += this.itemsPerPage
    this.storeService.setNumberOfItems(this.numberOfItems)
    this.showMoreButton = this.count$.pipe(
      map((count) => count > this.numberOfItems)
    ) // TODO: Remove this workaround and use "numberOfItems" observable from service
  }
}
