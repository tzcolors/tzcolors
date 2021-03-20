import { TestBed } from '@angular/core/testing'

import { PushService } from './push.service'

describe('PushService', () => {
  let service: PushService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PushService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
