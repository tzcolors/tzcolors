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
import { environment } from 'src/environments/environment'

const tezos = new TezosToolkit(environment.rpcUrl)

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public wallet: BeaconWallet
  public network: Network = { type: NetworkType.DELPHINET }

  constructor() {
    this.wallet = new BeaconWallet({ name: environment.appName })
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

  async bid(auctionId: number, bidAmount: string): Promise<void> {
    const contractInstance = await tezos.wallet.at(
      environment.tzColorsAuctionContract
    )
    console.log(contractInstance)
    const result = await contractInstance.methods
      .bid(auctionId)
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

  async claim(auctionId: number): Promise<void> {
    const contractInstance = await tezos.wallet.at(
      environment.tzColorsAuctionContract
    )
    console.log(contractInstance)
    const result = await contractInstance.methods.withdraw(auctionId).send()

    console.log(result)
  }

  async createInitialAuction(tokenId: number): Promise<void> {
    const assetContract = await tezos.wallet.at(environment.tzColorsContract)
    const auctionContract = await tezos.wallet.at(
      environment.tzColorsAuctionContract
    )

    const randomNumber = Math.round(Math.random() * 100000) // TODO: Use UUID or fetch old id?
    const result = await assetContract.methods
      .initial_auction(randomNumber, [tokenId])
      .toTransferParams()

    const bidResult = await auctionContract.methods
      .bid(randomNumber)
      .toTransferParams()

    const res = await this.wallet.client.requestOperation({
      operationDetails: [
        {
          kind: TezosOperationType.TRANSACTION,
          amount: '0',
          destination: result.to,
          parameters: result.parameter as any,
        },
        {
          kind: TezosOperationType.TRANSACTION,
          amount: '200000',
          destination: bidResult.to,
          parameters: bidResult.parameter as any,
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
    const contractInstance = await tezos.wallet.at(environment.tzColorsContract)
    console.log(contractInstance)

    const result = await contractInstance.methods
      .update_operator([
        {
          add_operator: {
            amount: startAmount,
            operator: environment.tzColorsAuctionContract,
            token_id: tokenId,
          },
        },
      ])
      .send()

    console.log(result)

    const auctionContract = await tezos.wallet.at(
      environment.tzColorsAuctionContract
    )

    const randomNumber = Math.round(Math.random() * 100000) // TODO: Use UUID or fetch old id?

    const res = await auctionContract.methods
      .create_auction(
        randomNumber, // auction_id
        startAmount, // bid_amount
        new Date(new Date().getTime() + 1000000), // end_timestamp (this is about 15 minutes)
        environment.tzColorsContract, // token_address
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
      const contractInstance = await tezos.wallet.at(
        environment.tzColorsContract
      )
      const storage: Storage = await contractInstance.storage()

      console.log(storage)
    } catch (e) {
      console.error(e)
    }
  }
}
