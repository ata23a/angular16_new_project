import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {ContactService} from "../../../../../core/services/contact/contact.service";
import {NotificationService} from "../../../../../core/services/notifications/notification.service";
import {SharedService} from "../../../../../core/services/shared/shared.service";
import Contact from "../../../../../core/model/contact";
import {debounceTime, distinctUntilChanged, Observable, Subscription, switchMap} from "rxjs";

@Component({
  selector: 'app-typehead-contact',
  templateUrl: './typehead-contact.component.html',
  styleUrls: ['./typehead-contact.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: TypeheadContactComponent
        },
        {
            provide: NG_VALIDATORS,
            multi: true,
            useExisting: TypeheadContactComponent
        }
    ]
})
export class TypeheadContactComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy, Validators {
    constructor(
        private contactService: ContactService,
        private notification: NotificationService,
        private sharedService: SharedService
    ) {
    }

    @Output() phoneselectedChange = new EventEmitter<any>();
    @Input() phoneselected:any;
    @Input() readOnly: Boolean;
    @Input() isRequired: Boolean = true;
    @Input() submitted: Boolean;
    @Input() inputClass: String;
    @Input() minKeyword = 3;
    @Input() searchObject: Partial<Contact> = null;
    @Output() selectContact = new EventEmitter<Contact>();
    @Output() removeContact = new EventEmitter<Contact>();

    @ViewChild('inputElt') inputRef: ElementRef<HTMLInputElement>;

    subscription: Subscription;

    disabled = false;
    display = null;
    search = null;
    loading = false;
    touched = false;
    value = null;
    //  Inform the parent form that value changed
    onChange: any = () => {
    }
    //  Inform the parent form that child form touched
    onTouched: any = () => {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.searchObject !== undefined && this.inputRef) {
            this.inputRef.nativeElement.value = this.searchObject ? this.searchObject.name : null;

            const event = new Event('input', {
                bubbles: true,
                cancelable: true
            });
            this.inputRef.nativeElement.dispatchEvent(event);
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    //  ControlValueAccessor
    writeValue(obj: any): void {
        // console.log('writeValue', obj);
        if (obj) {
            this.value = obj;
            this.display = obj.name;
        }
        else {
            this.clear();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        return this.submitted && this.isRequired && (!this.value || !Object.keys(this.value).length) ? {isRequired: true} : null;
    }

    markAsTouched() {
        if (!this.touched) {
            this.onTouched();
            this.touched = true;
        }
    }

    onSelectContact = (event): void => {
        this.markAsTouched();
        event.preventDefault();

        if (event.item) {
            this.value = event.item;
            this.phoneselected = this.value.phone
            this.display = this.value.name;
            this.selectContact.emit(event.item);
            this.onChange(event.item);
            this.phoneselectedChange.emit(this.phoneselected);
            console.log(this.phoneselected)
        }
        else {
            this.sharedService.updateSidePanel(true);
            this.sharedService.newContact({phone: this.inputRef.nativeElement.value} as any);

            //  Subscribe to new created contact
            if (!this.subscription && !this.touched) {
                this.subscription = this.sharedService.contact$.subscribe((value) => {
                    if (value) {
                        this.value = value;
                        this.display = this.value.name;
                        this.selectContact.emit(event.item);
                        this.onChange(value);
                    }
                });
            }
        }
    }

    clear() {
        this.removeContact.emit(this.value);
        this.display = null;
        this.search = null;
        this.value = null;
        this.onChange(null);
    }

    searchContact = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(900),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term.length < this.minKeyword) {
                    return [];
                }
                else {
                    this.loading = true;

                    return this.contactService.select(term)
                        .toPromise()
                        .then((res) => {
                            return res.length > 0 ? res : [null];
                        })
                        .catch((err) => this.notification.error(null, err.error))
                        .finally(() => (this.loading = false));
                }
            })
        )
}
