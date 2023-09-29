import {Injectable} from '@angular/core';
import {InventoryStorage} from "../../model/item";
import {HttpClient} from "@angular/common/http";
import {AppService} from "../app/app.service";

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    list() {
        const url = [AppService.API, 'inventory', 'storage'].join('/');
        return this.httpClient.get<InventoryStorage[]>(url);
    }
}
