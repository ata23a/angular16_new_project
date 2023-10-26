import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeHeadContactComponent } from './type-head-contact.component';

describe('TypeHeadContactComponent', () => {
  let component: TypeHeadContactComponent;
  let fixture: ComponentFixture<TypeHeadContactComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeHeadContactComponent]
    });
    fixture = TestBed.createComponent(TypeHeadContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
