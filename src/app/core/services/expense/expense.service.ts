import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import Expense from "../../model/expense";
import {AppService} from "../app/app.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  constructor(
      private httpClient: HttpClient
  ) { }

    get(id: number): Observable<Expense> {
        const url = [AppService.API, 'expenses', id].join('/');
        return this.httpClient.get<Expense>(url);
    }
}
