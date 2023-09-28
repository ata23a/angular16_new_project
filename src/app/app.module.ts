import { NgModule } from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {JwtInterceptor} from "./core/interceptor/jwt-interceptor";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { TypeheadContactComponent } from './modules/admin/revnus/invoice-add/typehead-contact/typehead-contact.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgbHighlight, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule, NgClass} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";

@NgModule({
  declarations: [
    TypeheadContactComponent,
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
