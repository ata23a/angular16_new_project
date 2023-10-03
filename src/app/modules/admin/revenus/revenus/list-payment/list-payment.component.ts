import {Component, Input, OnInit} from '@angular/core';
import Revenue from "../../../../../core/model/revenue";
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {NgbModal, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {AccountingService} from "../../../../../core/services/accounting/accounting.service";
import {IncomeService} from "../../income.service";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import moment from "moment";
import {ExportService} from "../../../../../core/services/export/export.service";

@Component({
    selector: 'list-payment',
    standalone: true,
    templateUrl: './list-payment.component.html',
    imports: [
        NgbTooltip,
        DatePipe,
        NgIf,
        NgForOf,
        NgxDatatableModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
    ],
    styleUrls: ['./list-payment.component.scss']
})
export class ListPaymentComponent implements OnInit{
    @Input() facture: any;  //
    @Input() dataTable: Revenue[];

    displayedColumns: string[] = [
        'actions',
        'id',
        'paid_at',
        'description',
        'amount',
        'payment_method',
        'account_id',
        'created_at'
    ];
    constructor(
        private accountingService: AccountingService,
        private exportService: ExportService,
    ) {
    }
    ngOnInit(): void {
        console.log(this.dataTable)
    }

    refund(payment) {
        this.accountingService.facture.next(this.facture);
        this.accountingService.payment.next({
            amount: payment.amount * -1,
            account_id: payment.account_id,
            payment_method: payment.payment_method
        });
        this.accountingService.sidePanelPayment.next(true);
    }
    exportToExcel(data, filename) {
        const mapped = data.map(item => {
            return {
                id: item.id,
                paid_at: moment(item.paid_at).format('YYYY-MM-DD HH:mm'),
                description: item.description,
                amount: item.amount,
                account_id: item.account_id,
                payment: item.payment_method,
                user_name: item.User ? item.User.name : '',
                created_at: moment(item.created_at).format('YYYY-MM-DD HH:mm')
            };
        });

        this.exportService.exportToExcel(mapped, filename);
    }
}
