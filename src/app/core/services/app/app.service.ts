import {Injectable} from '@angular/core';
import moment from "moment";

@Injectable({
    providedIn: 'root'
})
export class AppService {

    constructor() {
    }

    public static DEFAULT_CURRENCY = 'MGA';

    public static set API(value: string) {
        localStorage.setItem('API', value);
    };

    public static get API() {
        return localStorage.getItem('API');
    }

    getInvoiceCode = () => {
        return 'INV-' + moment().valueOf();
    }
}
