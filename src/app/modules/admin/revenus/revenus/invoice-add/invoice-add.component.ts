import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {debounceTime, distinctUntilChanged, Observable, Subject, Subscription, switchMap} from "rxjs";
import {ContactService} from "../../../../../core/services/contact/contact.service";
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import {SharedService} from "../../../../../core/services/shared/shared.service";
import {NgbDateStruct, NgbHighlight, NgbInputDatepicker, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule, NgClass} from "@angular/common";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import Contact from "../../../../../core/model/contact";
import {AppService} from "../../../../../core/services/app/app.service";
import {SessionService} from "../../../../../core/services/session/session.service";
import Invoice from "../../../../../core/model/invoice";
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import Category from "../../../../../core/model/category";
import {NgSelectModule} from "@ng-select/ng-select";
import {CategoryService} from "../../../../../core/services/category/category.service";
import Item, {ItemInventory} from "../../../../../core/model/item";
import {IventoryService} from "../../../../../core/services/iventory/iventory.service";
import Tax from "../../../../../core/model/tax";
import {TaxService} from "../../../../../core/services/tax/tax.service";
import {MatIconModule} from "@angular/material/icon";
import {MatSelectModule} from "@angular/material/select";
import {SettingsCompanyService} from "../../../../../core/services/settingsCompany/settings-company.service";
import {AppModule} from "../../../../../app.module";

@Component({
    selector: 'app-invoice-add',
    templateUrl: './invoice-add.component.html',
    standalone: true,
    imports: [
        MatCardModule,
        MatInputModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        FormsModule,
        NgbTypeahead,
        NgClass,
        NgbHighlight,
        MatInputModule,
        MatFormFieldModule,
        CommonModule,
        NgbInputDatepicker,
        NgSelectModule,
        MatIconModule,
        MatSelectModule,
        AppModule
    ],
    styleUrls: ['./invoice-add.component.scss']
})
export class InvoiceAddComponent implements OnInit{
    subscription: Subscription;
    search = null;
    categories: Observable<Category[]>;
    submitted: Boolean;
    touched = false;
    @Input() minKeyword = 4;
    @ViewChild('inputElt') inputRef: ElementRef<HTMLInputElement>;
    loading = false;
    value = null;
    disabled = false;
    display = null;
    addInvoiceForm: FormGroup;
    searchResults: Contact[] = [];
    items: Item[] = [];
    taxes: Observable<Tax[]>;
    itemControl = new FormControl();
    private searchTerms = new Subject<string>();

    @Output() selectContact = new EventEmitter<Contact>();
    @Output() removeContact = new EventEmitter<Contact>();
    phoneselected: any;
    constructor(
        private contactService: ContactService,
        private sharedService: SharedService,
        private notification: NotificationService,
        private formBuilder: FormBuilder,
        private appService: AppService,
        private sessionService: SessionService,
        private invoiceService: InvoiceService,
        private categoryService: CategoryService,
        private inventoryService: IventoryService,
        private taxService: TaxService,
        private settingsCompanyService: SettingsCompanyService
    ) {
    }

    ngOnInit(): void {
        this.getCompanyInfo();
        this.inventoryService.getInventoryByDefaultRoom(this.items).then(
          inventories => {
              if (this.items) {
                  this.items = [...this.items];
              }
              else {
                  this.notification.error(null, 'ITEMS_NOT_SET');
              }
          }
        ).catch(err => this.notification.error(null, err.error));
        this.taxes = this.taxService.list();
        this.categories = this.categoryService.list({type: 'income'});
        this.initForm()
        this.searchTerms
            .pipe(
                debounceTime(3000),
                distinctUntilChanged(),
                switchMap((term) => {
                    if (term.length < this.minKeyword) {
                        return [];
                    } else {
                        this.loading = true;

                        return this.contactService.select(term)
                            .toPromise()
                            .then((res) => {
                                this.searchResults = res;
                            })
                            .catch((err) => this.notification.error(null, err.error))
                            .finally(() => (this.loading = false));
                    }
                })
            )
            .subscribe();
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
    getTotal(formGroup: FormGroup) {
        const total = formGroup.controls.quantity.value * formGroup.controls.price.value;

        formGroup.patchValue({total: total});

        return total;
    }
    onSelectUnit = (event, group): void => {
        console.log(event)
        group.patchValue({
            unit_id: event ? event.id : null,
            storage_id: event ? event.storage_id : null
        });
    }
    onSelectItem = (event, group): void => {
        let clear = true;
        let res  = event.value
        if (event && res.id) {
            if (res.type === 'SERVICES' || (res.available && res.available.quantity)) {
                clear = false;
                group.patchValue({
                    item_id: res.id,
                    item_type: res.type || 'GOODS',
                    name: res.name,
                    price: res.sale_price,
                    units: res.Inventories.map((inventory: ItemInventory) => {
                        return {
                            id: inventory.unit_id,
                            name: inventory.ItemUnit.name,
                            storage_id: inventory.InventoryStorage ? inventory.InventoryStorage.id : null,
                            remainingQuantity: inventory.quantity
                        }
                    }),
                    unit_id: res.unit_id,
                    total: 0
                });
            }
            else {
                this.notification.error(null, 'ITEM_OUT_OF_STOCK');
                console.log("stock epuiser")
            }
        }

        if (clear) {
            group.patchValue({
                item: null,
                item_id: null,
                item_type: null,
                units: null,
                unit_id: null,
                price: 0,
                name: null,
                storage_id: null
            });
        }
    }
    getTotalDiscount(): number {
        const invoiceItems = this.addInvoiceForm.value.InvoiceItems;

        return this.invoiceService.getTotalDiscount(invoiceItems);
    }
    removeItem(index) {
        this.InvoiceItems.removeAt(index);
    }
    save() {
        this.submitted = true;
        console.log(this.addInvoiceForm)

        if (this.addInvoiceForm.valid) {
            const formValue = this.addInvoiceForm.getRawValue();

            if (formValue.InvoiceItems) {
                formValue.InvoiceItems.forEach(invItem => {
                    delete invItem.item;
                    delete invItem.units;
                });
            }

            const invoice = new Invoice(
                Object.assign(
                    {},
                    formValue,
                    {
                        amount: this.getBalance(),
                        contact_id: formValue.contact.id,
                        contact_name: formValue.contact.name,
                        category_id: formValue.category.id,
                        category_name: formValue.category.name
                    }
                )
            );

            this.invoiceService.createWithUnit(invoice).subscribe( res =>{
                if (res){
                    console.log('reussi')
                }else {
                    console.log('erreur')
                }
            })
              /*.then(res => {
                this.router.navigate(['/income/invoice/detail/', res.id]);
                this.notification.success(null, 'SAVE_SUCCESS');
              })
              .catch(err => this.notification.error(null, err.error));*/
        }
        else {
            this.notification.error(null, 'FORM_NOT_VALID');
        }
    }
    getBalance() {
        return this.getPaymentDue() + this.getTotalTax();
    }
    getPaymentDue() {
        const items = this.addInvoiceForm.controls['InvoiceItems'].value;
        let amount = 0;

        for (let i = 0; i < items.length; i++) {
            amount += items[i]['quantity'] * items[i]['price'];
        }

        return amount;
    }

    getTotalTax(): number {
        const invoiceItems = this.addInvoiceForm.value.InvoiceItems;

        return this.invoiceService.getTotalTax(invoiceItems);
    }

    private initForm() {
        const today = new Date();

        this.addInvoiceForm = this.formBuilder.group({
            contact: [null, Validators.required],
            category: [null, Validators.required],
            currency_code: ['MGA', Validators.required],
            currency_rate: 1,
            invoiced_at: [today.toISOString().split('T')[0], Validators.required],
            due_at: [today.toISOString().split('T')[0], Validators.required],
            invoice_number: this.appService.getInvoiceCode(),
            order_number: null,
            notes: null,
            invoice_status_code: 'draft',
            InvoiceItems: this.formBuilder.array([])
        });

        this.addItem();
    }
    get InvoiceItems(): FormArray {
        return this.addInvoiceForm.get('InvoiceItems') as FormArray;
    }
    addItem() {
        const company_id = this.sessionService.getCompanyId();

        const fg = this.formBuilder.group({
            company_id: company_id,
            description: null,
            item_id: 0,
            item_type: 'GOODS',
            item: [null, Validators.required],
            name: ['', Validators.required],
            storage_id: [null, Validators.required],
            unit_id: null,
            quantity: [1, Validators.required],
            units: null,
            price: [0, [Validators.required, Validators.min(1)]],
            total: 0,
            sku: null,
            meta: null,
            Taxes: null
        });

        this.InvoiceItems.push(fg);
    }
    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }
    onChange: any = () => {
    }
    onTouched: any = () => {
    }
    clear() {
        this.removeContact.emit(this.value);
        this.display = null;
        this.search = null;
        this.value = null;
        this.onChange(null);
    }
    onSelectContact = (event): void => {
        this.markAsTouched();
        event.preventDefault();

        if (event.item) {
            this.value = event.item;
            this.display = this.value.name;
            this.phoneselected = this.value.phone
            this.selectContact.emit(event.item);
            this.onChange(event.item);
        }
        else {
            this.sharedService.updateSidePanel(true);
            this.sharedService.newContact({phone: this.inputRef.nativeElement.value} as any);

            //  Subscribe to new created contact
            if (!this.subscription && !this.touched) {
                this.subscription = this.sharedService.contact$.subscribe((value) => {
                    if (value) {
                        this.value = value;
                        this.display = this.value.name;
                        this.selectContact.emit(event.item);
                        this.onChange(value);
                    }
                });
            }
        }
    }
}
