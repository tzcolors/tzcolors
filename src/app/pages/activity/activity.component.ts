import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/services/api/api.service'
import { Color } from 'src/app/services/store/store.service'

const colorsFromStorage: Color[] = require('../../../assets/colors.json')

export interface ActivityItem {
  color: Color
  entrypoint: string
  source: string
  amount: string
  timestamp: string
}

const mapOps = (operation: any): ActivityItem | undefined => {
  let color
  let amount
  if (operation.entrypoint === 'withdraw') {
    color = colorsFromStorage.find(
      (c) =>
        c.token_id ===
        parseInt(operation.storage_diff.children[0].children[1].value)
    )
    amount = operation.storage_diff.children[0].children[5].value
  } else if (operation.entrypoint === 'bid') {
    color = colorsFromStorage.find(
      (c) =>
        c.token_id ===
        parseInt(operation.storage_diff.children[0].children[1].value)
    )
    amount = operation.amount
  } else if (operation.entrypoint === 'create_auction') {
    color = colorsFromStorage.find(
      (c) =>
        c.token_id ===
        parseInt(operation.storage_diff.children[0].children[1].value)
    )
    amount = operation.parameters.children[1].value
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
  }
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements OnInit {
  public activities: ActivityItem[] = []

  constructor(private readonly api: ApiService) {}

  async ngOnInit(): Promise<void> {
    const result = await this.api.getOperationsSince(0)
    this.activities = result.operations
      .map(mapOps)
      .filter((el: ActivityItem | undefined) => el !== undefined)
    console.log(this.activities)
  }

  openAddress(address: string) {
    window.open(`https://tezblock.io/account/${address}`, '_blank')
  }
}
