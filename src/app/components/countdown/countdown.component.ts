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
  public endDate: string = ''

  @Input()
  public shortTimeFormat: boolean = false

  @Output()
  public countdownReached: EventEmitter<boolean> = new EventEmitter()

  private subscription!: Subscription

  milliSecondsInASecond = 1000
  hoursInADay = 24
  minutesInAnHour = 60
  SecondsInAMinute = 60

  public timeDifference: number | undefined
  public secondsToDday: string | undefined
  public minutesToDday: string | undefined
  public hoursToDday: string | undefined
  public daysToDday: string | undefined

  constructor() {}

  getTimeDifference() {
    this.timeDifference = Math.max(
      new Date(this.endDate).getTime() - new Date().getTime(),
      0
    )

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
      .toString(10)
      .padStart(2, '0')
    this.minutesToDday = Math.floor(
      (timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour)) %
        this.SecondsInAMinute
    )
      .toString(10)
      .padStart(2, '0')
    this.hoursToDday = Math.floor(
      (timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute)) %
        this.hoursInADay
    )
      .toString(10)
      .padStart(2, '0')
    this.daysToDday = Math.floor(
      timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute *
          this.hoursInADay)
    )
      .toString(10)
      .padStart(2, '0')
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
