import { Injectable } from '@angular/core'
import {
  AccountInfo,
  Network,
  NetworkType,
  OperationResponseOutput,
  PermissionScope,
  RequestOperationInput,
  SignPayloadResponseOutput,
} from '@airgap/beacon-sdk'
import { TezosToolkit } from '@taquito/taquito'
import { Observable, of } from 'rxjs'
import BigNumber from 'bignumber.js'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { Store } from '@ngrx/store'
import * as fromRoot from '../../app.reducer'
import * as actions from '../../connect-wallet.actions'

const TZ_COLORS_CONTRACT = 'KT1L2regUHWP31bg2mTUeMvvY97LC9r8Txpz'

const RPC_URL = 'https://testnet-tezos.giganode.io'

const tezos = new TezosToolkit(RPC_URL)

@Injectable({
  providedIn: 'root',
})
export class BeaconService {
  public wallet: BeaconWallet
  public network: Network = { type: NetworkType.DELPHINET }

  constructor(private readonly store$: Store<fromRoot.State>) {
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

  async reset(): Promise<void> {
    return this.wallet.clearActiveAccount()
  }

  private async getBalances(_userAddress: string) {
    try {
      const contractInstance = await tezos.wallet.at(TZ_COLORS_CONTRACT)
      const storage: Storage = await contractInstance.storage()

      console.log(storage)

      // https://testnet-tezos.giganode.io/chains/main/blocks/head/context/contracts/KT1L2regUHWP31bg2mTUeMvvY97LC9r8Txpz/storage

      // return new BigNumber(
      //   await storage.ledger.get({
      //     token_id: contract.token_id,
      //     owner: userAddress,
      //   })
      // )
    } catch (e) {
      console.error(e)
    }
  }
}
