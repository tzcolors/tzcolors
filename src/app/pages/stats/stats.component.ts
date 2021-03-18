import { Component, OnInit } from '@angular/core'
import { first } from 'rxjs/operators'
import BigNumber from 'bignumber.js'
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
    this.store.setView('explore')
    this.store.setSortType('name')
    this.store.setSortDirection('asc')
    this.store.setSearchString('')
    this.store.setNumberOfItems(2000)

    this.api.getOperationCount().then((res) => (this.stats.count.total = res))
    this.api
      .getOperationCount('create_auction')
      .then((res) => (this.stats.count.create_auction = res))
    this.api
      .getOperationCount('bid')
      .then((res) => (this.stats.count.bid = res))
    this.api
      .getOperationCount('withdraw')
      .then((res) => (this.stats.count.withdraw = res))
    setTimeout(() => {
      this.api.getBidCountForAllTokens().then((res) => {
        this.store.colors$.pipe(first()).subscribe((colors) => {
          const colorsWithBidCount = colors.map((c) => ({
            ...c,
            bidCount: res[c.token_id],
          }))
          this.stats.maxNumberOfBids.total = colorsWithBidCount.reduce(
            (pv, cv) => (pv.bidCount > cv.bidCount ? pv : cv),
            { bidCount: 0 }
          ) as any
          this.stats.maxNumberOfBids.legendary = colorsWithBidCount
            .filter((c) => c.category === 'legendary')
            .reduce((pv, cv) => (pv.bidCount > cv.bidCount ? pv : cv), {
              bidCount: 0,
            }) as any
          this.stats.maxNumberOfBids.epic = colorsWithBidCount
            .filter((c) => c.category === 'epic')
            .reduce((pv, cv) => (pv.bidCount > cv.bidCount ? pv : cv), {
              bidCount: 0,
            }) as any
          this.stats.maxNumberOfBids.standard = colorsWithBidCount
            .filter((c) => c.category === 'standard')
            .reduce((pv, cv) => (pv.bidCount > cv.bidCount ? pv : cv), {
              bidCount: 0,
            }) as any
        })
      })
      this.api.getMaxBidForAllTokens().then((res) => {
        this.store.colors$.pipe(first()).subscribe((colors) => {
          const colorsWithBidAmount = colors.map((c) => ({
            ...c,
            bidAmount: new BigNumber(res[c.token_id]),
          }))

          console.log('ASDKJASDKJASKFASJF', colorsWithBidAmount)

          this.stats.highestSale.total = colorsWithBidAmount.reduce(
            (pv, cv) => (pv.bidAmount.gt(cv.bidAmount) ? pv : cv),
            { bidAmount: new BigNumber(0) }
          ) as any
          console.log('TOTAL', this.stats.highestSale.total)
          this.stats.highestSale.legendary = colorsWithBidAmount
            .filter((c) => c.category === 'legendary')
            .reduce((pv, cv) => (pv.bidAmount.gt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(0),
            }) as any
          this.stats.highestSale.epic = colorsWithBidAmount
            .filter((c) => c.category === 'epic')
            .reduce((pv, cv) => (pv.bidAmount.gt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(0),
            }) as any
          this.stats.highestSale.standard = colorsWithBidAmount
            .filter((c) => c.category === 'standard')
            .reduce((pv, cv) => (pv.bidAmount.gt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(0),
            }) as any

          this.stats.lowestSale.total = colorsWithBidAmount.reduce(
            (pv, cv) => (pv.bidAmount.lt(cv.bidAmount) ? pv : cv),
            { bidAmount: new BigNumber(Number.MAX_SAFE_INTEGER) }
          ) as any
          this.stats.lowestSale.legendary = colorsWithBidAmount
            .filter((c) => c.category === 'legendary')
            .reduce((pv, cv) => (pv.bidAmount.lt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(Number.MAX_SAFE_INTEGER),
            }) as any
          this.stats.lowestSale.epic = colorsWithBidAmount
            .filter((c) => c.category === 'epic')
            .reduce((pv, cv) => (pv.bidAmount.lt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(Number.MAX_SAFE_INTEGER),
            }) as any
          this.stats.lowestSale.standard = colorsWithBidAmount
            .filter((c) => c.category === 'standard')
            .reduce((pv, cv) => (pv.bidAmount.lt(cv.bidAmount) ? pv : cv), {
              bidAmount: new BigNumber(Number.MAX_SAFE_INTEGER),
            }) as any
        })
      })
    }, 2000)

    this.api.getOperationCount().then((res) => (this.stats.count.total = res))
    this.api.getSum('amount').then((res) => (this.stats.amount.total = res))
    this.api.getSum('fee').then((res) => (this.stats.fee.total = res))
  }

  ngOnInit(): void {}
}
