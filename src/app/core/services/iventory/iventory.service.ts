import { Injectable } from '@angular/core';
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class IventoryService {

  constructor(
      private http:HttpClient
  ) { }

    select(term: string) {
        const url = ['authentification.service.ts', 'items', term, 'select/unit'].join('/');
        return this.http.get<any[]>(url).pipe(
            map(res => {
                return res.filter(item => {
                    const inventories = item.Inventories;
                    if (!inventories || !inventories.length) return false;

                    let available: any;

                    for (let inventory of inventories) {
                        if (inventory.quantity > 0) {
                            available = inventory;
                            break;
                        }
                    }

                    if (available) {
                        item.available = available;
                    }

                    return true;
                });
            })
        );
    }
    getDefaultOutTypeId = () => {
        const settings = JSON.parse(sessionStorage.getItem(''));
        if (settings && settings['default_inventory_out_type']) {
            return +settings['default_inventory_out_type'];
        }

        return 0;
    };
}
