import { Injectable } from '@angular/core'
import {
  AccountInfo,
  Network,
  NetworkType,
  OperationResponseOutput,
  PermissionScope,
  RequestOperationInput,
  SignPayloadResponseOutput,
  TezosOperationType,
} from '@airgap/beacon-sdk'
import { TezosToolkit } from '@taquito/taquito'
import { Observable, of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../connect-wallet.actions'
import { HttpClient } from '@angular/common/http'
const MichelsonCodec = require('@taquito/local-forging/dist/lib/codec')
const Codec = require('@taquito/local-forging/dist/lib/codec')
import { Uint8ArrayConsumer } from '@taquito/local-forging'

const TZ_COLORS_CONTRACT = 'KT1L2regUHWP31bg2mTUeMvvY97LC9r8Txpz'
const TZ_COLORS_AUCTION_CONTRACT = 'KT1VCEgBpVx3ww7MwNc13rN9efpS5UFSER3J'

const RPC_URL = 'https://testnet-tezos.giganode.io'

const tezos = new TezosToolkit(RPC_URL)

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public wallet: BeaconWallet
  public network: Network = { type: NetworkType.DELPHINET }

  constructor() {
    this.wallet = new BeaconWallet({ name: 'TzColors' })
    tezos.setWalletProvider(this.wallet)
    this.getBalances('')
  }

  async setupBeaconWallet(): Promise<AccountInfo | undefined> {
    try {
      return await this.wallet.client.getActiveAccount()
    } catch (error) {
      console.error('Setting up BeaconWallet failed: ', error)
      return undefined
    }
  }

  async requestPermission(): Promise<AccountInfo | undefined> {
    await this.wallet.requestPermissions({ network: this.network })
    return this.wallet.client.getActiveAccount()
  }

  async sign(message: string): Promise<SignPayloadResponseOutput> {
    return this.wallet.client.requestSignPayload({
      payload: message,
    })
  }

  async operation(
    input: RequestOperationInput
  ): Promise<OperationResponseOutput> {
    return this.wallet.client.requestOperation(input)
  }

  async bid(tokenId: number, bidAmount: string): Promise<void> {
    const contractInstance = await tezos.wallet.at(TZ_COLORS_AUCTION_CONTRACT)
    console.log(contractInstance)
    const result = await contractInstance.methods
      .bid(tokenId)
      .toTransferParams()
    const res = await this.wallet.client.requestOperation({
      operationDetails: [
        {
          kind: TezosOperationType.TRANSACTION,
          amount: bidAmount,
          destination: result.to,
          parameters: result.parameter as any,
        },
      ],
    })
    console.log(res)
  }

  async createAuction(
    tokenId: number,
    startAmount: string,
    duration: string
  ): Promise<void> {
    const contractInstance = await tezos.wallet.at(TZ_COLORS_CONTRACT)
    console.log(contractInstance)

    const result = await contractInstance.methods
      .approve([
        {
          amount: startAmount,
          operator: TZ_COLORS_AUCTION_CONTRACT,
          token_id: tokenId,
        },
      ])
      .send()

    console.log(result)

    const auctionContract = await tezos.wallet.at(TZ_COLORS_AUCTION_CONTRACT)
    const res = await auctionContract.methods
      .create_auction(
        2, // auction_id
        startAmount, // bid_amount
        new Date(new Date().getTime() + 1000000), // end_timestamp (this is about 15 minutes)
        TZ_COLORS_CONTRACT, // token_address
        1, // token_amount (always 1)
        tokenId // token_id
      )
      .send()

    console.log(res)
  }

  async reset(): Promise<void> {
    return this.wallet.clearActiveAccount()
  }

  private async getBalances(_userAddress: string) {
    try {
      const contractInstance = await tezos.wallet.at(TZ_COLORS_CONTRACT)
      const storage: Storage = await contractInstance.storage()

      console.log(storage)
    } catch (e) {
      console.error(e)
    }
  }
}
