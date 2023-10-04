import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import Account from "../../model/account";
import {AppService} from "../app/app.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(
      private http : HttpClient
  ) { }

    list(params?: any): Observable<Account[]> {
        const url = [AppService.API, 'accounts'].join('/');
        return this.http.get<Account[]>(url, {params: params});
    }
}
