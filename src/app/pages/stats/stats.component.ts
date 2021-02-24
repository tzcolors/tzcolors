import { Component, OnInit } from '@angular/core'

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
  constructor() {}

  ngOnInit(): void {}
}
