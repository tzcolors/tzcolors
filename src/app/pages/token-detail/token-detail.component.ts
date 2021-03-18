import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'
import { Color, StoreService } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-explore',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()
  public colorsCount$: Observable<number> = new Observable()

  public tokenId: number | undefined

  public color: Color | undefined

  constructor(
    private readonly storeService: StoreService,
    private readonly route: ActivatedRoute,
    private readonly ref: ChangeDetectorRef
  ) {
    this.storeService.setView('explore')
    this.storeService.setSortType('name')
    this.storeService.setSortDirection('asc')
    this.storeService.setSearchString('')
    this.storeService.setNumberOfItems(2000)
    this.colors$ = this.storeService.colors$
    this.colorsCount$ = this.storeService.colorsCount$
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.tokenId = parseInt(params['id'])
    })
    let timeout: NodeJS.Timeout
    this.colors$.subscribe((colors) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        let color = colors.find((c) => c.token_id === this.tokenId)
        if (color && !color.owner) {
          return
        }
        this.color = color
      }, 500) // TODO: Get rid of this delay. It looks like the last state is not always emitted?
    })
  }
}
