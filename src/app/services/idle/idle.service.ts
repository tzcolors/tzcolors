import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  private idleCounter = 0

  private interval?: NodeJS.Timeout

  constructor() {
    document.addEventListener('mousemove', () => {
      this.idleCounter = 0
    })
    document.addEventListener('keypress', () => {
      this.idleCounter = 0
    })
    document.addEventListener('touchmove', () => {
      this.idleCounter = 0
    })
  }

  start() {
    this.interval = setInterval(() => {
      this.idleCounter++

      if (this.idleCounter > 60 * 6) {
        // Refresh window after 6 hours of inactivity activity.
        // This is used to make sure "old tabs" etc. get the latest updates.

        this.stop()

        alert(
          'We detected that you have not interacted with the website in a while. The website will now refresh'
        )

        window.location.reload()
      }
    }, 60_000)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}
