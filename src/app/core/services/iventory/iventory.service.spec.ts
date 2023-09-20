import { TestBed } from '@angular/core/testing';

import { IventoryService } from './iventory.service';

describe('IventoryService', () => {
  let service: IventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
