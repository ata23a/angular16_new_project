import { Injectable } from '@angular/core';
import _sumBy from 'lodash.sumby';
import _forEach from 'lodash.foreach';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import Invoice, {InvoiceItem} from "../../model/invoice";
import {Observable} from "rxjs";
const DEFAULT_CURRENCY = 'MGA';
@Injectable({
  providedIn: 'root'
})
export class InvoiceService {


  constructor(
    private httpClient: HttpClient
  ) { }

    get(id?: any, action?: any): Observable<any> {
        const url = [environment.apiPascoma, 'invoices'];

        if (id) url.push(id);
        if (action) url.push(action);

        return this.httpClient.get<any>(url.join('/'));
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
    const url = [environment.apiPascoma, 'invoices/units'].join('/');
    return this.httpClient.post<Invoice>(url, invoice);
  }
    getTotalDiscount(invoiceItems: InvoiceItem[]): number {
        let amount = 0;

        _forEach(invoiceItems, item => {
            amount += _sumBy(item.Taxes, (tax) => {
                if (tax.type === 'DISCOUNT') {
                    return (item.price * item.quantity) * tax.rate / 100;
                } else {
                    return 0;
                }
            });
        });

        return amount;
    }

    invoicePrint(id): Promise<any> {
        const url = [environment.apiPascoma, 'invoices', id, 'print'].join('/');
        return this.httpClient.get<any>(url).toPromise();
    }
}
