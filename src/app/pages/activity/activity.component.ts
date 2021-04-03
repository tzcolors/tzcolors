import { Component, OnDestroy, OnInit } from '@angular/core'
import { BsModalService } from 'ngx-bootstrap/modal'
import {
  combineLatest,
  interval,
  Observable,
  ReplaySubject,
  Subscription,
} from 'rxjs'
import { ColorHistoryModalComponent } from 'src/app/components/color-history-modal/color-history-modal.component'
import { ApiService } from 'src/app/services/api/api.service'
import {
  Color,
  ColorCategory,
  StoreService,
} from 'src/app/services/store/store.service'
import {
  handleBCDBreakingChange,
  parseDate,
  wrapApiRequest,
} from 'src/app/utils'

export interface ActivityItem {
  color: Color
  entrypoint: string
  source: string
  amount: string
  timestamp: string
  endDate?: Date
}

const mapOps = (
  colors: Color[]
): ((operation: any) => ActivityItem | undefined) => {
  return (operation: any): ActivityItem | undefined => {
    let color
    let amount
    let endDate
    if (operation.entrypoint === 'withdraw') {
      color = colors.find(
        (c) =>
          c.token_id ===
          parseInt(operation.storage_diff.children[0].children[1].value)
      )
      amount = operation.storage_diff.children[0].children[5].value
    } else if (operation.entrypoint === 'bid') {
      color = colors.find(
        (c) =>
          c.token_id ===
          parseInt(operation.storage_diff.children[0].children[1].value)
      )
      amount = operation.amount
      endDate = parseDate(operation.storage_diff.children[0].children[3].value)
    } else if (operation.entrypoint === 'create_auction') {
      color = colors.find(
        (c) =>
          c.token_id ===
          parseInt(operation.storage_diff.children[0].children[1].value)
      )
      amount = handleBCDBreakingChange(operation.parameters).children[1].value
      endDate = parseDate(
        handleBCDBreakingChange(operation.parameters).children[2].value
      )
    }

    if (!color) {
      return undefined
    }
    return {
      color,
      entrypoint: operation.entrypoint,
      source: operation.source,
      amount,
      timestamp: operation.timestamp,
      endDate,
    }
  }
}

const isActivityItem = (
  item: ActivityItem | undefined
): item is ActivityItem => {
  return !!item
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit, OnDestroy {
  public activities: ActivityItem[] = []

  public hasLoaded: boolean = false

  private subscription = new Subscription()

  category$: Observable<ColorCategory>

  private operations: ReplaySubject<any[]> = new ReplaySubject(1)

  constructor(
    private readonly modalService: BsModalService,
    private readonly api: ApiService,
    private readonly storeService: StoreService
  ) {
    this.storeService.setView('explore')
    this.storeService.setSortType('name')
    this.storeService.setSortDirection('asc')
    this.storeService.setSearchString('')
    this.storeService.setNumberOfItems(2000)
    this.category$ = this.storeService.category$
  }

  async ngOnInit(): Promise<void> {
    wrapApiRequest('fetchOperations', () => {
      return this.fetchOperations()
    })

    this.subscription.add(
      combineLatest([this.storeService.colors$, this.operations]).subscribe(
        ([colors, operations]) => {
          const mapColors = mapOps(colors)
          this.activities = operations.map(mapColors).filter(isActivityItem)
        }
      )
    )

    this.subscription.add(
      interval(60_000).subscribe((x) => {
        wrapApiRequest('fetchOperations', () => {
          return this.fetchOperations()
        })
      })
    )
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  async fetchOperations() {
    const ops = await this.api.getLatestOperations(100)

    this.hasLoaded = true

    this.operations.next(ops)
  }

  openHistoryModal(color: Color) {
    if (!color) {
      return
    }
    const modalRef = this.modalService.show(ColorHistoryModalComponent, {
      initialState: {
        color,
      },
      class: 'modal-lg modal-dialog-centered',
    })
  }

  openAddress(address: string) {
    window.open(`https://tezblock.io/account/${address}`, '_blank')
  }

  setCategory(oldCategory: ColorCategory, category: ColorCategory): void {
    if (oldCategory === category) {
      this.storeService.setCategory('all')
    } else {
      this.storeService.setCategory(category)
    }
  }
}
