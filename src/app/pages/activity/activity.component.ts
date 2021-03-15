import { Component, OnDestroy, OnInit } from '@angular/core'
import { BsModalService } from 'ngx-bootstrap/modal'
import { interval, Subscription } from 'rxjs'
import { first } from 'rxjs/operators'
import { ColorHistoryModalComponent } from 'src/app/components/color-history-modal/color-history-modal.component'
import { ApiService } from 'src/app/services/api/api.service'
import { Color, StoreService } from 'src/app/services/store/store.service'
import { parseDate, wrapApiRequest } from 'src/app/utils'

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
      amount = operation.parameters.children[1].value
      endDate = parseDate(operation.parameters.children[2].value)
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

  private fromTime = 0

  private rawOperations: any[] = []

  private subscription = new Subscription()

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
  }

  async ngOnInit(): Promise<void> {
    wrapApiRequest('fetchOperations', () => {
      return this.fetchOperations()
    })

    this.subscription.add(
      interval(20_000).subscribe((x) => {
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
    const ops = await this.api.getLatestOperations(50)

    // if (ops.length !== 0) {
    //   this.fromTime = new Date(ops[0].timestamp).getTime() + 1

    //   this.rawOperations.unshift(...result.operations)
    // }
    this.rawOperations = ops
    // Continue even if no updates happened. It's possible the indexer is lagging behind and we need to update the colors to reflect new/ending auctions.

    this.storeService.colors$.pipe(first()).subscribe((colors) => {
      const mapColors = mapOps(colors)
      this.activities = this.rawOperations.map(mapColors).filter(isActivityItem)
    })
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
}
