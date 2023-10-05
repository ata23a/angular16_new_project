import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import * as moment from 'moment';
import {IncomeService} from "../income.service";
import {NotificationService} from "../../../../core/services/notifications/notification.service";
import {AppModule} from "../../../../app.module";
import {RevenusSammaryTableComponent} from "./revenus-sammary-table/revenus-sammary-table.component";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatTableModule} from "@angular/material/table";
import {catchError, map, merge, of as observableOf, startWith, Subscription, switchMap} from "rxjs";
import {ItemService} from "../../../../core/services/item/item.service";
import {RouterLink} from "@angular/router";
import {MatTabsModule} from "@angular/material/tabs";
import {InvoiceListComponent} from "./invoice-list/invoice-list.component";
import {FuseDrawerComponent} from "../../../../../@fuse/components/drawer";
import {MatSelectModule} from "@angular/material/select";
import Revenue from "../../../../core/model/revenue";
import Swal from "sweetalert2";
import {PipeService} from "../../../../core/services/pipe/pipe.service";
import {SessionService} from "../../../../core/services/session/session.service";
import {JsPrintService} from "../../../../core/services/jsPrint/js-print.service";
import Category from "../../../../core/model/category";
import {CategoryService} from "../../../../core/services/category/category.service";
import _orderBy from "lodash/orderBy";
import Account from "../../../../core/model/account";
import {AccountService} from "../../../../core/services/account/account.service";
import {AppService} from "../../../../core/services/app/app.service";

@Component({
  selector: 'app-revenus',
  standalone   : true,
  templateUrl: './revenus.component.html',
  styleUrls: ['./revenus.component.scss'],
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatIconModule,
        ReactiveFormsModule,
        AppModule,
        RevenusSammaryTableComponent,
        MatButtonModule,
        MatMenuModule,
        DatePipe,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        RouterLink,
        NgIf,
        MatTabsModule,
        InvoiceListComponent,
        FuseDrawerComponent,
        MatOptionModule,
        MatSelectModule,
        NgForOf,
        NgClass
    ]
})
export class RevenusComponent implements AfterViewInit{
    dateForm: FormGroup;
    addRevenueForm: FormGroup;
    dateFormSubmitted: boolean;
    loading: boolean;
    submitted: boolean;
    summary2:any = {};
    data: [] = [];
    resultsLength = 0;
    size = 0;
    displayedColumns: string[] = ['payé le', 'contact', 'catégorie', 'description', 'compte', 'montant', 'créer le'];
    summary: any[];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    isRateLimitReached = false;
    selectedRevenue: Revenue;
    sidePanelOpen: boolean;
    subscription = new Subscription();
    formFieldHelpers: string[] = [''];
    categories: Array<Category>;
    accounts: Array<Account>;
    constructor(
        private formBuilder: FormBuilder,
        private incomeService: IncomeService,
        private itemService : ItemService,
        private firstNamePipe: PipeService,
        private sessionService: SessionService,
        private jsPrintService: JsPrintService,
        private categoryService: CategoryService,
        private accountService: AccountService,
        public appService: AppService
    ) {
    }
    ngOnInit(){
        this.initForm()
        this.loadSummary()
        this.initForm2()
        this.accountService.list()
            .pipe(map(item => _orderBy(item, ['name'], ['asc'])))
            .toPromise()
            .then(res => this.accounts = res)
            .catch(err => {

            });

        this.categoryService.list({type: 'income'})
            .pipe(map(item => _orderBy(item, ['name'], ['asc'])))
            .toPromise()
            .then(res => this.categories = res)
            .catch(err => {

            });
    }

    save() {
        this.submitted = true;

        if (this.addRevenueForm.valid) {
            const formValue = this.addRevenueForm.getRawValue();

            if (this.selectedRevenue) {
                this.sidePanelOpen = false;
                Swal.fire({
                    toast: true, position: 'top',
                    title: 'Info',
                    text: 'Bientôt',
                    icon: 'info', showConfirmButton: false, timer: 3000,
                })
            }
            else {
                const cT = moment();
                const revenue = new Revenue(Object.assign({}, formValue, {
                    amount: +formValue.amount,
                    contact_id: formValue.contact.id,
                    contact_name: formValue.contact.name,
                    currency_code: 'MGA',
                    currency_rate: 1,
                    paid_at: moment(formValue.paid_at).set({
                        hours: cT.get('hours'),
                        minutes: cT.get('minutes')
                    }).format(),
                    type: 'REVENUE'
                }));

                this.incomeService.create(revenue)
                    .toPromise()
                    .then(res => {
                        this.subscription.add(
                            this.incomeService.get(res.id).subscribe(revenue => {
                                this.jsPrintService.printCashReceipt({
                                    id: revenue.id,
                                    account_name: revenue.Account.name,
                                    amount: revenue.amount,
                                    category_name: revenue.Category.name,
                                    contact_name: revenue.Contact.name,
                                    description: revenue.description,
                                    paid_at: moment(revenue.paid_at).format('YYYY-MM-DD'),
                                    type: 'CREDIT',
                                    user_name: `${this.firstNamePipe.transform(this.sessionService.getUser().name)}.`
                                });

                                //this.reset()
                                Swal.fire({
                                    toast: true,
                                    position: 'top',
                                    showConfirmButton: false,
                                    showClass: {
                                        backdrop: 'swal2-noanimation',
                                        popup: '',
                                        icon: ''
                                    },
                                    timer: 9000,
                                    title: 'Succées!',
                                    text: 'Ajout avec succées',
                                    icon: 'success',
                                });
                            })
                        );
                    })
                    .catch(err => {
                        Swal.fire({
                            toast: true, position: 'top',
                            title: 'Erreur',
                            text: 'erreur',
                            icon: 'error', showConfirmButton: false, timer: 3000,
                        })

                    })//this.notification.error(null, err.error));
            }
        }
        else {
            Swal.fire({
                toast: true, position: 'top',
                title: 'Attention',
                text: 'Form non valider',
                icon: 'warning', showConfirmButton: false, timer: 3000,
            })
        }
    }
    private initForm2() {
        this.submitted = false;
        this.addRevenueForm = this.formBuilder.group({
            currency: false,  //  false:Ar, true:Fmg
            paid_at: [null, Validators.required],
            amount: [null, Validators.required],
            description: [null, Validators.required],
            contact: null,
            account_id: [null, Validators.required],
            category_id: [null, Validators.required],
            payment_method: [null, Validators.required]
        });
    }

    loadSummary(params?: any) {
        this.loading = true;

        this.incomeService.summary(params).subscribe( response =>{
            this.summary2 = response
        })

    }
    resetForm() {
        this.dateFormSubmitted = false;
        this.dateForm.reset({
            start: moment().startOf('day').toDate(),
            end: moment().endOf('day').toDate()
        });

        this.submit();
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
    submit(){
        this.isLoadingResults = true
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
        this.itemService.paginate(filterConfig).pipe(
            map((res)=>{
                this.isLoadingResults = false
                this.data = res.data
                console.log(this.data)
            })
        ).subscribe()
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
                            pointer: this.sort.active,
                            direction: this.sort.direction
                        },
                        slice: {
                            page: this.paginator.pageIndex + 1,
                            size: 25
                        },
                    }
                    return this.itemService.paginate(config).pipe(catchError(() => observableOf(null)));
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

    protected readonly frames = frames;
}
