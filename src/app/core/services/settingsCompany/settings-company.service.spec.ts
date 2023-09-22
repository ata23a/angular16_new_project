import { TestBed } from '@angular/core/testing';

import { SettingsCompanyService } from './settings-company.service';

describe('SettingsCompanyService', () => {
  let service: SettingsCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
