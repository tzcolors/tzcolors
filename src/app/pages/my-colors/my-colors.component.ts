import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { StoreService, Color } from 'src/app/store.service'
import { ColorCategory } from '../explore/explore.component'

@Component({
  selector: 'app-my-colors',
  templateUrl: './my-colors.component.html',
  styleUrls: ['./my-colors.component.scss'],
})
export class MyColorsComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()

  searchString: string = ''
  category: ColorCategory = 'epic'

  constructor(private readonly storeService: StoreService) {
    this.colors$ = this.storeService.myColors$
    this.colors$.subscribe(console.log)

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
