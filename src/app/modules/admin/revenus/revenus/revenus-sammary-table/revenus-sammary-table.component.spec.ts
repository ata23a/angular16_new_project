import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenusSammaryTableComponent } from './revenus-sammary-table.component';

describe('RevenusSammaryTableComponent', () => {
  let component: RevenusSammaryTableComponent;
  let fixture: ComponentFixture<RevenusSammaryTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RevenusSammaryTableComponent]
    });
    fixture = TestBed.createComponent(RevenusSammaryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
