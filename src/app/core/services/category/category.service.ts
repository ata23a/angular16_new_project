import {Injectable} from '@angular/core';
import Category from "../../model/category";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppService} from "../app/app.service";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(
        private http: HttpClient
    ) {
    }

    list(params?: any): Observable<Category[]> {
        const url = [AppService.API, 'categories'].join('/');
        return this.http.get<Category[]>(url, {params: params});
    }
}
