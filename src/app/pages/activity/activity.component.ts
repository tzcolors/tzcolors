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
  event: 'CREATE_AUCTION' | 'BID' | 'WITHDRAW'
  source: string
  amount: string
  timestamp: string
  endDate?: Date
}

const mapOps = (
  colors: Color[]
): ((operation: any) => ActivityItem | undefined) => {
  return (operation: {
    auction: {
      id: number
      token_id: number
      end_timestamp: string
    }
    created: string
    sender: string
    tez_amount: number
    event: 'CREATE_AUCTION' | 'BID' | 'WITHDRAW'
  }): ActivityItem | undefined => {
    let color = colors.find((c) => c.token_id === operation.auction.token_id)
    if (operation.event === 'WITHDRAW') {
    } else if (operation.event === 'BID') {
    } else if (operation.event === 'CREATE_AUCTION') {
    }

    if (!color) {
      return undefined
    }
    return {
      color,
      event: operation.event,
      source: operation.sender,
      amount: operation.tez_amount.toString(),
      timestamp: operation.created,
      endDate: parseDate(operation.auction.end_timestamp),
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

    this.operations.next(ops.data.activity)
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
