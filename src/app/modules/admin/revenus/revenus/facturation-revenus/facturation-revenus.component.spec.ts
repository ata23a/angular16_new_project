import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturationRevenusComponent } from './facturation-revenus.component';

describe('FacturationRevenusComponent', () => {
  let component: FacturationRevenusComponent;
  let fixture: ComponentFixture<FacturationRevenusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacturationRevenusComponent]
    });
    fixture = TestBed.createComponent(FacturationRevenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
