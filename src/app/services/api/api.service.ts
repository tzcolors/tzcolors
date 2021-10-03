import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map } from 'rxjs/operators'

const headers = new HttpHeaders().set(
  'Content-Type',
  'application/json; charset=utf-8'
)

export interface AllAuctionsForTokenResponse {
  data: {
    auctions: {
      id: number
      end_timestamp: string
      seller: {
        address: string
      }
      status: string
      bids: {
        id: string
        bid_amount: string
        bidder_id: string
        timestamp: string
      }[]
      bids_aggregate: {
        aggregate: {
          max: { bid_amount: number }
        }
      }
    }[]
  }
}

export interface Result {
  consumed_gas: number
  storage_size: number
  paid_storage_size_diff?: number
}

export interface Child4 {
  prim: string
  type: string
  name: string
  value: string
}

export interface Child3 {
  prim: string
  type: string
  children: Child4[]
}

export interface Child2 {
  prim: string
  type: string
  value: string
  name: string
  children: Child3[]
}

export interface Child {
  prim: string
  type: string
  name: string
  value: string
  children: Child2[]
}

export interface Parameters {
  prim: string
  type: string
  value: string
  children: Child[]
  name: string
}

export interface Child6 {
  prim: string
  type: string
  name: string
  value: any
  from: string
  diff_type: string
}

export interface Child5 {
  prim: string
  type: string
  name: string
  children: Child6[]
  value: any
  diff_type: string
}

export interface StorageDiff {
  prim: string
  type: string
  children: Child5[]
}

export interface HistoryItem {
  level: number
  fee: number
  counter: number
  gas_limit: number
  amount: number
  content_index: number
  result: Result
  parameters: Parameters
  storage_diff: StorageDiff
  timestamp: Date
  id: string
  protocol: string
  hash: string
  network: string
  kind: string
  source: string
  destination: string
  status: string
  entrypoint: string
  internal: boolean
  mempool: boolean
  storage_limit?: number
  burned?: number
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getAllBidsForAllAuctions(): Promise<{ [key: string]: number }> {
    return this.http
      .post<{
        data: {
          auctions: {
            id: number
            bids_aggregate: {
              aggregate: {
                count: number
              }
            }
          }[]
        }
      }>(
        environment.dipdupUrl,
        {
          query: `{
          auctions {
            id
            bids_aggregate {
              aggregate {
                count
              }
            }
          }
        }`,
        },
        { headers }
      )
      .pipe(
        map((res) => {
          const x: { [key: string]: number } = {}
          res.data.auctions.forEach((auction) => {
            x[auction.id] = auction.bids_aggregate.aggregate.count
          })
          return x
        })
      )
      .toPromise()
  }
  getMaxBidForAllAuctions(): Promise<{ [key: string]: number }> {
    return this.http
      .post<{
        data: {
          auctions: {
            id: number
            bids_aggregate: {
              aggregate: {
                max: { bid_amount: number }
              }
            }
          }[]
        }
      }>(environment.dipdupUrl, {
        query: `
        {
          auctions {
            id
            bids_aggregate {
              aggregate {
                max {
                  bid_amount
                }
              }
            }
          }
        }        
        `,
      })
      .pipe(
        map((res) => {
          const x: { [key: string]: number } = {}
          console.log('res', res)
          res.data.auctions.forEach((auction) => {
            console.log('auction', auction)
            x[auction.id] = auction.bids_aggregate.aggregate.max.bid_amount
          })
          return x
        })
      )
      .toPromise()
  }

  // TODO
  getAllAuctionsForToken(tokenId: number) {
    return this.http
      .post<AllAuctionsForTokenResponse>(environment.dipdupUrl, {
        query: `
        {
          auctions(order_by: {end_timestamp: desc} where: {token_id: {_eq: ${tokenId}}}) {
            id
            end_timestamp
            seller {
              address
            }
            status
            bids(order_by: {timestamp: desc}) {
              id
              bid_amount
              bidder_id
              timestamp
            }
            bids_aggregate {
              aggregate {
                count
              }
            }
          }
        }
              `,
      })
      .toPromise()
  }

  getBidsForAuction(auctionId: number) {
    return this.http
      .post<{
        data: {
          auctions: {
            id: number
            bids: {
              id: string
              bid_amount: string
              bidder_id: string
              timestamp: string
            }[]
            bids_aggregate: {
              aggregate: {
                max: { bid_amount: number }
              }
            }
          }[]
        }
      }>(environment.dipdupUrl, {
        query: `
        {
          auctions(where: {id: {_eq: ${auctionId}}}) {
            id
            end_timestamp
            seller {
              address
            }
            status
            bids(order_by: {timestamp: desc}) {
              id
              bid_amount
              bidder_id
              timestamp
            }
          }
        }
              `,
      })
      .toPromise()
  }

  getOperationCount(entrypoint?: string) {
    const params = entrypoint ? `?entrypoint=${entrypoint}` : ``
    return this.http
      .get<number>(`${environment.indexerUrl}auction/operations/count${params}`)
      .toPromise()
  }

  getSum(field?: string) {
    const params = field ? `?aggregate=${field}` : ``
    return this.http
      .get<number>(`${environment.indexerUrl}auction/operations/sum${params}`)
      .toPromise()
  }

  getLatestOperations(limit: number) {
    const params = limit ? `?limit=${limit}` : ``
    return this.http
      .get<any>(`${environment.indexerUrl}auction/operations${params}`)
      .toPromise()
  }

  getOperationsSince(from: number) {
    const params = from ? `?from=${from}` : `?`
    return this.http
      .get<any>(
        `https://api.better-call.dev/v1/contract/mainnet/${environment.tzColorsAuctionContract}/operations${params}&with_storage_diff=true&status=applied&size=20`
      )
      .toPromise()
  }

  getAllHolders() {
    return this.http
      .post<{
        data: {
          tokens: {
            id: number
            holder: {
              address: string
            }
          }[]
        }
      }>(environment.dipdupUrl, {
        query: `
        {
          tokens {
            id
            holder {
              address
            }
            auctions {
              id
              bid_amount
              end_timestamp
              bids_aggregate {
                aggregate {
                  count
                }
              }
            }
          }
        }        
        `,
      })
      .toPromise()
  }

  getAllAuctions() {
    return this.http
      .post<{
        data: {
          auctions: {
            id: number
            end_timestamp: string
            seller: {
              address: string
            }
            bidder: {
              address: string
            }
            bid_amount: number
            status: number
            token_id: number
          }[]
        }
      }>(environment.dipdupUrl, {
        query: `
        {
          auctions {
            id
            end_timestamp
            seller {
              address
            }
            bidder {
              address
            }
            bid_amount
            token_id
            status
          }
        }
                `,
      })
      .toPromise()
  }
}
