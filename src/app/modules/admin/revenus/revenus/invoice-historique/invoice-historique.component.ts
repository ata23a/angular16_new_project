import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {BillService} from "../../../../../core/services/bill/bill.service";
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import {MaintenanceService} from "../../../../../core/services/maintenance/maintenance.service";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import _orderBy from 'lodash.orderby';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";

@Component({
    selector: 'invoice-historique',
    standalone: true,
    templateUrl: './invoice-historique.component.html',
    imports: [
        ReactiveFormsModule,
        DatePipe,
        NgIf,
        NgForOf,
        MatTableModule,
    ],
    styleUrls: ['./invoice-historique.component.scss']
})
export class InvoiceHistoriqueComponent implements OnInit, OnChanges{
    form:FormGroup;
    @Input() dataId:number;
    @Input() dataTable:Array<any>;
    @Input() dataType:'INVOICE' | 'MAINTENANCE' | 'BILL';
    @Input() redirectLink:string;
    @Output() onSubmit = new EventEmitter<any>();

    sortedData: Array<any>;
    submitted:boolean;
    displayedColumns: string[] = ['description', 'created_at', 'status_code', 'user'];

    displayedColumns2: string[] = ['description', 'ajouter'];
    dataSource = new MatTableDataSource<any>([]);
    constructor(
        private billService:BillService,
        private formBuilder:FormBuilder,
        private invoiceService: InvoiceService,
        private maintenanceService:MaintenanceService,
        private notification: NotificationService
    ) {
    }
    ngOnInit(): void {
        this.initForm()
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.sortedData = _orderBy(changes.dataTable.currentValue,['created_at'] , ['desc']);
    }

    saveHistory() {
        this.submitted = true;

        if (this.form.valid) {
            const params = Object.assign({}, this.form.value, {
                id: this.dataId
            });

            if (this.dataType === 'INVOICE') {
                this.invoiceService.addHistory(params)
                    .toPromise()
                    .then(res => {
                        this.submitted = false;
                        this.form.reset();
                        this.onSubmit.emit();
                        //this.notification.success(null, 'SAVE_SUCCESS');
                    })
                    .catch(err => this.notification.error(null, err.error));
            }
            else if (this.dataType === 'BILL') {
                this.billService.addHistory(params)
                    .toPromise()
                    .then(res => {
                        this.submitted = false;
                        this.form.reset();
                        this.onSubmit.emit();
                        this.notification.success(null, 'SAVE_SUCCESS');
                    })
                    .catch(err => this.notification.error(null, err.error));
            }
            else {
                this.maintenanceService.addHistory(params)
                    .toPromise()
                    .then(() => {
                        this.submitted = false;
                        this.form.reset();
                        this.onSubmit.emit();
                        this.notification.success(null, 'SAVE_SUCCESS');
                    })
                    .catch(err => this.notification.error(null, err.error));
            }
        }
        else {
            this.notification.error(null, 'FORM_NOT_VALID');
        }
    }
    displayItems = (item) => {
        return this.maintenanceService.formatHistoryDescription(item);
    }

    private initForm() {
        this.submitted = false;
        this.form = this.formBuilder.group({
            description: [null, Validators.required]
        });
    }
}
