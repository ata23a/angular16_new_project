import { NgModule } from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {JwtInterceptor} from "./core/interceptor/jwt-interceptor";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { TypeheadContactComponent } from './modules/admin/revnus/invoice-add/typehead-contact/typehead-contact.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbHighlight, NgbInputDatepicker, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule, NgClass} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {FuseAlertComponent} from "../@fuse/components/alert";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterOutlet} from "@angular/router";
import { SidePanelPaymentComponent } from './modules/admin/revenus/revenus/side-panel-payment/side-panel-payment.component';
import {FuseDrawerComponent} from "../@fuse/components/drawer";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [
    TypeheadContactComponent,
    SidePanelPaymentComponent,
  ],
    imports: [
        HttpClientModule,
        MatTableModule,
        MatPaginatorModule,
        MatSnackBarModule,
        FormsModule,
        NgbTypeahead,
        NgbHighlight,
        NgClass,
        CommonModule,
        ReactiveFormsModule,
        NgSelectModule,
        FuseAlertComponent,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        RouterOutlet,
        NgbInputDatepicker,
        FuseDrawerComponent,
        MatDatepickerModule,
        MatOptionModule,
        MatSelectModule,
    ],
    exports: [
        TypeheadContactComponent,
    ],
    providers: [
      MatSnackBarModule,
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    ],
})
export class AppModule { }
