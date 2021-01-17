import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ConnectWalletEffects } from './connect-wallet.effects';

describe('ConnectWalletEffects', () => {
  let actions$: Observable<any>;
  let effects: ConnectWalletEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConnectWalletEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ConnectWalletEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
