import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {debounceTime, distinctUntilChanged, Observable, of, Subject, Subscription, switchMap, tap} from "rxjs";
import {ContactService} from "../../../../../core/services/contact/contact.service";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedService} from "../../../../../core/services/shared/shared.service";
import {NgbHighlight, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule, NgClass} from "@angular/common";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Contact} from "../../../../../core/model/contact";
import {result} from "lodash-es";

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
        CommonModule
    ],
    styleUrls: ['./invoice-add.component.scss']
})
export class InvoiceAddComponent implements OnInit{
    subscription: Subscription;
    search = null;
    readOnly: Boolean;
    inputClass: String;
    submitted: Boolean;
    touched = false;
    @Input() minKeyword = 4;
    @ViewChild('inputElt') inputRef: ElementRef<HTMLInputElement>;
    loading = false;
    value = null;
    disabled = false;
    display = null;
    searchControl = new FormControl();
    searchResults: Contact[] = [];
    selectedTel: string = '';
    private searchTerms = new Subject<string>();

    @Output() selectContact = new EventEmitter<Contact>();
    @Output() removeContact = new EventEmitter<Contact>();
    constructor(
        private contactService: ContactService,
        private sharedService: SharedService,
        private notification: NotificationService,
    ) {
    }

    ngOnInit(): void {
        this.searchTerms
            .pipe(
                debounceTime(3000), // Ajoutez ici le délai de débordement souhaité (3000 ms dans cet exemple)
                distinctUntilChanged(),
                tap(() => console.log('Délai de débordement déclenché.')),
                switchMap((term) => {
                    if (term.length < this.minKeyword) {
                        return [];
                    } else {
                        this.loading = true;

                        return this.contactService.select(term)
                            .toPromise()
                            .then((res) => {
                                console.log(res);
                                this.searchResults = res;
                            })
                            .catch((err) => this.notification.error(null, err.error))
                            .finally(() => (this.loading = false));
                    }
                })
            )
            .subscribe();
    }

    displayFn(result: string): string {
        return result;
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
    onSelectContact(event: MatAutocompleteSelectedEvent): void {
        this.markAsTouched();
        console.log(event)
        if (event.option && event.option.value) {
            this.value = event.option.value;
            this.selectedTel = this.value.name
            this.display = this.value.name;
            this.selectContact.emit(event.option.value);
            this.onChange(event.option.value);
        }
        else {
            this.sharedService.updateSidePanel(true);
            this.sharedService.newContact({phone: this.inputRef.nativeElement.value} as any);

            //  Subscribe to the newly created contact
            if (!this.subscription && !this.touched) {
                this.subscription = this.sharedService.contact$.subscribe((value) => {
                    if (value) {
                        this.value = value;
                        this.selectedTel = this.value.phone
                        this.display = this.value.name;
                        this.selectContact.emit(value);
                        this.onChange(value);
                    }
                });
            }
        }
    }

    searchContact = (term: string) => {
        this.searchTerms.next(term);
        if (term.length < this.minKeyword) {
            return;
        } else {
            this.loading = true;

            this.contactService.select(term)
                .toPromise()
                .then((res) => {
                    console.log(res);
                    this.searchResults = res;
                })
                .catch((err) => this.notification.error(null, err.error))
                .finally(() => (this.loading = false));
        }
    }
    protected readonly result = result;
}
