import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import Bill from "../../model/bill";

@Injectable({
  providedIn: 'root'
})
export class BillService {

  constructor(
    private httpClient: HttpClient
  ) { }

  removeItem(id: number, item_id: number): Observable<any> {
    const url = [environment.apiUrl, 'bills', id, 'item', item_id, 'unit'].join('/');
    return this.httpClient.delete<any>(url);
  }
  cancelWithUnit(bill: Bill): Observable<Bill> {
    const url = [environment.apiUrl, 'bills', bill.id, 'unit'].join('/');
    return this.httpClient.delete<Bill>(url);
  }
}
