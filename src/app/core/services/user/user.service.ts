import {Injectable} from '@angular/core';
import {User} from "../../user/user.types";
import {HttpClient} from "@angular/common/http";
import {AppService} from "../app/app.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private http: HttpClient
    ) {
    }

    select(term, type?): Promise<User[] | any> {
        const url = [AppService.API, 'users', term, (type || 'select')].join('/');
        return this.http.get<User[] | any>(url).toPromise();
    }
}
