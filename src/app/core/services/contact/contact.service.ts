import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Contact} from "../../model/contact";

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
      private http : HttpClient
  ) { }
    select(term: any): Observable<Contact[]> {
        const url = ['https://api.capsule.mg/grv', 'contacts', term, 'select'].join('/');
        return this.http.get<Contact[]>(url);
    }
}
