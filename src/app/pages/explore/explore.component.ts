import { Component, OnInit } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { Color, State } from 'src/app/app.reducer'

export type ColorCategory = 'legendary' | 'legendary' | 'standard'

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()

  searchString: string = ''
  category: ColorCategory = 'epic'

  constructor(private readonly store$: Store<State>) {
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
    this.colors$ = this.store$.select(
      (state) =>
        ((state as any).app.colors as Color[])
          .filter(
            (color) =>
              color.name
                .toLowerCase()
                .includes(this.searchString.toLowerCase()) &&
              color.category === this.category
          )
          .slice(0, 500) // TODO: Fix type
    )
  }
}
