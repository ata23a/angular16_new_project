import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(
      private http : HttpClient
  ) { }
    summary(params?: any): Observable<any[]> {
        /*const auth_token = sessionStorage.getItem('token')
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'X-Access-Token': `${auth_token}`,
        });*/
        const url = ['https://api.capsule.mg/grv', 'incomes', 'summary'].join('/');
        return this.http.post<any[]>(url, params, /*{ headers: headers }*/);
    }
}
