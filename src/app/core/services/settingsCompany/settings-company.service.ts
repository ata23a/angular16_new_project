import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {AppService} from "../app/app.service";
import {Observable} from "rxjs";
import Company from "../../model/company";

@Injectable({
    providedIn: 'root'
})
export class SettingsCompanyService {
    public static KEY = 'TS_COMPANY_SETTINGS'

    constructor(
        private http: HttpClient
    ) {
    }

    getCompanyDefaultSettings(key) {
        let session: string;
        session = sessionStorage.getItem(SettingsCompanyService.KEY);
        return session ? JSON.parse(session)[key] : null;
    }

    list(isList?: boolean): Observable<Company[]> {
        const url = isList ? [AppService.API, 'companies/list'].join('/') : [AppService.API, 'companies'].join('/');
        return this.http.get<Company[]>(url);
    }
    getSettings(id: number, fields?: any[]) {
        const url = [AppService.API, 'companies', id, 'settings'].join('/');

        if (fields) {
            return this.http.post<any>(url, {fields});
        }
        else {
            return this.http.get<any>(url);
        }
    }
}
