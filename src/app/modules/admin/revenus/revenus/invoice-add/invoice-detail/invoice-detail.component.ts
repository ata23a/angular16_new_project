import {Component, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
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
import {map, Observable, Subscription} from "rxjs";
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
registerLocaleData(localeFr);


@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    templateUrl: './invoice-detail.component.html',
    providers:[
        provideNgxMask(),
        { provide: LOCALE_ID, useValue: 'fr-FR'},
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
        CurrencyPipe,
        NgStyle,
        MatButtonModule,
        MatMenuModule,
        MatListModule,
        NgxMaskDirective,
    ],
    styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit, OnDestroy{
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
    submitted;
    categories: Observable<Category[]>;
    itemUnits: Array<ItemUnit>;
    taxes: Array<Tax>;
    items: Array<Item> = [];

    constructor(
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
        private router: Router
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

    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
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

            this.invoiceService.createWithUnit(body).subscribe(res=>{
                this.router.navigate(['invoiceDetail/', res.id]);
            })
            }else{
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
        this.inventoryService.getItemUnits2().subscribe(units=>{
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

        while(this.InvoiceItems.length) {
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
            this.invoiceService.invoicePrint(id).subscribe(res=>{
                console.log(res)
                this.printService.invoice(this.invoice)
            })
                /*.then(res => this.printService.invoice(this.invoice))
                .catch(err => {
                    console.log(err)
                    this.notification.error(null, err.error)
                });*/
        }
        else if (type === 'A4V2') {
            this.invoiceService.invoicePrint(id).subscribe(res=>{
                this.printService.invoiceV2(this.invoice)
            })
                /*.then(res => this.printService.invoiceV2(this.invoice))
                .catch(err => {
                    this.notification.error(null, err.error)
                });*/
        }
        else if (type === 'RECEIPT') {
            if (this.invoice.status !== 'PAID') {
                this.notification.error(null, 'INVOICE_NOT_PAID');
            }
            else {
                this.invoiceService.invoicePrint(id).subscribe(res=>{
                    this.printService.receipt(this.invoice)
                })
                    /*.then(res => this.printService.receipt(this.invoice))
                    .catch(err => this.notification.error(null, err.error));*/
            }
        }
    }

}
