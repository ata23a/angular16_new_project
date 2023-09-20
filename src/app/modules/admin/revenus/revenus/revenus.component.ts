import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import * as moment from 'moment';
import {IncomeService} from "../income.service";
import {NotificationService} from "../../../../core/services/notifications/notification.service";
import {AppModule} from "../../../../app.module";
import {RevenusSammaryTableComponent} from "./revenus-sammary-table/revenus-sammary-table.component";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {DatePipe} from "@angular/common";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatTableModule} from "@angular/material/table";
import {catchError, map, merge, of as observableOf, startWith, switchMap} from "rxjs";
import {ItemService} from "../../../../core/services/item/item.service";

@Component({
  selector: 'app-revenus',
  standalone   : true,
  templateUrl: './revenus.component.html',
  styleUrls: ['./revenus.component.scss'],
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatIconModule,
        ReactiveFormsModule,
        AppModule,
        RevenusSammaryTableComponent,
        MatButtonModule,
        MatMenuModule,
        DatePipe,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule
    ]
})
export class RevenusComponent implements AfterViewInit{
    dateForm: FormGroup;
    dateFormSubmitted: boolean;
    loading: boolean;
    summary2:any = {};
    data: [] = [];
    resultsLength = 0;
    size = 0;
    displayedColumns: string[] = ['payé le', 'contact', 'catégorie', 'description', 'compte', 'montant', 'créer le'];
    summary: any[];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    isLoadingResults = false;
    isRateLimitReached = false;
    constructor(
        private formBuilder: FormBuilder,
        private incomeService: IncomeService,
        private itemService : ItemService
    ) {
    }
    ngOnInit(){
        this.initForm()
        this.loadSummary()

    }

    loadSummary(params?: any) {
        this.loading = true;

        this.incomeService.summary(params).subscribe( response =>{
            this.summary2 = response
        })

    }
    resetForm() {
        this.dateFormSubmitted = false;
        this.dateForm.reset({
            start: moment().startOf('day').toDate(),
            end: moment().endOf('day').toDate()
        });

        this.submit();
    }
    private initForm(){
        this.dateForm = this.formBuilder.group({
            start: [
                moment().startOf('day').toDate(),
                Validators.required
            ],
            end: [
                moment().endOf('day').toDate(),
                Validators.required
            ]
        });
    }
    submit(){
        this.isLoadingResults = true
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        const filterConfig = {
            filter: {
                created_at: [{
                    value: this.dateForm.value.start,
                    operator: 'gte',
                    type: 'string'
                },
                    {
                        value: this.dateForm.value.end,
                        operator: 'lte',
                        type: 'string'
                    }
                ]
            },
            sort: {},
            slice: {
                page: this.paginator.pageIndex + 1,
                size: 25
            },
            search: {}
        }
        this.itemService.paginate(filterConfig).pipe(
            map((res)=>{
                this.isLoadingResults = false
                this.data = res.data
            })
        ).subscribe()
    }
    ngAfterViewInit() {
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    const config = {
                        search: {},
                        filter: {},
                        sort: {
                            pointer: this.sort.active,
                            direction: this.sort.direction
                        },
                        slice: {
                            page: this.paginator.pageIndex + 1,
                            size: 25
                        },
                    }
                    return this.itemService.paginate(config).pipe(catchError(() => observableOf(null)));
                }),
                map(data => {
                    this.isLoadingResults = false;
                    this.isRateLimitReached = data === null;

                    if (data === null) {
                        return [];
                    }
                    this.resultsLength = data.summary.filteredCount;
                    this.size = data.summary.size
                    return data.data;
                }),
            )
            .subscribe(data => (this.data = data));
    }
}
