import { Component, OnInit } from '@angular/core'
import { Observable, of } from 'rxjs'
import {
  HistoryResponse,
  HistoryService,
  Operation,
} from 'src/app/services/history/history.service'

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  history$: Observable<Operation[]>
  bids$: Observable<Operation[]>

  constructor(private readonly historyService: HistoryService) {
    this.history$ = this.historyService.history$
    this.bids$ = this.historyService.bids$
  }

  ngOnInit(): void {}
}
