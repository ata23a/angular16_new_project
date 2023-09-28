import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input, NgZone,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
    map,
    Observable, startWith,
    Subject, Subscription,
} from "rxjs";
import Item, {ItemInventory, ItemUnit} from "../../../../../../../core/model/item";
import {IventoryService} from "../../../../../../../core/services/iventory/iventory.service";
import {TaxService} from "../../../../../../../core/services/tax/tax.service";
import {NotificationService} from "../../../../../../../core/services/notifications/notification.service";
import {InvoiceService} from "../../../../../../../core/services/invoice/invoice.service";
import {BillService} from "../../../../../../../core/services/bill/bill.service";
import {MaintenanceService} from "../../../../../../../core/services/maintenance/maintenance.service";
import {SessionService} from "../../../../../../../core/services/session/session.service";
import {NgSelectComponent, NgSelectModule} from "@ng-select/ng-select";
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSelectModule} from "@angular/material/select";
import {MatIconModule} from "@angular/material/icon";
import {NgbActiveModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import item from "../../../../../../../core/model/item";

@Component({
    selector: 'app-modal',
    standalone: true,
    providers: [
        NgbActiveModal,
    ],
    templateUrl: './modal.component.html',
    imports: [
        ReactiveFormsModule,
        NgSelectModule,
        AsyncPipe,
        NgIf,
        NgClass,
        MatInputModule,
        MatAutocompleteModule,
        NgForOf,
        MatSelectModule,
        MatIconModule,
        NgbModule,
        FormsModule,

    ],
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
    modes = ['IM', 'orale', 'IV'];
    units: ItemUnit[] = [];
    subscription = new Subscription();
    form: FormGroup;
    submitted: boolean;
    itemControl = new FormControl();
    @Input() selected: any;
    @Input() type: 'BILL' | 'REQUEST' | 'HEALTH' | 'INVOICE' = 'REQUEST';
    @Input() hasTaxes: boolean = false;
    @ViewChild('itemSelect') itemSelect: ElementRef;
    @ViewChild('descriptionField') descriptionFieldRef: ElementRef;
    taxes$ = this.taxService.list();
    items: Item[] = [];
    filteredOptions: Observable<Item[]>;

    displayFn(item: Item): string {
        return item ? item.name : '';
    }

    isInventory(type: string) {
        return type === 'GOODS' || type === 'ASSET' || type === 'SERVICES';
    }

    constructor(
        public dialogRef: MatDialogRef<ModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private inventoryService: IventoryService,
        private taxService: TaxService,
        private notification: NotificationService,
        private invoiceService: InvoiceService,
        private billService: BillService,
        private maintenanceService: MaintenanceService,
        private formBuilder: FormBuilder,
        private sessionService: SessionService,
        private ngZone: NgZone
    ) {
    }

    ngOnInit(): void {
        console.log(this.selected)

        this.filteredOptions = this.itemControl.valueChanges.pipe(
            startWith(""),
            map(value => (typeof value === "string" ? value : value.name)),
            map(name => (name ? this._filter(name) : this.items.slice()))
        );
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
        this.initForm()
        if (this.selected) {
            if (this.isInventory(this.selected.item_type)) {
                this.loadUnits();
            }

            this.form.patchValue(this.selected);
        }
    }

    private _filter(name: string): item[] {
        const filterValue = name.toLowerCase();

        return this.items.filter(
            option => option.name.toLowerCase().indexOf(filterValue) === 0
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.ngZone.runOutsideAngular(() => {
            if (this.selected) {
                if (this.descriptionFieldRef) {
                    this.descriptionFieldRef.nativeElement.focus();
                }
            }
            else if (this.itemSelect) {
                this.itemSelect.nativeElement.focus();
            }
        });

    }

    removeItem() {
        if (/(ROOM|BUS_SEAT)/.test(this.selected.item_type)) return this.notification.error(null, 'DELETE_ERROR');

        let promise = null;

        switch (this.type) {
            case 'INVOICE':
                promise = this.invoiceService.removeItem(this.selected.invoice_id, this.selected.id).toPromise();
                break;
            case 'BILL':
                promise = this.billService.removeItem(this.selected.bill_id, this.selected.id).toPromise();
                break;
            case 'REQUEST':
                promise = this.maintenanceService.removeItem(this.selected.bill_id, this.selected.id).toPromise();
                break;
            default:
        }

        /*if (promise) {
            promise.then(() => this.activeModal.dismiss('DELETE')).catch(err => this.notification.error(null, err.error));
        }
        else this.notification.error(null, 'TYPE_NOT_FOUND');*/
    }

    private getMetaByType() {
        switch (this.type) {
            case 'HEALTH':
                return this.formBuilder.group({
                    dosage: [null, Validators.required],
                    administration_mode: [null, Validators.required],
                    duration: [null, Validators.required]
                });
            default:
                return null;
        }
    }

    private initForm() {
        this.form = this.formBuilder.group({
            id: null,
            item: [null, Validators.required],
            description: [null, [
                conditionalValidator(() => {
                    return !!this.selected;
                }, Validators.required, 'DESCRIPTION_EMPTY')
            ]],
            item_id: [null, Validators.required],
            item_type: 'GOODS',
            company_id: this.sessionService.getCompanyId(),
            storage_id: [null, [
                conditionalValidator(() => {
                    const type = this.form.get('item_type').value;
                    return this.isInventory(type);
                }, Validators.required, 'STORAGE_EMPTY')
            ]],
            name: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            price: [0, Validators.required],
            meta: this.getMetaByType(),
            units: null,
            total: 0,
            unit_id: [null, [
                conditionalValidator(() => {
                    const type = this.form.get('item_type').value;
                    return this.isInventory(type);
                }, Validators.required, 'UNIT_EMPTY')
            ]],
            Taxes: null,
            sku: ''
        });

        this.subscription.add(
            this.form.valueChanges.subscribe(value => {
                const {price, quantity} = value;
                this.form.get('total').setValue((price || 0) * (quantity || 0), {emitEvent: false});
            })
        );
    }

    private loadUnits() {
        this.inventoryService.getItemUnits().then(units => {
            this.units = units;
        }).catch();
    }

    onSelectItem2 = (event): void => {
        let clear = true;
        let res = event.source.value
        if (event && res.id) {
            if (res.type === 'SERVICES' || (res.available && res.available.quantity)) {
                clear = false;
                this.form.patchValue({
                    item_id: res.id,
                    item_type: res.type || 'GOODS',
                    name: res.name,
                    price: (this.type === 'BILL' ? res.purchase_price : res.sale_price) || 0,
                    units: res.Inventories.map((inventory: ItemInventory) => {
                        return {
                            id: inventory.unit_id,
                            name: inventory.ItemUnit.name,
                            storage_id: inventory.InventoryStorage ? inventory.InventoryStorage.id : null,
                            remainingQuantity: inventory.quantity
                        }
                    }),
                    total: 0
                });
            }
            else {
                this.notification.error(null, 'ITEM_OUT_OF_STOCK');
            }
        }

        if (clear) {
            this.form.patchValue({
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

    onSelectUnit(event: any) {
        this.form.patchValue({
            storage_id: event ? event.value : null
        });
    }

    save() {
        this.submitted = true;
        const value = this.form.getRawValue();
        let it = value;

        if (this.selected) {
            const {id, description, meta, Taxes} = value;
            it = {id, description, meta, Taxes};
        }
        else {
            delete it.item;
            delete it.units;
        }
        this.dialogRef.close(it);
    }
}

export function conditionalValidator(predicate: BooleanFn, validator: ValidatorFn, errorNamespace?: string): ValidatorFn {
    return (formControl => {
        if (!formControl.parent) {
            return null;
        }
        let error = null;
        if (predicate()) {
            error = validator(formControl);
        }

        if (errorNamespace && error) {
            const customError = {};
            customError[errorNamespace] = error;
            error = customError
        }

        return error;
    });
}

interface BooleanFn {
    (): boolean;
}
