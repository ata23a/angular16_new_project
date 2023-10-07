import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturPaidComponent } from './factur-paid.component';

describe('FacturPaidComponent', () => {
  let component: FacturPaidComponent;
  let fixture: ComponentFixture<FacturPaidComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacturPaidComponent]
    });
    fixture = TestBed.createComponent(FacturPaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
