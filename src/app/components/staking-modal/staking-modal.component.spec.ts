import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StakingModalComponent } from './staking-modal.component'

describe('StakingModalComponent', () => {
  let component: StakingModalComponent
  let fixture: ComponentFixture<StakingModalComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StakingModalComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(StakingModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
