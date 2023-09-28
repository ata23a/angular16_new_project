import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ItemService {
    public static TS_KEY = 'TS_INCOME';

    constructor(
        private http: HttpClient,
    ) {
    }

    public getConfig(key?): TableState {
        const search = sessionStorage.getItem(key || ItemService.TS_KEY);

        return search ? JSON.parse(search) : {
            search: {},
            filter: {},
            sort: {pointer: "created_at", direction: "desc"},
            slice: {page: 1, size: 25}
        };
    }

    paginate(tableState: TableState): Observable<any> {
        const url = [environment.apiUrl, 'incomes', 'paginate'].join('/');
        return this.http.post<any>(url, tableState);
    }
    paginate2(tableState: TableState): Observable<any> {
        const url = [environment.apiPascoma, 'incomes', 'paginate'].join('/');
        return this.http.post<any>(url, tableState);
    }
}

export interface TableState {
    search: {},
    filter: {},
    sort: {},
    slice: {}
}





