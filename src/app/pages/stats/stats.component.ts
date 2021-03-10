import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/services/api/api.service'
import { StoreService } from 'src/app/services/store/store.service'

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  totalTransactions = [
    {
      name: '',
      series: [
        {
          name: '20.02',
          value: 10,
        },
        {
          name: '21.02',
          value: 150,
        },
        {
          name: '22.02',
          value: 300,
        },
        {
          name: '23.02 ',
          value: 10,
        },
        {
          name: '24.02 ',
          value: 150,
        },
        {
          name: '25.02 ',
          value: 1000,
        },
      ],
    },
  ]

  totalVolume = [
    {
      name: '',
      series: [
        {
          name: '20.02',
          value: 10,
        },
        {
          name: '21.02',
          value: 150,
        },
        {
          name: '22.02',
          value: 300,
        },
        {
          name: '23.02 ',
          value: 10,
        },
        {
          name: '24.02 ',
          value: 150,
        },
        {
          name: '25.02 ',
          value: 1000,
        },
      ],
    },
  ]

  colorScheme = {
    domain: ['#000000'],
  }

  public stats: any = {
    amount: { total: 0 },
    fee: { total: 0 },
    count: {
      total: 0,
      create_auction: 0,
      bid: 0,
      withdraw: 0,
    },
    highestSale: {
      total: undefined,
      legendary: undefined,
      epic: undefined,
      standard: undefined,
    },
    lowestSale: {
      total: undefined,
      legendary: undefined,
      epic: undefined,
      standard: undefined,
    },
    maxNumberOfBids: {
      total: undefined,
      legendary: undefined,
      epic: undefined,
      standard: undefined,
    },
  }

  constructor(
    private readonly store: StoreService,
    private readonly api: ApiService
  ) {
    this.api.getOperationCount().then((res) => (this.stats.count.total = res))
    this.api.getSum('amount').then((res) => (this.stats.amount.total = res))
    this.api.getSum('fee').then((res) => (this.stats.fee.total = res))
  }

  ngOnInit(): void {}
}
