import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Invoice from "../../../../../core/model/invoice";
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import moment from "moment";
import _filter from "lodash/filter";
import {FormGroup} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatTableModule} from "@angular/material/table";
import {RouterLink} from "@angular/router";
import {ExportService} from "../../../../../core/services/export/export.service";
import {PrintService} from "../../../../../core/services/print/print.service";

@Component({
    selector: 'app-factur-paid',
    standalone: true,
    templateUrl: './factur-paid.component.html',
    imports: [
        DatePipe,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        RouterLink
    ],
    styleUrls: ['./factur-paid.component.scss']
})
export class FacturPaidComponent implements OnInit{
    @Output() paidInvoicesEvent = new EventEmitter<Invoice[]>();
    displayedColumns :string[] = ['Numero', 'contact', 'reservation', 'categorie', 'total', 'impaye', 'date_facture', 'creer_le'];
    paidInvoices: Invoice[] = [];
    drafts: Invoice[] = [];
    resultsLength = 0;
    size = 0;
    @Input() dateForm: FormGroup
    constructor(
        private invoiceService: InvoiceService,
        private exportService: ExportService,
        private printService: PrintService
    ) {
    }
    ngOnInit() {
        this.fetchDrafts({
            start: moment(this.dateForm.controls.start.value).format(),
            end: moment(this.dateForm.controls.end.value).format()
        });
    }
    fetchDrafts(dateParams?: any) {
        this.invoiceService.drafts(dateParams)
            .then(invoices => {
                console.log(invoices)
                this.paidInvoices = _filter(invoices, invoice => invoice.balance <= 0);
                this.paidInvoicesEvent.emit(this.paidInvoices)
            })
            .catch(err => {});
    }
    exportToExcel = (data, filename) => {
        const mapped = data.map(invoice => {
            return {
                id: invoice.id,
                contact_id: invoice.contact_id,
                contact_name: invoice.contact_name || invoice.Contact.name,
                reservation_id: invoice.Reservation ? invoice.Reservation.id : null,
                date_in: invoice.Reservation ? moment(invoice.Reservation.date_in).format('YYYY-MM-DD') : null,
                date_out: invoice.Reservation ? moment(invoice.Reservation.date_out).format('YYYY-MM-DD') : null,
                rooms: invoice.Reservation ? this.printService.displayRoom(invoice.Reservation.Rooms) : null,
                category_name: invoice.Category ? invoice.Category.name : null,
                subtotal: invoice.subtotal,
                balance: invoice.balance,
                invoiced_at: moment(invoice.invoiced_at).format('YYYY-MM-DD'),
                created_at: moment(invoice.created_at).format('YYYY-MM-DD HH:mm')
            };
        });

        this.exportService.exportToExcel(mapped, filename);
    };
}
