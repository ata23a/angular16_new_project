import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceHistoriqueComponent } from './invoice-historique.component';

describe('InvoiceHistoriqueComponent', () => {
  let component: InvoiceHistoriqueComponent;
  let fixture: ComponentFixture<InvoiceHistoriqueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceHistoriqueComponent]
    });
    fixture = TestBed.createComponent(InvoiceHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
