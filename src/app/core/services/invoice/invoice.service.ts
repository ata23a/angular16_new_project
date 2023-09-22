import { Injectable } from '@angular/core';
import _sumBy from 'lodash.sumby';
import _forEach from 'lodash.foreach';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import Invoice, {InvoiceItem} from "../../model/invoice";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private httpClient: HttpClient
  ) { }
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
}
