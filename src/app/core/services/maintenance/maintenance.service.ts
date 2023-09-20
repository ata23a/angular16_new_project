import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(
      private httpClient: HttpClient
  ) { }

    update(request): Observable<Request> {
        const url = ['authentification.service.ts', 'requests', request.id].join('/');
        return this.httpClient.put<Request>(url, request);
    }
    get(id): Observable<Request> {
        const url = ['authentification.service.ts', 'requests', id].join('/');
        return this.httpClient.get<Request>(url);
    }
  updateBy(id: number, body, type: string): Promise<any> {
    const url = ['', 'requests', id, type].join('/');
    return this.httpClient.post<any>(url, body).toPromise();
  }
  removeBy(id: number, type: string, secondId: number): Promise<any> {
    const url = ['', 'requests', id, type, secondId].join('/');
    return this.httpClient.delete<any>(url).toPromise();
  }
}
