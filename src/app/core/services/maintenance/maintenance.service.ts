import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {TableState} from "../item/item.service";
import {Requests, RequestStatus, RequestType} from "../../model/request";

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

    private _statuses: Array<string>;
  constructor(
      private httpClient: HttpClient
  ) { }
    get statuses() {
        return this._statuses;
    }
  create(request): Observable<Requests> {
    const url = [environment.apiUrl, 'requests'].join('/');
    return this.httpClient.post<Requests>(url, request);
  }
  listStatus(category_id?: number | null, strict?: boolean) {
    const url = [environment.apiUrl, 'requests', 'status'].join('/');
    return this.httpClient.get<RequestStatus[]>(url, { params: { type: 'all' } }).pipe(
      map(statuses => {
        if (!category_id && !strict) {
          return statuses;
        }

        return statuses.filter(status => {
          if (category_id !== null || strict) {
            return status.category_id === category_id
          }
          else {
            return true;
          }
        });
      })
    );
  }
    getTypes(params: any, category_id?: number | null, strict?: boolean) {
        const url = [environment.apiUrl, 'requests', 'type'].join('/');
        return this.httpClient.get<RequestType[]>(url, {params}).pipe(
            map(types => {
                types.sort((a, b) => {
                    return b.id - a.id;
                });

                if (!category_id && !strict) {
                    return types;
                }

                return types.filter(type => {
                    if (category_id !== null || strict) {
                        return type.category_id === category_id
                    }
                    else {
                        return true;
                    }
                });
            })
        );
    }
  updateStatus(params): Observable<any> {
    const url = [environment.apiUrl, 'requests', params.id, 'status'].join('/');
    return this.httpClient.put<Request>(url, params);
  }
    update(request): Observable<Request> {
        const url = ['authentification.service.ts', 'requests', request.id].join('/');
        return this.httpClient.put<Request>(url, request);
    }
    removeItem(id: number, item_id: number): Observable<any> {
        const API = environment;
        const url = [API.apiUrl, 'requests', id, 'item', item_id, 'unit'].join('/');
        return this.httpClient.delete<any>(url);
    }
    get(id): Observable<Requests> {
      const API = environment
        const url = [API.apiUrl, 'requests', id].join('/');
        return this.httpClient.get<Requests>(url);
    }
  updateBy(id: number, body, type: string): Observable<any> {
    const url = [environment.apiUrl, 'requests', id, type].join('/');
    return this.httpClient.post<any>(url, body);
  }
  removeBy(id: number, type: string, secondId: number): Promise<any> {
    const url = [environment.apiUrl, 'requests', id, type, secondId].join('/');
    return this.httpClient.delete<any>(url).toPromise();
  }
    /*paginate(tableState: TableState): Observable<any> {
        const API = environment;
        const url = [API.apiUrl, 'incomes', 'paginate'].join('/');
        return this.http.post<any>(url, tableState);
    }*/
    updateExtendedBy(id: number, body: any, type: string): Promise<any> {
        const API = environment;
        const url = [API, 'requests', id, 'extended', type].join('/');
        return this.httpClient.put<any>(url, body).toPromise();
    }
}
