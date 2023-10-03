import {Injectable} from '@angular/core';
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {RequestHistory, Requests, RequestStatus, RequestType} from "../../model/request";
import {AppService} from "../app/app.service";
import {TranslocoService} from "@ngneat/transloco";

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {

    private _statuses: Array<string>;

    constructor(
        private httpClient: HttpClient,
        private translateService: TranslocoService
    ) {
    }

    get statuses() {
        return this._statuses;
    }
    addHistory(params): Observable<any> {
        const url = [AppService.API, 'requests', params['id'], 'note'].join('/');
        return this.httpClient.put<any>(url, params);
    }

    create(request): Observable<Requests> {
        const url = [AppService.API, 'requests'].join('/');
        return this.httpClient.post<Requests>(url, request);
    }

    listStatus(category_id?: number | null, strict?: boolean) {
        const url = [AppService.API, 'requests', 'status'].join('/');
        return this.httpClient.get<RequestStatus[]>(url, {params: {type: 'all'}}).pipe(
            map(statuses => {
                if (!category_id && !strict) {
                    return statuses;
                }

                return statuses.filter(status => {
                    if (category_id !== null || strict) {
                        return status.category_id === category_id
                    }
                    else {
                        return true;
                    }
                });
            })
        );
    }

    getTypes(params: any, category_id?: number | null, strict?: boolean) {
        const url = [AppService.API, 'requests', 'type'].join('/');
        return this.httpClient.get<RequestType[]>(url, {params}).pipe(
            map(types => {
                types.sort((a, b) => {
                    return b.id - a.id;
                });

                if (!category_id && !strict) {
                    return types;
                }

                return types.filter(type => {
                    if (category_id !== null || strict) {
                        return type.category_id === category_id
                    }
                    else {
                        return true;
                    }
                });
            })
        );
    }

    updateStatus(params): Observable<any> {
        const url = [AppService.API, 'requests', params.id, 'status'].join('/');
        return this.httpClient.put<Request>(url, params);
    }

    update(request): Observable<Request> {
        const url = ['authentification.service.ts', 'requests', request.id].join('/');
        return this.httpClient.put<Request>(url, request);
    }

    removeItem(id: number, item_id: number): Observable<any> {
        const url = [AppService.API, 'requests', id, 'item', item_id, 'unit'].join('/');
        return this.httpClient.delete<any>(url);
    }

    get(id): Observable<Requests> {
        const url = [AppService.API, 'requests', id].join('/');
        return this.httpClient.get<Requests>(url);
    }

    updateBy(id: number, body, type: string): Observable<any> {
        const url = [AppService.API, 'requests', id, type].join('/');
        return this.httpClient.post<any>(url, body);
    }

    removeBy(id: number, type: string, secondId: number): Promise<any> {
        const url = [AppService.API, 'requests', id, type, secondId].join('/');
        return this.httpClient.delete<any>(url).toPromise();
    }

    updateExtendedBy(id: number, body: any, type: string): Promise<any> {
        const API = environment;
        const url = [API, 'requests', id, 'extended', type].join('/');
        return this.httpClient.put<any>(url, body).toPromise();
    }

    joinObject(o: object) {
        let out = '';
        const keys = Object.keys(o);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            out += k + ': ' + o[k];
            if (i < keys.length - 1) {
                out += ', ';
            }
        }

        return out;
    }

    formatHistoryDescription(history: RequestHistory) {
        let description = '';

        //const translated = this.translateService.instant('status.' + history.status_code);

        if (history.status_code === 'ADD' || history.status_code === 'REMOVE' || history.status_code === 'REMOVED') {
            try {
                const items = JSON.parse(history.description);

                for (let i = 0; i < items.length; i++) {
                    description += items[i].name + ' ('

                    if (history.status_code === 'REMOVE' || history.status_code === 'REMOVED') {
                        description += '-';
                    }

                    description += items[i].quantity + ')';

                    if (items.length > 1 && (i + 1) < items.length) {
                        description += ' - ';
                    }
                }
            }
            catch(e) {
                description = history.description;
            }
        }
        else if (/ADD_ITEM|REMOVE_ITEM/.test(history.status_code)) {
            if (history.meta) {
                description += history.meta.name + ' ('

                if (history.status_code === 'REMOVE_ITEM') {
                    description += '-';
                }

                description += history.meta.quantity + ')';
            }
            else {
                description = history.description;
            }

        }
        else if (/(CONTACT_CHANGE|STAFF_CHANGE:REMOVE|STAFF_CHANGE:ADD)/.test(history.status_code)) {
            let name = '';
            try {
                if (history.status_code === 'CONTACT_CHANGE') {
                    history.description = history.description.replace(/Previous contact : /g, '');
                }

                const parsed: any = JSON.parse(history.description);
                if (parsed.constructor === Array) {
                    if (parsed.length) {
                        name = parsed[0].name || '';
                    }
                    else {
                        name = '-';
                    }
                }
                else{
                    name = parsed.name || '';
                }
            }
            catch(err) {
                name = history.description;
            }

            if (history.status_code === 'CONTACT_CHANGE') {
                name = 'Précédent: ' + name;
            }

            //description = `${translated} - ${name}`;
        }
        else if (history.status_code === 'STATUS_UPDATE') {
            //description = this.translateService.instant(`status.${history.description}`);
        }
        else if (history.status_code === 'EXTENDED_STATUS_UPDATE') {
            //description = `${translated} - Précédent: ${(history.description || '-')}`;
        }
        else if (history.status_code === 'EXTENDED_TYPE_UPDATE') {
            //description = `${translated} - Précédent: ${(history.description || '-')}`;
        }
        else {
            try {
                const data = JSON.parse(history.description);
                if (data.constructor === Array) {
                    data.forEach((prop, index) => {
                        description += this.joinObject(prop);

                        if (index < data.length - 1) {
                            description += ' | ';
                        }
                    });
                }
                else {
                    description  = this.joinObject(data);
                }
            }
            catch(err) {
                description = history.description;
            }
        }

        return description;
    }
}
