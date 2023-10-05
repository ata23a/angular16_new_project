import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import Revenue from "../../../core/model/revenue";
import {AppService} from "../../../core/services/app/app.service";

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(
      private http : HttpClient
  ) { }
    summary(params?: any): Observable<any[]> {
        const url = [AppService.API, 'incomes', 'summary'].join('/');
        return this.http.post<any[]>(url, params, /*{ headers: headers }*/);
    }
    get(id: number): Observable<Revenue> {
        const url = [AppService.API, 'incomes', id].join('/');
        return this.http.get<Revenue>(url);
    }
    create(revenue: Revenue): Observable<Revenue> {
        const url = [AppService.API, 'incomes'].join('/');
        return this.http.post<Revenue>(url, revenue);
    }
}
