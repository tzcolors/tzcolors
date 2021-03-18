import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import { Observable } from 'rxjs'
import { Color, StoreService } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-explore',
  templateUrl: './address-detail.component.html',
  styleUrls: ['./address-detail.component.scss'],
})
export class AddressDetailComponent implements OnInit {
  public colors$: Observable<Color[]> = new Observable()
  public colorsCount$: Observable<number> = new Observable()

  public address = ''

  constructor(
    private readonly storeService: StoreService,
    private readonly route: ActivatedRoute
  ) {
    this.storeService.setView('explore')
    this.storeService.setSortType('name')
    this.storeService.setSortDirection('asc')
    this.colors$ = this.storeService.colors$
    this.colorsCount$ = this.storeService.colorsCount$
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.address = params['id']
      this.storeService.setSearchString(this.address)
    })
  }

  openAddress(address: string) {
    window.open(`https://tezblock.io/account/${address}`, '_blank')
  }
}
