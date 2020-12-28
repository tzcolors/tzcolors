import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyColorsComponent } from './my-colors.component';

describe('MyColorsComponent', () => {
  let component: MyColorsComponent;
  let fixture: ComponentFixture<MyColorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyColorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyColorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
