import { NgModule } from '@angular/core';
import { IncomeSearchComponent } from './modules/admin/revenus/search/income-search/income-search.component';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {JwtInterceptor} from "./core/interceptor/jwt-interceptor";

@NgModule({
  declarations: [
    IncomeSearchComponent,
  ],
    imports: [
        HttpClientModule,
        MatTableModule,
        MatPaginatorModule
    ],
    exports: [
        IncomeSearchComponent,
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    ],
})
export class AppModule { }
