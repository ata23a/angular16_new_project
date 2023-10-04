import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {AppService} from "../app/app.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
      private http: HttpClient
  ) { }

    sendSMSRole(smsContent: string, type: 'cash_desk' | 'sp'): Observable<any> {
        const url = `${AppService.API}/sms/role/${type}`;
        return this.http.post<any>(url, {message: smsContent});
    }
}
