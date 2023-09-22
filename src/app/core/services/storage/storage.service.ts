import { Injectable } from '@angular/core';
import {InventoryStorage} from "../../model/item";
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private httpClient:HttpClient
  ) { }
  list() {
    const url = [environment.apiUrl, 'inventory', 'storage'].join('/');
    return this.httpClient.get<InventoryStorage[]>(url);
  }
}
