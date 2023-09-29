import {Injectable} from '@angular/core';
import _sumBy from 'lodash.sumby';
import _forEach from 'lodash.foreach';
import {HttpClient} from "@angular/common/http";
import Invoice, {InvoiceItem} from "../../model/invoice";
import {catchError, Observable, throwError} from "rxjs";
import {TableState} from "../item/item.service";
import {AppService} from "../app/app.service";

const DEFAULT_CURRENCY = 'MGA';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    public static TS_KEY = 'TS_INVOICE';


    constructor(
        private httpClient: HttpClient
    ) {
    }

    updateItemWithUnit(id: number, item_id: number, body: any) {
        const url = [AppService.API, 'invoices', id, 'item', item_id, 'unit'].join('/');
        return this.httpClient.put<any>(url, body);
    }

    search(id): Observable<any> {
        const url = [AppService.API, 'invoices', id, 'search'].join('/');
        return this.httpClient.get<any>(url);
    }

    cancel(invoice: Invoice): Observable<Invoice> {
        const url = [AppService.API, 'invoices', invoice.id].join('/');
        return this.httpClient.delete<Invoice>(url);
    }

    addItem(id: number, body: any): Observable<any> {
        const url = [AppService.API, 'invoices', id, 'item/unit'].join('/');
        return this.httpClient.post<any>(url, body).pipe(
            catchError(err => {
                if (err.error && typeof err.error.message === 'string') {
                    if (err.error.message.includes('nonnegative_tri_inventories_quantity')) {
                        err.error.message = 'STOCK_NOT_ENOUGH';
                    }
                }
                return throwError(err);
            })
        );
    }

    summary(tableState: TableState, key?): Observable<ServerResult> {
        sessionStorage.setItem(key || InvoiceService.TS_KEY, JSON.stringify(tableState));

        const url = [AppService.API, 'invoices', 'summary'].join('/');
        return this.httpClient.post<ServerResult>(url, tableState);
    }

    get(id?: any, action?: any): Observable<any> {
        const url = [AppService.API, 'invoices'];

        if (id) url.push(id);
        if (action) url.push(action);

        return this.httpClient.get<any>(url.join('/'));
    }

    removeItem(id: number, item_id: number): Observable<any> {
        const url = [AppService.API, 'invoices', id, 'item', item_id, 'unit'].join('/');
        return this.httpClient.delete<any>(url);
    }

    drafts(params?: any): Promise<Invoice[]> {
        const url = [AppService.API, 'invoices', 'draft'].join('/');
        return this.httpClient.post<Invoice[]>(url, params).toPromise();
    }

    getTotalTax(items: any[]): number {
        return _sumBy(items, item => {
            return _sumBy(item.Taxes, (tax) => {
                if (tax.type === 'FIXED') {
                    return item.quantity * tax.rate;
                }
                else if (tax.type !== 'DISCOUNT' && tax.type !== 'OTHER') {
                    return (item.price * item.quantity) * tax.rate / 100;
                }
                else {
                    return 0;
                }
            });
        });
    }

    getPaymentDue = (invoiceItems: InvoiceItem[], extra?: any[]): number => {

        return _sumBy(invoiceItems, (item) => {
            return item.quantity * item.price;
        });
    };

    getTotalPayment(invoice: Invoice): number {
        return _sumBy(invoice?.Revenues, (revenu) => {
            if (revenu.currency_code === DEFAULT_CURRENCY) {
                return revenu.amount;
            }
            else {
                return revenu.amount / (revenu.currency_rate || 1);
            }
        });
    }

    createWithUnit(invoice: Invoice): Observable<Invoice> {
        const url = [AppService.API, 'invoices/units'].join('/');
        return this.httpClient.post<Invoice>(url, invoice);
    }

    getTotalDiscount(invoiceItems: InvoiceItem[]): number {
        let amount = 0;

        _forEach(invoiceItems, item => {
            amount += _sumBy(item.Taxes, (tax) => {
                if (tax.type === 'DISCOUNT') {
                    return (item.price * item.quantity) * tax.rate / 100;
                }
                else {
                    return 0;
                }
            });
        });

        return amount;
    }

    invoicePrint(id): Observable<any> {
        const url = [AppService.API, 'invoices', id, 'print'].join('/');
        return this.httpClient.get<any>(url);
    }
}

export interface ServerResult {
    data: DisplayedItem<any>[];
    summary: Summary;
}

export interface DisplayedItem<T> {
    index: number;
    value: T;
}

export interface Summary {
    page: number;
    size: number;
    filteredCount: number;
}
