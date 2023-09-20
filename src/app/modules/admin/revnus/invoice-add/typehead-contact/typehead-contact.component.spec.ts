import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeheadContactComponent } from './typehead-contact.component';

describe('TypeheadContactComponent', () => {
  let component: TypeheadContactComponent;
  let fixture: ComponentFixture<TypeheadContactComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeheadContactComponent]
    });
    fixture = TestBed.createComponent(TypeheadContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
