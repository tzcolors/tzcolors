import { Injectable } from '@angular/core'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const CHECK_INTERVAL = 1 * SECOND
const IDLE_TIMEOUT = 1 * HOUR

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  public isIdle: boolean = false

  private lastAction: Date = new Date()

  constructor() {
    setInterval(() => {
      console.log('checking idle')
      const lastActionDiff = new Date().getTime() - this.lastAction.getTime()

      console.log(
        'last action was',
        this.lastAction,
        lastActionDiff,
        lastActionDiff > IDLE_TIMEOUT
      )
    }, CHECK_INTERVAL)
  }
}
