import { Injectable } from '@angular/core';
import {User} from "../../user/user.types";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }
  select(term, type?): Promise<User[] | any> {
    const url = ['https://api.capsule.mg/grv', 'users', term, (type || 'select')].join('/');
    return this.http.get<User[] | any>(url).toPromise();
  }
}
