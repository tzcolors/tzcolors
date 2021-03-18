import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TokenDetailComponent } from './token-detail.component'

describe('TokenDetailComponent', () => {
  let component: TokenDetailComponent
  let fixture: ComponentFixture<TokenDetailComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenDetailComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
