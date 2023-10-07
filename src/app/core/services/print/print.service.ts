import { Injectable } from '@angular/core';
import Room from "../../model/room";
import _forEach from "lodash.foreach";

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

    public displayRoom(rooms: Room[]): string {
        let str_rooms = '';

        _forEach(rooms, (room, index) => {
            str_rooms += room.id;

            if (index < rooms.length - 1) {
                str_rooms += ' - ';
            }
        });

        return str_rooms;
    }
}
