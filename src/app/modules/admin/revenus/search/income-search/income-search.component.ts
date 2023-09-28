import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {InvoiceService} from "../../../../../core/services/invoice/invoice.service";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {MatIconModule} from "@angular/material/icon";

@Component({
    selector: 'app-income-search',
    standalone: true,
    templateUrl: './income-search.component.html',
    imports: [
        ReactiveFormsModule,
        MatIconModule
    ],
    styleUrls: ['./income-search.component.scss']
})
export class IncomeSearchComponent implements OnInit{
    searchForm: FormGroup;
    submitted: boolean;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private invoiceService: InvoiceService,
        private notification: NotificationService
    ) {
    }

    ngOnInit(): void {
        this.initForm()
    }

    search() {
        this.submitted = true;

        if (this.searchForm.valid) {
            const id = this.searchForm.get('term').value;

            this.invoiceService.search(id).subscribe(res=>{
                if (res){
                    console.log(res)
                    this.router.navigate(['/invoiceDetail/', id]);
                }
                else{
                    this.notification.error(null, 'INVOICE_NOT_FOUND');
                }
            })
        }
        else {
            this.notification.error(null, 'FORM_NOT_VALID');
        }
    }

    private initForm() {
        this.searchForm = this.formBuilder.group({
            term: ['', Validators.required]
        });
    }
}
