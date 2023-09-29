import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineBusLayoutComponent } from './online-bus-layout.component';

describe('OnlineBusLayoutComponent', () => {
  let component: OnlineBusLayoutComponent;
  let fixture: ComponentFixture<OnlineBusLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnlineBusLayoutComponent]
    });
    fixture = TestBed.createComponent(OnlineBusLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
