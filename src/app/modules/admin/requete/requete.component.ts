import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {async, concat, debounceTime, distinctUntilChanged, of, Subject, switchMap} from "rxjs";
import {AsyncPipe, NgClass} from "@angular/common";
import {NgSelectModule} from "@ng-select/ng-select";
import {UserService} from "../../../core/services/user/user.service";
import {NotificationService} from "../../../core/services/notifications/notification.service";
import {MaintenanceService} from "../../../core/services/maintenance/maintenance.service";
import {Requests} from "../../../core/model/request";
import {translate} from "@ngneat/transloco";

@Component({
    standalone: true,
    selector: 'app-requete',
    templateUrl: './requete.component.html',
    imports: [
        ReactiveFormsModule,
        AsyncPipe,
        NgSelectModule,
        NgClass
    ],
    styleUrls: ['./requete.component.scss']
})
export class RequeteComponent implements OnInit{
    staffInput$ = new Subject<string>();
    submitted: boolean;
    requestForm: FormGroup;
    request: Requests;
    constructor(
      private userService : UserService,
      private notification : NotificationService,
      private formBuilder: FormBuilder,
      private maintenanceService: MaintenanceService
    ) {}

    ngOnInit() {
        this.initForm()

    }
    onStaffInputChange(term: string) {
        console.log(term)
        this.staffInput$.next(term);
    }
    onRemoveStaff(event) {
        this.maintenanceService.removeBy(this.request.id, 'staff', event.value.id)
          .then(res => {
              this.resetForm();
              this.notification.success(null, 'UPDATE_SUCCESS');
          })
          .catch(err => this.notification.error(null, err.error));
    }
    resetForm() {
        this.request = null;
        this.submitted = false;
        //this.submitted_item = false;

        //this.itemForm.reset();
        this.requestForm.reset({
            status: 'DRAFT'
        })
        /*this.initItemForm();
        this.getRequest(this.id);*/
    }
    onAddStaff(event: { id: any; }) {
        console.log(this.request)
        if (event.id && event) {
            this.maintenanceService.updateBy(this.request.id, {staff_id: event.id}, 'staff')
              .then(res => {
                  this.resetForm();
                  this.notification.success(null, 'UPDATE_SUCCESS');
              })
              .catch(err => this.notification.error(null, err.error));
        }
        else console.log('User not found!');
    }
    staff$ = concat(
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
    private initForm() {
        this.submitted = false;
        this.requestForm = this.formBuilder.group({
            bill_id: null,
            category_id: [null, Validators.required],
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
            event_start: null,
            event_start_time: null,
            event_end: null,
            event_end_time: null,
            meta: this.formBuilder.group({
                source_room_id: null
            }),
            room_id: null,
            staff: [null, Validators.required],
            status: 'DRAFT',
            title: [null, Validators.required],
            type: [null, Validators.required]
        });
        this.staff$ = concat(
            of([]),
            this.staffInput$.pipe(
                debounceTime(800),
                distinctUntilChanged(),
                switchMap(term => !term || term.length < 3 ? [] : this.userService.select(term, 'selectByCompany')
                    .then(res => {
                        console.log(res)
                        return res.length > 0 ? res : [null];
                    })
                    .catch(err => this.notification.error(null, err.error))
                )
            )
        );

        // Déboguer les entrées dans staffInput$
        this.staffInput$.subscribe(term => {
            console.log('Terme de recherche :', term);
        });


    }

    protected readonly translate = translate;
}
