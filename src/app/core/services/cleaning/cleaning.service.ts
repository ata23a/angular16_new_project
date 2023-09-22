import { Injectable } from '@angular/core';
import {SettingsCompanyService} from "../settingsCompany/settings-company.service";
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, of, switchMap, throwError} from "rxjs";
import moment from "moment";
import {MaintenanceService} from "../maintenance/maintenance.service";
import {Requests} from "../../model/request";

@Injectable({
  providedIn: 'root'
})
export class CleaningService {

  constructor(
      private http: HttpClient,
      private maintenanceService: MaintenanceService
  ) { }
    public getDefaultTypeId() {
        const settings = JSON.parse(sessionStorage.getItem(SettingsCompanyService.KEY));
        if (settings && settings['default_cleaning_type']) {
            return +settings['default_cleaning_type'];
        }

        return 0;
    }
  getStaffInProgressRequest(staff_id: number) {
    const url = [environment.apiUrl, 'requests', 'paginate'].join('/');

    const tableState = {
      search: {},
      filter: {
        request_type_id: [
          {
            value: this.getDefaultTypeId(),
            type: 'number',
          }
        ],
        status: [
          {
            value: 'IN_PROGRESS',
            type: 'string',
          }
        ]
      },
      sort: {
        pointer: 'requested_at',
      },
      slice: {
        page: 1,
        size: 1
      }
    };

    const params = new HttpParams({fromObject: {
        staff_id: staff_id.toString(10)
      }});

    return this.http.post<any>(url, tableState, {params}).pipe(
      map((result) => {
        let inProgress: Requests = null;

        for (let item of result.data) {
          let request = item as unknown as Requests;

          if (request.status === 'IN_PROGRESS') {
            inProgress = request;
            break;
          }
        }

        return inProgress;
      })
    )
  }
  updateStatus(params: any, request: Requests, currentStaffId: number) {
    if (params.status === 'IN_PROGRESS') {
      return this.getStaffInProgressRequest(currentStaffId).pipe(
        switchMap((inProgressReq) => {
          if (!inProgressReq) {
            return this.updateStatusEvent(params, request);
          }
          else {
            return throwError({error: 'STAFF_CLEANING_REQUEST_ALREADY_IN_PROGRESS'});
          }
        })
      )
    }
    else {
      return this.updateStatusEvent(params, request);
    }
  }

  private updateStatusEvent(params: any, request: Requests) {
    if (params.status === 'APPROVED') {
      return throwError({error: 'CLEANING_REQUEST_STATUS_NOT_VALID'});
    }

    if (request.status === 'APPROVED' && params.status === 'COMPLETED') {
      return throwError({error: 'CLEANING_REQUEST_NOT_ON_HOLD_OR_IN_PROGRESS'});
    }

    if (params.status === 'COMPLETED' && moment().diff(request.event_start, 'minutes') < 15) {
      return throwError({error: 'CLEANING_REQUEST_DURATION_NOT_VALID'});
    }

    return this.maintenanceService.updateStatus(params).pipe(
      switchMap(
        (res) => {
          if (request.status === 'APPROVED' && params.status === 'IN_PROGRESS') {
            return this.maintenanceService.update({
              id: params.id,
              requested_at: moment().toISOString(),
              event_start: moment().toISOString(),
              event_end: moment().add(25, 'minutes')
            });
          }
          else if (params.status === 'COMPLETED') {
            return this.maintenanceService.update({
              id: params.id,
              event_end: moment()
            });
          }

          return of(res);
        }
      )
    );
  }
}
