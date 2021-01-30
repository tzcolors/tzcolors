import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { Subscription, interval } from 'rxjs'

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input()
  public endDate: string = ''

  private subscription!: Subscription

  public dateNow = new Date()
  public finalDate = new Date(this.endDate)

  milliSecondsInASecond = 1000
  hoursInADay = 24
  minutesInAnHour = 60
  SecondsInAMinute = 60

  public timeDifference: any
  public secondsToDday: any
  public minutesToDday: any
  public hoursToDday: any
  public daysToDday: any

  constructor() {}

  getTimeDifference() {
    this.timeDifference = this.finalDate.getTime() - new Date().getTime()
    this.allocateTimeUnits(this.timeDifference)
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
    this.subscription = interval(1000).subscribe((x) => {
      this.getTimeDifference()
    })
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
