import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AppService} from "../app/app.service";
import {Observable} from "rxjs";
import User from "../../model/user";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user: any;

    constructor(
        private http: HttpClient
    ) {
    }

    select(term, type?): Promise<User[] | any> {
        const url = [AppService.API, 'users', term, (type || 'select')].join('/');
        return this.http.get<User[] | any>(url).toPromise();
    }
    get(id): Observable<User> {
        const url = [AppService.API, 'users', id].join('/');
        return this.http.get<User>(url);
    }
}
