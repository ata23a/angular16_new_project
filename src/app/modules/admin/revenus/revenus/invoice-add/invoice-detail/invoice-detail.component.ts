import {Component, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {InvoiceService} from "../../../../../../core/services/invoice/invoice.service";
import {NotificationService} from "../../../../../../core/services/notifications/notification.service";
import {InvoicePrintService} from "../../../../../../core/services/print/invoice-print.service";
import Invoice from "../../../../../../core/model/invoice";
import _orderBy from 'lodash/orderBy';
import _forEach from "lodash/forEach";
import {AccountingService} from "../../../../../../core/services/accounting/accounting.service";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SettingsCompanyService} from "../../../../../../core/services/settingsCompany/settings-company.service";
import {SessionService} from "../../../../../../core/services/session/session.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatTabsModule} from "@angular/material/tabs";
import {AppModule} from "../../../../../../app.module";
import {NgSelectModule} from "@ng-select/ng-select";
import {AsyncPipe, CurrencyPipe, NgClass, NgForOf, NgIf, NgStyle, registerLocaleData} from "@angular/common";
import {map, Observable, Subscription, throwError} from "rxjs";
import Category from "../../../../../../core/model/category";
import {CategoryService} from "../../../../../../core/services/category/category.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {Item, ItemUnit} from "../../../../../../core/model/item";
import {IventoryService} from "../../../../../../core/services/iventory/iventory.service";
import {MatDialog} from "@angular/material/dialog";
import {ModalComponent} from "./modal/modal.component";
import Tax from "../../../../../../core/model/tax";
import {TaxService} from "../../../../../../core/services/tax/tax.service";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {Confirmable} from "../../../../../../core/shared/comfirmable/comfirmable.decorator";
import moment from "moment";
import {NgxMaskDirective, provideNgxMask} from "ngx-mask";
import localeFr from '@angular/common/locales/fr';
import {ComfirmModalComponent} from "./comfirm-modal/comfirm-modal.component";
import {ListPaymentComponent} from "../../list-payment/list-payment.component";
import Revenue from "../../../../../../core/model/revenue";
import {InvoiceHistoriqueComponent} from "../../invoice-historique/invoice-historique.component";
import {TranslateModule} from "@ngx-translate/core";
import {FuseDrawerComponent} from "../../../../../../../@fuse/components/drawer";
import Bill from "../../../../../../core/model/bill";
import {JsPrintService} from "../../../../../../core/services/jsPrint/js-print.service";
import {RoleService} from "../../../../../../core/services/role/role.service";
import {IncomeService} from "../../../income.service";
import Account from "../../../../../../core/model/account";
import {AppService} from "../../../../../../core/services/app/app.service";
import {PipeService} from "../../../../../../core/services/pipe/pipe.service";
import {AccountService} from "../../../../../../core/services/account/account.service";
import Swal from "sweetalert2";
import {UtilityService} from "../../../../../../core/services/utility/utility.service";

registerLocaleData(localeFr);

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    templateUrl: './invoice-detail.component.html',
    providers: [
        TranslateModule,
        CurrencyPipe,
        provideNgxMask(),
        {provide: LOCALE_ID, useValue: 'fr-FR'},
    ],
    imports: [
        MatTabsModule,
        ReactiveFormsModule,
        AppModule,
        RouterLink,
        NgSelectModule,
        NgIf,
        NgClass,
        AsyncPipe,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        NgForOf,
        MatInputModule,
        MatDatepickerModule,
        MatIconModule,
        NgStyle,
        MatButtonModule,
        MatMenuModule,
        MatListModule,
        NgxMaskDirective,
        ListPaymentComponent,
        CurrencyPipe,
        InvoiceHistoriqueComponent,
        FuseDrawerComponent,
    ],
    styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
    subscription = new Subscription();
    invoice: Invoice;
    id;
    Total = {
        balance: 0,
        discount: 0,
        payment: 0,
        payment_due: 0,
        tax: 0,
        unpaid: 0
    };
    invoiceForm: FormGroup;
    submitted: boolean;
    categories: Observable<Category[]>;
    itemUnits: Array<ItemUnit>;
    taxes: Array<Tax>;
    items: Array<Item> = [];
    isCollapsed: boolean[] = [];
    revenus: Revenue[] = [];
    histories: Array<any>;
    form: FormGroup;
    rewardForm: FormGroup;
    facture: Invoice | Bill;
    dateLocked: any;
    accounts: Array<Account>;
    formFieldHelpers: string[] = [''];
    sidePanelOpen: boolean;
    @ViewChild('drawer') drawer: FuseDrawerComponent;

    constructor(
        public appService: AppService,
        private invoiceService: InvoiceService,
        private notification: NotificationService,
        private printService: InvoicePrintService,
        private accountingService: AccountingService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
        private settingsCompanyService: SettingsCompanyService,
        private activatedRoute: ActivatedRoute,
        private categoryService: CategoryService,
        private inventoryService: IventoryService,
        private dialog: MatDialog,
        private taxService: TaxService,
        private router: Router,
        private jsPrintService: JsPrintService,
        private firstNamePipe: PipeService,
        private roleService: RoleService,
        private incomeService: IncomeService,
        private accountService: AccountService,
        public utilityService: UtilityService
    ) {
    }

    ngOnInit() {
        this.categories = this.categoryService.list({type: 'income'});
        this.id = this.activatedRoute.snapshot.paramMap.get('id');
        this.getInvoice(this.id)
        this.initForm()
        this.getCompanyInfo()
        this.getUnits();
        this.getTaxes()
        this.initForm2()
        this.onSubscribe()
    }

    openSidePanelPayment() {
        this.accountingService.facture.next(this.invoice);
        this.accountingService.sidePanelPayment.next(true);
    }

    private onSubscribe() {
        this.subscription.add(
            this.accountingService.sidePanelPayment.subscribe(value => {
                console.log(value)
                this.sidePanelOpen = value;
                if (this.sidePanelOpen) {
                    this.dateLocked = true;

                    this.accountService.list()
                        .pipe(map(item => _orderBy(item, ['name'], ['asc'])))
                        .toPromise()
                        .then(res => this.accounts = res)
                        .catch(err => this.notification.error(null, err.error));
                }
            })
        );

        this.subscription.add(
            this.accountingService.facture.subscribe(value => {
                console.log(value)
                if (value) {
                    let paymentDue: any;
                    let totalPayment: any;
                    let totalTax: any;
                    let totalDiscount: any;

                    this.facture = new Invoice(value);
                    paymentDue = this.accountingService.getPaymentDue(this.facture.InvoiceItems);
                    totalPayment = this.accountingService.getTotalPayment(this.facture.Revenues);
                    totalTax = this.accountingService.getTotalTax(this.facture.InvoiceItems);
                    totalDiscount = this.accountingService.getTotalDiscount(this.facture.InvoiceItems);

                    const accountId = this.sessionService.getUserExtra('account_id');

                    this.form.patchValue({
                        account_id: accountId,
                        amount: paymentDue + totalTax - totalDiscount - totalPayment
                    });

                    this.rewardForm.patchValue({account_id: accountId});
                }
            })
        );

        this.subscription.add(
            this.accountingService.payment.subscribe(value => {
                if (value) {
                    this.form.patchValue({
                        account_id: value.account_id || this.sessionService.getUserExtra('account_id'),
                        amount: value.amount,
                        payment_method: value.payment_method
                    });
                }
            })
        );
    }

    private initForm2() {
        const cT = moment().toDate();

        this.form = this.formBuilder.group({
            description: null,
            paid_at: [
                {value: cT, disabled: true},
                Validators.required
            ],
            amount: [null, Validators.required],
            account_id: [null, Validators.required],
            payment_method: [null, Validators.required]
        });

        this.rewardForm = this.formBuilder.group({
            paid_at: [
                {value: cT, disabled: true},
                Validators.required
            ],
            account_id: [null, Validators.required],
            description: null
        });
    }

    updateLockState(form: FormGroup): void {
        this.dateLocked = !this.dateLocked;
        if (this.dateLocked) {
            form.get('paid_at').disable();
        }
        else {
            form.get('paid_at').enable();
        }
    }

    save() {
        this.submitted = true;

        if (this.form.valid) {
            const formValue = this.form.getRawValue();
            const body = Object.assign({}, formValue, {
                category_id: this.facture.category_id,
                currency_code: 'MGA',
                currency_rate: 1,
                contact_name: this.facture.Contact ? this.facture.Contact.name : this.facture.Vendor.name
            });

            body.invoice_id = this.facture.id;
            body.type = 'INVOICE_PAYMENT';

            this.invoiceService.createPayment(body)
                .toPromise()
                .then(res => {
                    this.sendSMSRole();

                    this.subscription.add(
                        this.incomeService.get(res.id).subscribe(payment => {
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
                            this.jsPrintService.printCashReceipt({
                                id: payment.id,
                                account_name: payment.Account.name,
                                amount: payment.amount,
                                category_name: payment.Category.name,
                                contact_name: payment.Contact ? payment.Contact.name : payment.contact_name,
                                description: payment.description,
                                paid_at: moment(payment.paid_at).format('YYYY-MM-DD'),
                                type: payment.amount < 0 ? 'DEBIT' : 'CREDIT',
                                user_name: `${this.firstNamePipe.transform(this.sessionService.getUser().name)}.`
                            });
                        })
                    );
                })
                .catch(err => {
                    console.log(err)
                    if (err.status === 400) {
                        Swal.fire({
                            toast: true, position: 'top',
                            title: 'Erreur',
                            text: 'Crédit non pris en charge',
                            icon: 'error', showConfirmButton: false, timer: 3000,
                        })
                    }
                });
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

    private sendSMSRole() {
        const paymentMethod = this.form.get('payment_method').value;

        if (paymentMethod === 'SP') {
            const userName = this.firstNamePipe.transform(this.sessionService.getUser().name);
            const contactName = this.facture.Contact.name || this.facture.contact_name;
            const message = `SP ${contactName} . Facture #${this.facture.id} . U ${userName}`;

            this.roleService.sendSMSRole(message, 'sp').toPromise()
                .then(() => {
                })
                .catch(err => throwError(err.error));
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // Méthode pour basculer l'état du collapse
    toggleCollapse(index: number) {
        this.isCollapsed[index] = !this.isCollapsed[index];
    }


    openConfirm() {
        const modalRef = this.dialog.open(ComfirmModalComponent, {
            width: '300px'
        });
        modalRef.componentInstance.title = 'Annuler la facture';
        modalRef.componentInstance.type = 'danger';
        modalRef.afterClosed().subscribe(result => {
            if (result) {
                this.invoiceService.cancel(this.invoice)
                    .toPromise()
                    .then(res => {
                        this.resetForm();
                        this.notification.info(null, 'INVOICE_CANCELED');
                    })
                    .catch(err => this.notification.error(null, err.error));
            }
        });
    }

    @Confirmable({title: 'Confirmation',}, true)
    duplicate(response?) {
        if (response) {
            const dateNow = moment();

            if (this.invoice.InvoiceItems.length) {
                this.invoice.InvoiceItems.forEach(invItem => {
                    delete invItem.id;
                    delete invItem.invoice_id;
                });
            }

            const body = new Invoice(
                Object.assign(
                    {},
                    this.invoice,
                    {
                        invoiced_at: dateNow.format(),
                        due_at: dateNow.format()
                    }
                )
            );

            delete body.id;
            delete body.InvoiceHistories;

            this.invoiceService.createWithUnit(body).subscribe(res => {
                this.router.navigate(['invoiceDetail/', res.id]);
            })
        }
        else {
            console.log('error')
        }
    }

    getTotal(formGroup: FormGroup) {
        const total = formGroup.controls.quantity.value * formGroup.controls.price.value;

        formGroup.patchValue({total: total});

        return total;
    }

    private getTaxes() {
        this.taxService.list().pipe(
            map(taxes => taxes.map(item => {
                    item['disabled'] = true;
                    return item;
                })
            )
        ).subscribe(value => {
            this.taxes = value
        });
    }

    isNew = (item) => item.controls['state'] ? false : true;

    private getUnits() {
        this.inventoryService.getItemUnits2().subscribe(units => {
            this.itemUnits = units;
        })
    }

    editItem(item: any) {
        const dialogRef = this.dialog.open(ModalComponent, {
            width: '500px',
        });

        const component: ModalComponent = dialogRef.componentInstance
        component.items = this.items;
        component.type = 'INVOICE';
        component.hasTaxes = true;
        component.selected = item;
        dialogRef.afterClosed().subscribe(item => {
            if (item) {
                this.updateIndividualItem(item);
            }
        });
    }

    private updateIndividualItem(item: any) {
        this.invoiceService.updateItemWithUnit(this.invoice.id, item.id, item).toPromise().then(() => {
            this.resetForm();
            this.notification.success(null, 'UPDATE_SUCCESS');
        }).catch(err => {
            this.notification.error(null, err.error);
        });
    }

    openAppendModal() {
        const dialogRef = this.dialog.open(ModalComponent, {
            width: '500px', // Définissez la largeur de votre modal
        });
        const component: ModalComponent = dialogRef.componentInstance
        component.type = 'INVOICE';
        component.hasTaxes = true;
        dialogRef.afterClosed().subscribe(item => {
            if (item) {
                this.saveIndividualItem(item);
            }
        });
    }

    private saveIndividualItem(item: any) {
        item = {
            ...item,
            invoice_id: this.invoice.id
        };

        delete item.item;
        delete item.units;

        this.invoiceService.addItem(this.invoice.id, item).toPromise().then(() => {
            this.resetForm();
            this.notification.success(null, 'SAVE_SUCCESS');
        }).catch(err => {
            this.notification.error(null, err.error);
        });
    }

    resetForm() {
        this.invoice = null;
        //this.submitted_history = false;
        this.submitted = false;

        //this.historyForm.reset();

        while (this.InvoiceItems.length) {
            this.InvoiceItems.removeAt(0);
        }

        this.invoiceForm.reset({invoice_number: {value: '', disabled: true}});
        this.getInvoice(this.id);
    }

    private getCompanyInfo() {
        const id = this.sessionService.getActiveCompany().id;

        this.settingsCompanyService.getSettings(id)
            .toPromise()
            .then(res => {
                const settings = JSON.stringify({
                    tos: res.Settings['general.company_tos'],
                    tos_package: res.Settings['general.company_tos_package'],
                    name: res.Settings['general.company_name'],
                    email: res.Settings['general.company_email'],
                    phone: res.Settings['general.company_phone'],
                    seal: res.Settings['general.company_seal'],
                    address_1: res.Settings['general.company_address_line_1'],
                    address_2: res.Settings['general.company_address_line_2'],
                    default_print_mode: res.Settings['general.default_print_mode'],
                    logo: res.Settings['general.company_logo'],
                    signature: res.Settings['general.company_signature'],
                    nif: res.Settings['general.company_NIF'],
                    stat: res.Settings['general.company_STAT'],
                    rcs: res.Settings['general.company_RCS'],
                    parcel_price_by_volume: res.Settings['general.default_parcel_price_by_volume'],
                    parcel_calculation_mode: res.Settings['general.default_parcel_calculation_mode'],
                    parcel_insurance_percentage: res.Settings['general.default_parcel_insurance_percentage'],
                    parcel_coefficient_increase: res.Settings['general.default_parcel_coefficient_increase'],
                    parcel_coefficient_volumic_mass: res.Settings['general.default_parcel_coefficient_volumic_mass'],
                    default_invoice_category: +res.Settings['general.default_invoice_category'],
                    default_provider: +res.Settings['general.default_provider'],
                    default_fuel_product: +res.Settings['general.default_fuel_product'],
                    default_men_insurance_item: +res.Settings['general.default_men_insurance_item'],
                    default_hotel_event_type: +res.Settings['general.default_hotel_event_type'],
                    default_men_intervention_category: +res.Settings['general.default_men_intervention_category'],
                    default_inventory_category: +res.Settings['general.default_inventory_category'],
                    default_inventory_out_category: +res.Settings['general.default_inventory_out_category'],
                    default_inventory_transfer_category: +res.Settings['general.default_inventory_transfer_category'],
                    default_inventory_out_type: res.Settings['general.default_inventory_out_type'],
                    default_inventory_order_type: res.Settings['general.default_inventory_order_type'],
                    default_inventory_room: +res.Settings['general.default_inventory_room'],
                    default_health_category: +res.Settings['general.default_health_category'],
                    default_inventory_storage: +res.Settings['general.default_inventory_storage'],
                    default_cleaning_type: res.Settings['general.default_cleaning_type'],
                    default_timeline_event_type: res.Settings['general.default_timeline_event_type'],
                    default_tracker_category: +res.Settings['general.default_tracker_category'],
                    default_trip_displaced_payment_category: +res.Settings['general.default_trip_displaced_payment_category'],
                    default_trip_expense_category: +res.Settings['general.default_trip_expense_category'],
                    default_trip_participation_category: +res.Settings['general.default_trip_participation_category'],
                    default_trip_manifest_category: +res.Settings['general.default_trip_manifest_category'],
                    default_trip_versement_category: +res.Settings['general.default_trip_versement_category'],
                    default_part_category: +res.Settings['general.default_part_category'],
                    default_fuel_category: +res.Settings['general.default_fuel_category'],
                    default_labour_category: +res.Settings['general.default_labour_category'],
                    default_bill_part_category: +res.Settings['general.default_bill_part_category'],
                    default_bill_labour_category: +res.Settings['general.default_bill_labour_category'],
                    default_bill_fuel_category: +res.Settings['general.default_bill_fuel_category'],
                    default_bill_trip_expense_category: +res.Settings['general.default_bill_trip_expense_category'],
                    default_bill_inventory_transfer_category: +res.Settings['general.default_bill_inventory_transfer_category'],
                    meta: res.Settings['general.company_meta'] ? JSON.parse(res.Settings['general.company_meta']) : {}
                });

                sessionStorage.setItem(SettingsCompanyService.KEY, settings);

            })
            .catch(err => this.notification.error(null, err.error));
    }

    get InvoiceItems(): FormArray {
        return this.invoiceForm.get('InvoiceItems') as FormArray;
    }

    private arrayToForm(invoiceItems) {
        invoiceItems.sort((a, b) => a.id - b.id);

        _forEach(invoiceItems, (item) => {
            this.InvoiceItems.push(
                this.formBuilder.group(
                    Object.assign(
                        {},
                        item,
                        {
                            item,
                            Taxes: [item.Taxes]
                        }
                    )
                )
            );
        });
    }

    private initForm() {
        this.submitted = false;
        this.invoiceForm = this.formBuilder.group({
            invoiced_at: [null, Validators.required],
            invoice_number: [{value: '', disabled: true}],
            category_id: [null, Validators.required],
            due_at: [null, Validators.required],
            contact: [null, Validators.required],
            notes: null,
            InvoiceItems: this.formBuilder.array([])
        });
    }

    private getInvoice(id) {
        this.invoiceService.get(id)
            .toPromise()
            .then(invoice => {
                this.invoice = invoice;
                this.invoice.Revenues = _orderBy(invoice.Revenues, ['id'], ['desc']);
                this.revenus = this.invoice.Revenues
                this.histories = this.invoice.InvoiceHistories
                this.Total.discount = this.accountingService.getTotalDiscount(this.invoice.InvoiceItems);
                this.Total.payment = this.accountingService.getTotalPayment(this.invoice.Revenues);
                this.Total.payment_due = this.accountingService.getPaymentDue(this.invoice.InvoiceItems);
                this.Total.tax = this.accountingService.getTotalTax(this.invoice.InvoiceItems);
                this.Total.balance = this.Total.payment_due + this.Total.tax - this.Total.discount - this.Total.payment;

                setTimeout(() => {
                    this.invoiceForm.patchValue(Object.assign({}, invoice, {
                        contact: invoice.Contact,
                        category_id: invoice.category_id,
                        invoiced_at: new Date(invoice.invoiced_at),
                        due_at: new Date(invoice.due_at)
                    }));
                    this.arrayToForm(invoice.InvoiceItems);
                }, 800);
            })
            .catch(err => {
                this.notification.error(null, err.error);
            });
    }

    print(type) {
        const id = this.invoice.id
        if (type === 'A4') {
            this.invoiceService.invoicePrint(id).subscribe(res => {
                this.printService.invoice(this.invoice)
            })
        }
        else if (type === 'A4V2') {
            this.invoiceService.invoicePrint(id).subscribe(res => {
                this.printService.invoiceV2(this.invoice)
            })
        }
        else if (type === 'RECEIPT') {
            if (this.invoice.status !== 'PAID') {
                this.notification.error(null, 'INVOICE_NOT_PAID');
            }
            else {
                this.invoiceService.invoicePrint(id).subscribe(res => {
                    this.printService.receipt(this.invoice)
                })
            }
        }
    }

}
