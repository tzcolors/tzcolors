import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { ApiService } from '../api/api.service'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private fromTime = new Date().getTime()

  constructor(
    private readonly api: ApiService,
    private readonly toastr: ToastrService
  ) {
    this.getOperations()
    setInterval(() => {
      this.getOperations()
    }, 10_000)
  }

  async getOperations() {
    // TODO: Add response type
    const data = await this.api.getOperationsSince(this.fromTime)
    if (data.operations.length === 0) {
      console.log('no new operations')
      return
    }
    this.fromTime = new Date(data.operations[0].timestamp).getTime() + 1

    data.operations.forEach((op: any) => {
      if (op.entrypoint === 'create_auction') {
        this.showNotification(
          `New Auction!`,
          `${op.source} up color ${
            op.parameters.children[5].value
          } up for sale for ${op.parameters.children[1].value / 1_000_000} tez.`
        )
      } else if (op.entrypoint === 'bid') {
        this.showNotification(
          `New Bid!`,
          `${op.source} bid ${op.amount / 1_000_000} tez on ${
            op.parameters.value
          }.`
        )
      }
    })
  }

  async showNotification(title: string, text: string) {
    this.toastr.success(text, title)
  }

  async load() {}
}
