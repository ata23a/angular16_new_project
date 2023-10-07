import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import * as moment from "moment/moment";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import Invoice from "../../../../../core/model/invoice";
import {DatePipe} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatTabsModule} from "@angular/material/tabs";
import {RouterLink} from "@angular/router";
import {InvoiceListComponent} from "../invoice-list/invoice-list.component";
import {FacturPaidComponent} from "../factur-paid/factur-paid.component";
import {DraftComponent} from "../draft/draft.component";

@Component({
    selector: 'app-facturation-revenus',
    standalone: true,
    templateUrl: './facturation-revenus.component.html',
    imports: [
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        DatePipe,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        RouterLink,
        InvoiceListComponent,
        FacturPaidComponent,
        DraftComponent
    ],
    styleUrls: ['./facturation-revenus.component.scss']
})
export class FacturationRevenusComponent implements OnInit{
    dateForm: FormGroup;
    drafts: Invoice[] = [];
    paidInvoices: Invoice[] = [];
    data: any[];
    isLoadingResults: boolean;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('invoiceListComponent') invoiceListComponent: InvoiceListComponent;
    @ViewChild('paidFacturComponent') paidFacturComponent: FacturPaidComponent;
    constructor(
        private formBuilder: FormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.initForm()
    }

    private initForm(){
        this.dateForm = this.formBuilder.group({
            start: [
                moment().startOf('day').toDate(),
                Validators.required
            ],
            end: [
                moment().endOf('day').toDate(),
                Validators.required
            ]
        });
    }

    resetForm() {
        this.invoiceListComponent.resetForm()
    }

    getSummary() {
        const dateParams ={
            start: this.dateForm.get('start').value,
            end: this.dateForm.get('end').value
        }
        this.invoiceListComponent.getSummary()
        this.paidFacturComponent.fetchDrafts(dateParams)
    }
    handlePaidInvoices(paidInvoices: Invoice[]) {
        this.paidInvoices = paidInvoices
    }
}
