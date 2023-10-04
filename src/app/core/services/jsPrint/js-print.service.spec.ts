import { TestBed } from '@angular/core/testing';

import { JsPrintService } from './js-print.service';

describe('JsPrintService', () => {
  let service: JsPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
