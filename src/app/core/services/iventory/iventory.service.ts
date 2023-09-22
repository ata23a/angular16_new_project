import { Injectable } from '@angular/core';
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Item, ItemInventory, ItemUnit} from "../../model/item";
import {environment} from "../../../../environments/environment";
import {SettingsCompanyService} from "../settingsCompany/settings-company.service";

@Injectable({
  providedIn: 'root'
})
export class IventoryService {

  constructor(
      private http:HttpClient
  ) { }
    getItemUnits(): Promise<ItemUnit[]> {
        const url = [environment.apiUrl, 'inventory/units'].join('/');
        return this.http.get<ItemUnit[]>(url).toPromise();
    }
  getDefaultRoomId = () => {
    const settings = JSON.parse(sessionStorage.getItem(SettingsCompanyService.KEY));
    if (settings && settings['default_inventory_room']) {
      return +settings['default_inventory_room'];
    }
    return 0;
  };
  getInventoryByDefaultRoom(items?: Item[]) {
    const roomId = this.getDefaultRoomId();
    if (roomId) {
      return this.getInventoryByRoom(roomId, items);
    }
    else {
      return Promise.reject({error: 'DEFAULT_ROOM_NOT_FOUND'});
    }
  }
  getInventoryByRoom(room_id: number, items?: Item[]) {
    const url = [environment.apiPascoma, 'inventory', 'room', room_id].join('/');
    return this.http.get<ItemInventory[]>(url)
      .pipe(
        map(inventories => {
          if (items) {
            this.mapInventoriesToItems(inventories, items);
          }
          return inventories;
        })
      )
      .toPromise();
  }
  private mapInventoriesToItems(inventories: ItemInventory[], items: Item[]) {
    items.length = 0;
    if (inventories) {
      for (let inventory of inventories) {
        const value = {
          unit_id: inventory.unit_id,
          InventoryStorage: inventory.InventoryStorage,
          ItemUnit: inventory.ItemUnit,
          quantity: inventory.quantity,
        };

        const find = items.find(
          (item) => item.id === inventory.Item.id
        );

        if (find) {
          find.Inventories.push(value);

          for (let inv of find.Inventories) {
            if (inv.quantity > 0) {
              find.available = inv;
              break;
            }
          }
        } else {
          let inv = {
            ...inventory.Item,
            available: value,
            Inventories: [value],
          };

          items.push(inv);
        }
      }
    }
  }
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
        const settings = JSON.parse(sessionStorage.getItem(SettingsCompanyService.KEY));
        if (settings && settings['default_inventory_out_type']) {
            return +settings['default_inventory_out_type'];
        }

        return 0;
    };
}
