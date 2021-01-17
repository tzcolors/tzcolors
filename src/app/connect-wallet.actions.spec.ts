import * as fromConnectWallet from './connect-wallet.actions';

describe('loadConnectWallets', () => {
  it('should return an action', () => {
    expect(fromConnectWallet.loadConnectWallets().type).toBe('[ConnectWallet] Load ConnectWallets');
  });
});
