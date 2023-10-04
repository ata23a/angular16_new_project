import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstNamePipeComponent } from './first-name-pipe.component';

describe('FirstNamePipeComponent', () => {
  let component: FirstNamePipeComponent;
  let fixture: ComponentFixture<FirstNamePipeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirstNamePipeComponent]
    });
    fixture = TestBed.createComponent(FirstNamePipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
