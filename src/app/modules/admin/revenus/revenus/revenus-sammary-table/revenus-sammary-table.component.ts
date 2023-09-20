import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule, MatSort} from "@angular/material/sort";
import {MatPaginatorModule, MatPaginator} from "@angular/material/paginator";
import {ItemService} from "../../../../../core/services/item/item.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {DatePipe} from "@angular/common";
import {catchError, map, merge, startWith, switchMap, of as observableOf} from "rxjs";

@Component({
    selector: 'app-revenus-sammary-table',
    templateUrl: './revenus-sammary-table.component.html',
    styleUrls: ['./revenus-sammary-table.component.scss'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatProgressSpinnerModule, DatePipe],

})
export class RevenusSammaryTableComponent implements AfterViewInit {
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
        private itemService: ItemService
    ) {
    }

    ngOnInit() {

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
