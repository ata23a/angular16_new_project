import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineHotelLayoutComponent } from './online-hotel-layout.component';

describe('OnlineHotelLayoutComponent', () => {
  let component: OnlineHotelLayoutComponent;
  let fixture: ComponentFixture<OnlineHotelLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnlineHotelLayoutComponent]
    });
    fixture = TestBed.createComponent(OnlineHotelLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
