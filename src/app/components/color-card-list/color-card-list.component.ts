import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ColorCategory } from 'src/app/pages/explore/explore.component'
import {
  AuctionItem,
  Color,
  StoreService,
} from 'src/app/services/store/store.service'

@Component({
  selector: 'app-color-card-list',
  templateUrl: './color-card-list.component.html',
  styleUrls: ['./color-card-list.component.scss'],
})
export class ColorCardListComponent implements OnInit {
  @Input()
  public colors$: Observable<Color[]> = new Observable()

  @Input()
  public title: string = 'Colors'

  @Input()
  public count$: Observable<number> = new Observable()

  searchString: string = ''
  category: ColorCategory = 'epic'

  itemsPerPage: number = 24
  numberOfItems: number = 12

  showMoreButton: Observable<boolean> = new BehaviorSubject<boolean>(
    true
  ).asObservable()

  constructor(private readonly storeService: StoreService) {
    this.storeService.setNumberOfItems(this.numberOfItems)
  }

  ngOnInit(): void {
    this.showMoreButton = this.count$.pipe(
      map((count) => count > this.numberOfItems)
    )
  }

  setCategory(category: ColorCategory): void {
    this.category = category
    this.storeService.setCategory(this.category)
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
