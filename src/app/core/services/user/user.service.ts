import { Injectable } from '@angular/core';
import {User} from "../../user/user.types";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }
  select(term, type?): Promise<User[] | any> {
    const API = environment;
    const url = [API.apiUrl, 'users', term, (type || 'select')].join('/');
    return this.http.get<User[] | any>(url).toPromise();
  }
}
