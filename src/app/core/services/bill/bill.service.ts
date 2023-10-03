import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import Bill from "../../model/bill";
import {AppService} from "../app/app.service";

@Injectable({
    providedIn: 'root'
})
export class BillService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    removeItem(id: number, item_id: number): Observable<any> {
        const url = [AppService.API, 'bills', id, 'item', item_id, 'unit'].join('/');
        return this.httpClient.delete<any>(url);
    }

    cancelWithUnit(bill: Bill): Observable<Bill> {
        const url = [AppService.API, 'bills', bill.id, 'unit'].join('/');
        return this.httpClient.delete<Bill>(url);
    }
    addHistory(params): Observable<any> {
        const url = [AppService.API, 'bills', params['id'], 'note'].join('/');
        return this.httpClient.post<any>(url, params);
    }
}
