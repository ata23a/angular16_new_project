import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import _filter from "lodash/filter";
import Invoice from "../../../../../core/model/invoice";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import moment from "moment";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SessionService} from "../../../../../core/services/session/session.service";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {ItemService} from "../../../../../core/services/item/item.service";
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    merge,
    of as observableOf,
    startWith,
    Subject,
    switchMap
} from "rxjs";
import {RouterLink} from "@angular/router";
import {DatePipe} from "@angular/common";

@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    standalone: true,
    imports: [
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        RouterLink,
        DatePipe,
        FormsModule
    ],
    styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit, AfterViewInit{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    drafts: Invoice[] = [];
    paidInvoices: Invoice[] = [];
    displayedColumns: string[] = ['Numero', 'contact', 'reservation', 'categorie', 'total', 'impaye', 'date_facture', 'creer_le'];
    dateForm: FormGroup;
    dateFormSubmitted = false;
    data: any[];
    resultsLength = 0;
    size = 0;
    isLoadingResults = false;
    isRateLimitReached = false;
    searchDescription: string
    searchDescriptionUpdate = new Subject<string>()
    ngOnInit(): void {
        this.debounceInputDescription()
        this.initForm()
        this.fetchDrafts({
            start: moment(this.dateForm.controls.start.value).format(),
            end: moment(this.dateForm.controls.end.value).format()
        })
    }
    loadDataBillDefaultConfig() {
        this.isLoadingResults = true
        const config = {
            filter: {},
            sort: {pointer: "created_at", direction: "desc"},
            slice: {
                page: this.paginator.pageIndex + 1,
                size: 25
            },
            search: {}
        }
        this.invoiceService.summary(config).pipe(
            catchError(() => observableOf(null))
        ).subscribe(data => {
            this.isLoadingResults = false;
            if (data === null) {
                // Gérer l'erreur ou le cas où les données ne sont pas disponibles
            } else {
                this.resultsLength = data.summary.filteredCount;
                this.size = data.summary.size;
                this.data = data.data;
            }
        });
    }
    debounceInputDescription() {
        this.searchDescriptionUpdate.pipe(
            debounceTime(900),
            distinctUntilChanged())
            .subscribe(value => {
                if (!value) {
                    this.loadDataBillDefaultConfig()
                }
                else {
                    this.isLoadingResults = true
                    const config = {
                        filter: {},
                        search: {
                            value: value,
                            scope: ['contact_name'],
                            flags: 'i',
                            escape: false
                        },
                        sort: {pointer: "created_at", direction: "desc"},
                        slice: {
                            page: this.paginator.pageIndex + 1,
                            size: 25
                        }
                    }
                    this.invoiceService.summary(config).pipe(
                        catchError(() => observableOf(null))
                    ).subscribe(data => {
                        this.isLoadingResults = false;
                        if (data === null) {
                            // Gérer l'erreur ou le cas où les données ne sont pas disponibles
                        } else {
                            this.resultsLength = data.summary.filteredCount;
                            this.size = data.summary.size;
                            this.data = data.data;
                        }
                    });
                }
            });

    }
    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    const config = {
                        search: {},
                        filter: {},
                        sort: {
                            pointer: "created_at", direction: "desc"
                        },
                        slice: {
                            page: this.paginator.pageIndex + 1,
                            size: 25
                        },
                    }
                    return this.invoiceService.summary(config).pipe(catchError(() => observableOf(null)));
                }),
                map(data => {
                    this.isLoadingResults = false;
                    this.isRateLimitReached = data === null;

                    if (data === null) {
                        return [];
                    }
                    this.resultsLength = data.summary.filteredCount;
                    this.size = data.summary.size
                    return data.data;
                }),
            )
            .subscribe(data => (this.data = data));
    }

    constructor(
        private invoiceService: InvoiceService,
        private notification: NotificationService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
    ) {
    }


    getSummary() {
        this.isLoadingResults = true

        if (this.dateForm.valid) {
            this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
            const filterConfig = {
                filter: {
                    created_at: [{
                        value: this.dateForm.value.start,
                        operator: 'gte',
                        type: 'string'
                    },
                        {
                            value: this.dateForm.value.end,
                            operator: 'lte',
                            type: 'string'
                        }
                    ]
                },
                sort: {},
                slice: {
                    page: this.paginator.pageIndex + 1,
                    size: 25
                },
                search: {}
            }
            this.invoiceService.summary(filterConfig).pipe(
                map((res)=>{
                    console.log(res)
                    this.isLoadingResults = false
                    this.resultsLength = res.summary.filteredCount;
                    this.size = res.summary.size
                    this.data = res.data
                })
            ).subscribe()
        }
    }
    private fetchDrafts(dateParams?: any) {
        this.invoiceService.drafts(dateParams)
            .then(invoices => {
                this.data = invoices
                this.drafts = _filter(invoices, {status: 'DRAFT'});
                console.log(this.drafts)
                this.paidInvoices = _filter(invoices, invoice => invoice.balance <= 0);
            })
            .catch(err => this.notification.error(null, err.error));
    }
    resetForm() {
        this.dateFormSubmitted = false;
        this.dateForm.reset({
            start: moment().startOf('day').toDate(),
            end: moment().endOf('day').toDate()
        });

        this.getSummary();
    }
    private initForm() {
        this.dateForm = this.formBuilder.group({
            start: [moment().startOf('day').toDate(), Validators.required],
            end: [moment().endOf('day').toDate(), Validators.required]
        });
        this.sessionService.setDateForm(this.dateForm, InvoiceService.TS_KEY, 'created_at');
    }

}
