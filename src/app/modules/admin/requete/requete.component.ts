import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  catchError,
  concat,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap, throwError
} from "rxjs";
import {AsyncPipe, CommonModule, DatePipe, NgClass, NgIf} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {UserService} from "../../../core/services/user/user.service";
import {NotificationService} from "../../../core/services/notifications/notification.service";
import {MaintenanceService} from "../../../core/services/maintenance/maintenance.service";
import {RouterLink} from "@angular/router";
import moment from "moment";
import Category from "../../../core/model/category";
import {ContactService} from "../../../core/services/contact/contact.service";
import {SharedService} from "../../../core/services/shared/shared.service";
import {NgbHighlight, NgbInputDatepicker} from "@ng-bootstrap/ng-bootstrap";
import Room from "../../../core/model/room";
import {Requests, RequestStatus, RequestType} from "../../../core/model/request";
import {Confirmable} from "../../../core/shared/comfirmable/comfirmable.decorator";
import {Item} from "../../../core/model/item";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCardModule} from "@angular/material/card";
import {CategoryService} from "../../../core/services/category/category.service";
import {MatTabsModule} from "@angular/material/tabs";
import {NgxMaskDirective} from "ngx-mask";
import {CleaningService} from "../../../core/services/cleaning/cleaning.service";
import {SessionService} from "../../../core/services/session/session.service";

@Component({
  standalone: true,
  selector: 'app-requete',
  templateUrl: './requete.component.html',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgSelectModule,
    NgClass,
    RouterLink,
    NgbInputDatepicker,
    DatePipe,
    NgIf,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    NgbHighlight,
    CommonModule,
    MatTabsModule,
    NgxMaskDirective,
    FormsModule,
  ],
  styleUrls: ['./requete.component.scss']
})
export class RequeteComponent implements OnInit {
  @Output()
  statusChange = new EventEmitter<string>();
  staffInput$ = new Subject<string>();
  contactInput$ = new Subject<string>();
  submitted: boolean;
  requestForm: FormGroup;
  request: Requests;
  id: any;
  requestStatuses: Array<RequestStatus>;
  categories: Category[];
  categories$: Observable<Category[]>;
  itemForm: FormGroup;
  submitted_item: boolean;
  items: Item[] = [];
  facilities: Room[];
  isModal: boolean = false;
  types: Observable<RequestType[]>;
  config: any;

  constructor(
    private userService: UserService,
    private notification: NotificationService,
    private formBuilder: FormBuilder,
    public maintenanceService: MaintenanceService,
    private contactService: ContactService,
    private sharedService: SharedService,
    private categoryService: CategoryService,
    private sessionService: SessionService,
    private cleaningService: CleaningService,
  ) {
  }

  ngOnInit() {
    this.id = 8;
    this.getRequest(this.id);
    this.initForm();
    this.types = this.maintenanceService.getTypes({type: 'all'}).pipe(
      catchError(err => {
        this.notification.error(null, err.error);
        return throwError(err);
      })
    );
    this.categories$ = this.categoryService.list({type: 'maintenance'}).pipe(
      catchError(err => {
        this.notification.error(null, err.error);
        return throwError(err);
      })
    );
  }

  onAddStaff(event) {
    if (event.id) {
      this.maintenanceService.updateBy(this.request.id, {staff_id: event.id}, 'staff').subscribe(
        res => {
          if (res) {
            /*this.resetForm();*/
            this.notification.success(null, 'UPDATE_SUCCESS');
            console.log('modification avec succes')
          }
          else {
            this.notification.error('', '')
          }
        }
      )
    }
    else console.log('User not found!');
  }

  @Confirmable({title: 'Dupliquer la requête'}, true)
  duplicate(response?: any) {
    if (response) {
      const formValue = this.requestForm.getRawValue();
      const maintenance = {
        category_id: formValue.category_id,
        category_name: formValue.category_name,
        comments: formValue.comments,
        description: formValue.description,
        due_at: moment().format(),
        requested_at: moment().format(),
        room_id: formValue.facility ? formValue.facility.id : null,
        status: 'DRAFT',
        title: formValue.title,
        type: formValue.type,
        request_type_id: formValue.request_type_id,
        Contacts: formValue.contact,
        Staffs: [
          {id: this.sessionService.getUser().id}
        ]
      };

      this.maintenanceService.create(maintenance)
        .toPromise()
        .then(res => {
          /*this.router.navigate(['maintenance/detail', res.id]);*/
          this.notification.success(null, 'SAVE_SUCCESS');
        })
        .catch(err => this.notification.error(err, err.message));
    }
  }

  @Confirmable({title: 'Retirer l\'utilisateur'}, true)
  onRemoveStaff(event, response?: any) {
    if (response) {
      this.maintenanceService.removeBy(this.request.id, 'staff', event.value.id)
        .then(res => {
          /*this.resetForm();*/
          console.log('Modification avec succes')
          this.notification.success(null, 'UPDATE_SUCCESS');
        })
        .catch(err => this.notification.error(null, err.error));
    }
    else {
      this.requestForm.get('staff').setValue(this.request.Staffs);
    }
  }

  onSelectStatus(event) {
    this.maintenanceService.updateExtendedBy(this.request.id, {
      request_status_id: event
    }, 'status')
      .then(res => {
        this.resetForm();
        this.notification.success(null, 'UPDATE_SUCCESS');
      })
      .catch(err => this.notification.error(null, err.error));
  }

  onSelectType(event) {
    this.maintenanceService.updateExtendedBy(this.request.id, {request_type_id: event}, 'type')
      .then(res => {
        this.resetForm();
        this.notification.success(null, 'UPDATE_SUCCESS');
      })
      .catch(err => this.notification.error(null, err.error));
  }

  updateFacility(facility) {
    if (facility) {
      const body = {room_id: facility.id};
      this.maintenanceService.updateBy(this.request.id, body, 'facility').subscribe(
        res => {
          console.log(res)
        }
      )
      /*.then(res => {
          this.resetForm();
          this.notification.success(null, 'UPDATE_SUCCESS');
      })
      .catch(err => this.notification.error(null, 'GENERIC_ERROR'));*/
    }
  }

  resetForm() {
    this.request = null;
    this.submitted = false;
    this.submitted_item = false;

    this.itemForm.reset();
    this.requestForm.reset({
      status: 'DRAFT'
    })
    this.getRequest(this.id);
  }

  setTime(date, time: string): void {
    const timesplit = time.split(':');
    date.set({hour: timesplit[0], minute: timesplit[1]});
  }

  contact$ = concat(
    of([]),
    this.contactInput$.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(term => !term || term.length < 3 ? [] : this.contactService.select(term)
        .toPromise()
        .then(res => {
          return res.length > 0 ? res : [{id: 0, name: 'Ajouter'}];
        })
        .catch(err => this.notification.error(null, err.error))
      )
    )
  );

  @Confirmable({title: 'Retirer le contact'}, true)
  onRemoveContact(event, response?: any) {
    if (response) {
      this.maintenanceService.removeBy(this.request.id, 'contact', event.value.id)
        .then(res => {
          this.resetForm();
          this.notification.success(null, 'UPDATE_SUCCESS');
        })
        .catch(err => this.notification.error(null, err.error));
    }
    else {
      this.requestForm.get('contact').setValue(this.request.Contacts);
    }
  }

  onAddContact(event) {
    if (event.id) {
      this.maintenanceService.updateBy(this.request.id, {contact_id: event.id}, 'contact').subscribe(
        res => {
          console.log(res)
        }
      )
      /*.then(res => {
          this.resetForm();
          this.notification.success(null, 'UPDATE_SUCCESS');
      })
      .catch(err => this.notification.error(null, err.error));*/
    }
    else {
      this.sharedService.newContact(null);
      this.sharedService.updateSidePanel(true);
      setTimeout(() => {
        const contactFA = this.requestForm.get("contact") as FormArray;
        if (contactFA) {
          const contacts = contactFA.value as any[];
          if (contacts && contacts.length) {
            contactFA.setValue(contacts.filter((item) => item.id));
          }
        }
      }, 0);
    }
  }

  updateStatus(status) {
    const params = {
      id: this.id,
      status: status
    };

    let observable: Observable<any>;

    if (this.request.request_type_id === +this.cleaningService.getDefaultTypeId()) {
      observable = this.cleaningService.updateStatus(params, this.request, this.request.Staffs.length ? this.request.Staffs[0].id : null);
    }
    else {
      observable = this.maintenanceService.updateStatus(params);
    }

    observable
      .toPromise()
      .then(() => {
        this.resetForm();
        this.notification.success(null, 'UPDATE_SUCCESS');

        this.statusChange.next(params.status);
      })
      .catch(err => this.notification.error(null, err.error));
  }

  updateRequest() {
    this.submitted = true;

    if (this.requestForm.valid) {
      const formValue = this.requestForm.getRawValue();
      const body: any = Object.assign({}, formValue, {
        category_id: formValue.category_id,
        id: this.id,
        room_id: formValue.facility ? formValue.facility.id : null,
        staff_id: formValue.staff ? formValue.staff.id : null,
        staff_name: formValue.staff ? formValue.staff.name : null
      });

      if (formValue.is_event) {
        const start = moment(formValue.event_start);
        const end = moment(formValue.event_end);

        if (formValue.event_start_time || formValue.event_start_time !== '') {
          this.setTime(start, formValue.event_start_time);
        }

        if (formValue.event_end_time || formValue.event_end_time !== '') {
          this.setTime(end, formValue.event_end_time);
        }

        body.event_start = start.format();
        body.event_end = end.format();
      }

      this.maintenanceService.update(body).subscribe((res) => {
        console.log(res)
      })
      /*.toPromise()
      .then(() => {
          this.resetForm();
          this.notification.success(null, 'UPDATE_SUCCESS');
      })
      .catch(err => this.notification.error(err, err.error));*/
    }
    else {
      this.notification.error(null, 'FORM_NOT_VALID');
    }
  }

  staff$ = concat(
    of([]),
    this.staffInput$.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(term => !term || term.length < 3 ? [] : this.userService.select(term, 'selectByCompany')
        .then(res => {
          return res;
        })
        .catch(err => this.notification.error(null, err.error))
      )
    )
  );

  private initForm() {
    this.staff$ = concat(
      of([]),
      this.staffInput$.pipe(
        debounceTime(800),
        distinctUntilChanged(),
        switchMap(term => !term || term.length < 3 ? [] : this.userService.select(term, 'selectByCompany')
          .then(res => {
            return res.length > 0 ? res : [null];
          })
          .catch(err => this.notification.error(null, err.error))
        )
      )
    );

    this.submitted = false;
    this.requestForm = this.formBuilder.group({
      bill_id: null,
      category_id: [null, Validators.required],
      category_name: null,
      comments: null,
      contact: null,
      description: [null, Validators.required],
      due_at: null,
      extended_status: null,
      is_event: false,
      is_event_all_day: false,
      order_number: null,
      requested_at: null,
      reservation_id: null,
      request_type_id: null,
      event_start: null,
      event_start_time: null,
      event_end: null,
      event_end_time: null,
      facility: null,
      staff: [null, Validators.required],
      status: 'DRAFT',
      title: [null, Validators.required],
      type: [null, Validators.required]
    });
  }

  private getRequest(id) {
    this.maintenanceService.get(id).subscribe((response) => {
      console.log(response)
      if (response) {
        this.request = new Requests(response);
        const start = moment(response.event_start);
        const end = moment(response.event_end);

        this.requestForm.patchValue(Object.assign({}, response, {
          contact: response.Contacts,
          due_at: response.due_at ? new Date(response.due_at) : null,
          extended_status: response.RequestStatus,
          requested_at: response.requested_at ? new Date(response.requested_at) : null,
          facility: response.Room ? response.Room : null,
          staff: response.Staffs,
          event_start: response.is_event ? start.toDate() : null,
          event_start_time: response.is_event ? start.format('HH:mm') : null,
          event_end: response.is_event ? end.toDate() : null,
          event_end_time: response.is_event ? end.format('HH:mm') : null
        }));
        this.arrayToForm(response.RequestItems);
      }
      else {
        console.log('erreur')
      }
    })
  }

  private arrayToForm(array): void {
    array.forEach(item => {
      this.RequestItems.push(this.formBuilder.group({
        description: null,
        ...item,
        item
      }));
    });
  }

  get RequestItems(): FormArray {
    return this.itemForm.get('RequestItems') as FormArray;
  }
}
