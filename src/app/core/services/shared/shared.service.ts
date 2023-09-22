import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import Contact from "../../model/contact";

@Injectable({
  providedIn: 'root'
})
export class SharedService {
    private sidePanelSource = new Subject<boolean>();
    private contactCreateSource = new Subject<Partial<Contact>>();
    private contactSource = new Subject<Contact>();
    contact$ = this.contactSource.asObservable();
  constructor() { }
    updateSidePanel(value: boolean) {
        this.sidePanelSource.next(value);
    }
    newContact(contact: Partial<Contact>) {
        this.contactCreateSource.next(contact);
    }
}
