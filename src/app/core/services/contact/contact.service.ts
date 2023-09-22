import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import Contact from "../../model/contact";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
      private http : HttpClient
  ) { }
    select(term: any): Observable<Contact[]> {
        const url = [environment.apiUrl, 'contacts', term, 'select'].join('/');
        return this.http.get<Contact[]>(url);
    }
}
