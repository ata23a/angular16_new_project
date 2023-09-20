import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequeteComponent } from './requete.component';

describe('RequeteComponent', () => {
  let component: RequeteComponent;
  let fixture: ComponentFixture<RequeteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequeteComponent]
    });
    fixture = TestBed.createComponent(RequeteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
