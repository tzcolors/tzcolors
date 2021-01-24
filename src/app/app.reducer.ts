import { AccountInfo } from '@airgap/beacon-sdk'
import { Action, createReducer, on } from '@ngrx/store'

import * as actions from './connect-wallet.actions'

const colors = require('../assets/colors.json')

export const appFeatureKey = 'app'

export interface Color {
  name: string
  description: string
  symbol: string
  token_id: number
  category: string
}

export interface Busy {
  connectedWallet: boolean
}

export interface State {
  connectedWallet: AccountInfo | undefined
  colors: Color[]
  busy: Busy
}

export const initialState: State = {
  connectedWallet: undefined,
  colors: colors.map((color: Color) => {
    color.category = color.name.startsWith('A')
      ? 'E'
      : color.name.startsWith('B')
      ? 'R'
      : 'C'
    return color
  }),
  busy: {
    connectedWallet: false,
  },
}

export const reducer = createReducer(
  initialState,
  on(actions.connectWallet, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      connectedWallet: true,
    },
  })),
  on(actions.connectWalletSuccess, (state, { accountInfo }) => ({
    ...state,
    connectedWallet: accountInfo,
    busy: {
      ...state.busy,
      connectedWallet: false,
    },
  })),
  on(actions.connectWalletFailure, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      connectedWallet: false,
    },
  })),
  on(actions.disconnectWallet, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      connectedWallet: true,
    },
  })),
  on(actions.disconnectWalletSuccess, (state) => ({
    ...state,
    connectedWallet: undefined,
    busy: {
      ...state.busy,
      connectedWallet: false,
    },
  })),
  on(actions.disconnectWalletFailure, (state) => ({
    ...state,
    busy: {
      ...state.busy,
      connectedWallet: false,
    },
  }))
)
