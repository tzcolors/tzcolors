import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ColorCardListComponent } from './color-card-list.component'

describe('ColorCardListComponent', () => {
  let component: ColorCardListComponent
  let fixture: ComponentFixture<ColorCardListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColorCardListComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorCardListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
