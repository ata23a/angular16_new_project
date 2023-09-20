import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSummaryTableComponent } from './invoice-summary-table.component';

describe('InvoiceSummaryTableComponent', () => {
  let component: InvoiceSummaryTableComponent;
  let fixture: ComponentFixture<InvoiceSummaryTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceSummaryTableComponent]
    });
    fixture = TestBed.createComponent(InvoiceSummaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
