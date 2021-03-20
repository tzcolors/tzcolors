import { Injectable } from '@angular/core'
import { SwPush } from '@angular/service-worker'

@Injectable({
  providedIn: 'root',
})
export class PushService {
  readonly VAPID_PUBLIC_KEY =
    'BPgIwVrcDZQyebBDd1vOeYbj4NBOQt9uQ1_r4ltQBxg8rg88ejG3rOVhFGvKYHvfYi1eVsYafIbavYtoDJ3Pz80'

  constructor(private swPush: SwPush) {}

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((sub) => {
        console.log('subscribe', sub)
        // this.newsletterService.addPushSubscriber(sub).subscribe()
      })
      .catch((err) =>
        console.error('Could not subscribe to notifications', err)
      )
  }
}
