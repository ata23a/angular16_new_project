import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeSearchComponent } from './income-search.component';

describe('IncomeSearchComponent', () => {
  let component: IncomeSearchComponent;
  let fixture: ComponentFixture<IncomeSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncomeSearchComponent]
    });
    fixture = TestBed.createComponent(IncomeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
