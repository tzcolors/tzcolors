import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { AuctionItem, Color, StoreService } from 'src/app/store.service'
import { ColorCategory } from '../explore/explore.component'

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss'],
})
export class AuctionsComponent implements OnInit {
  public auctions$: Observable<AuctionItem[]> = new Observable()

  searchString: string = ''
  category: ColorCategory = 'rare'

  constructor(private readonly storeService: StoreService) {
    this.auctions$ = this.storeService.auctions$
    this.auctions$.subscribe(console.log)

    this.setColor()
  }

  ngOnInit(): void {}

  setCategory(category: ColorCategory): void {
    console.log(category)
    this.category = category
    this.setColor()
  }

  textInput(ev: any) {
    console.log(ev)
    setTimeout(() => {
      this.setColor()
    })
  }

  setColor() {
    console.log(this.searchString)
  }
}
