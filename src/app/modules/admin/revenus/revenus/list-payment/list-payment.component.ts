import {Component, Input, OnInit, ViewChild} from '@angular/core';
import Revenue from "../../../../../core/model/revenue";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import {AccountingService} from "../../../../../core/services/accounting/accounting.service";
import {IncomeService} from "../../income.service";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import moment from "moment";
import {ExportService} from "../../../../../core/services/export/export.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {FuseDrawerComponent} from "../../../../../../@fuse/components/drawer";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import Swal from "sweetalert2";
import {map, Subscription, throwError} from "rxjs";
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import {PipeService} from "../../../../../core/services/pipe/pipe.service";
import {JsPrintService} from "../../../../../core/services/jsPrint/js-print.service";
import {SessionService} from "../../../../../core/services/session/session.service";
import {RoleService} from "../../../../../core/services/role/role.service";
import {AppService} from "../../../../../core/services/app/app.service";
import Account from "../../../../../core/model/account";
import _orderBy from "lodash/orderBy";
import Invoice from "../../../../../core/model/invoice";
import {AccountService} from "../../../../../core/services/account/account.service";

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
        MatTooltipModule,
        FormsModule,
        FuseDrawerComponent,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgClass
    ],
    styleUrls: ['./list-payment.component.scss']
})
export class ListPaymentComponent implements OnInit{
    @Input() facture: any;
    @Input() dataTable: Revenue[];
    rewardForm: FormGroup;
    form: FormGroup;
    accounts: Array<Account>;
    formFieldHelpers: string[] = [''];
    submitted: boolean;
    sidePanelOpen:boolean;
    dateLocked: boolean
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
    subscription = new Subscription();
    @ViewChild('drawer') drawer: FuseDrawerComponent;
    constructor(
        public appService: AppService,
        private accountingService: AccountingService,
        private exportService: ExportService,
        private formBuilder: FormBuilder,
        private invoiceService: InvoiceService,
        private jsPrintService: JsPrintService,
        private firstNamePipe: PipeService,
        private sessionService: SessionService,
        private incomeService: IncomeService,
        private roleService: RoleService,
        private accountService: AccountService
    ) {
    }
    ngOnInit(): void {
        this.initForm2()
        this.onSubscribe()
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
                        .catch(err =>{});
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
    refund(payment: any) {
        console.log(payment)
        this.accountingService.facture.next(this.facture);
        this.accountingService.payment.next({
            amount: payment.amount * -1,
            account_id: payment.account_id,
            payment_method: payment.payment_method
        });
        this.accountingService.sidePanelPayment.next(true);
        this.drawer.toggle()
    }
    exportToExcel(data: any, filename: any) {
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
    }
    close() {
        const cT = moment().toDate();

        this.submitted = false;
        this.form.reset({
            paid_at: {value: cT, disabled: true}
        });
        this.rewardForm?.reset({
            paid_at: {value: cT, disabled: true}
        });
        this.accountingService.facture.next(null);
        this.accountingService.payment.next(null);
        this.accountingService.sidePanelPayment.next(false);
        this.drawer.close()
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
                            this.close()
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
                            //this.close();
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
                    if (err.status === 400){
                        Swal.fire({
                            toast: true, position: 'top',
                            title: 'Erreur',
                            text: 'Facture non annuler',
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
}
