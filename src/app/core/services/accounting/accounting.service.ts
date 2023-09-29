import {Injectable} from '@angular/core';
import {InvoiceItem} from "../../model/invoice";
import _forEach from "lodash/forEach";
import _sumBy from 'lodash.sumby'
import {AppService} from "../app/app.service";
import Revenue from "../../model/revenue";
import BillPayment from "../../model/bill-payment";
import {BillItem} from "../../model/bill";

@Injectable({
    providedIn: 'root'
})
export class AccountingService {

    constructor() {
    }

    getTotalDiscount(items: Array<InvoiceItem>): number {
        let amount = 0;

        _forEach(items, (item) => {
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

    getTotalPayment(payments: Revenue[] | BillPayment[]): number {
        return _sumBy(payments, (revenu) => {
            if (revenu.payment_method === 'SP') return 0;
            else if (revenu.currency_code === AppService.DEFAULT_CURRENCY) return revenu.amount;
            else return revenu.amount / (revenu.currency_rate || 1);
        });
    }

    getPaymentDue(items: InvoiceItem[] | BillItem[], item_type?: 'BUS_SEAT' | 'SERVICES'): number {
        return _sumBy(items, item => {
            if (item_type) {
                return (item_type === item.item_type) ? (item.quantity * item.price) : 0;
            }
            else return item.quantity * item.price;
        });
    }

    getTotalTax(items: Array<InvoiceItem>): number {
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
}
