import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getAllBidsForAllAuctions() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/count?entrypoint=bid&groupBy=storage_diff.children.0.name`
      )
      .toPromise()
  }
  getMaxBidForAllAuctions() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/max?entrypoint=bid&groupBy=storage_diff.children.0.name`
      )
      .toPromise()
  }
  getMaxBidForAllTokens() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/max?entrypoint=bid&groupBy=storage_diff.children.0.children.1.value`
      )
      .toPromise()
  }
  getBidCountForAllTokens() {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations/count?entrypoint=bid&groupBy=storage_diff.children.0.children.1.value`
      )
      .toPromise()
  }
  getAllAuctionsForToken(tokenId: number) {
    return this.http
      .get<{ [key: string]: number }>(
        `${environment.indexerUrl}auction/operations?entrypoint=create_auction&parameters.children.5.value=${tokenId}`
      )
      .toPromise()
  }
}
