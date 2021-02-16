import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core'
import { EventEmitter } from '@angular/core'
import { Subscription, interval } from 'rxjs'

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input()
  public endDate: Date | string = ''

  @Input()
  public shortTimeFormat: boolean = false

  @Output()
  public countdownReached: EventEmitter<boolean> = new EventEmitter()

  private subscription!: Subscription

  milliSecondsInASecond = 1000
  hoursInADay = 24
  minutesInAnHour = 60
  SecondsInAMinute = 60

  public timeDifference: number = 0
  public secondsToDday: number = 0
  public minutesToDday: number = 0
  public hoursToDday: number = 0
  public daysToDday: number = 0

  constructor() {}

  getTimeDifference() {
    let date: Date | undefined
    if (typeof this.endDate === 'string') {
      date = new Date(this.endDate)
    } else {
      date = this.endDate
    }

    this.timeDifference = Math.max(date.getTime() - new Date().getTime(), 0)

    if (this.timeDifference <= 0) {
      this.countdownReached.emit(true)
      if (this.subscription) {
        this.subscription.unsubscribe()
      }
    } else {
      this.allocateTimeUnits(this.timeDifference)
    }
  }

  allocateTimeUnits(timeDifference: any) {
    this.secondsToDday = Math.floor(
      (timeDifference / this.milliSecondsInASecond) % this.SecondsInAMinute
    )

    this.minutesToDday = Math.floor(
      (timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour)) %
        this.SecondsInAMinute
    )

    this.hoursToDday = Math.floor(
      (timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute)) %
        this.hoursInADay
    )

    this.daysToDday = Math.floor(
      timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute *
          this.hoursInADay)
    )
  }

  ngOnInit(): void {
    this.getTimeDifference()
    this.subscription = interval(1000).subscribe((x) => {
      this.getTimeDifference()
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
