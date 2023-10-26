import {Component, ElementRef, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatListModule} from "@angular/material/list";
import {AppModule} from "../../../app.module";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {SessionService} from "../../../core/services/session/session.service";
import {MatTabsModule} from "@angular/material/tabs";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import BaseModel from "../../../core/model/base-model";
import Geography from "../../../core/model/geograhy";
import {Subscription} from "rxjs";
import Company from "../../../core/model/company";
import Role from "../../../core/model/role";
import {Position} from "postcss";

import {FileUploader, FileUploadModule} from 'ng2-file-upload';
import {AppService} from "../../../core/services/app/app.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NotificationService} from "../../../core/services/notifications/notification.service";
import {PrintService} from "../../../core/services/print/print.service";
import {RoleService} from "../../../core/services/role/role.service";
import {AccountService} from "../../../core/services/account/account.service";
import {SettingsCompanyService} from "../../../core/services/settingsCompany/settings-company.service";
import {UtilityService} from "../../../core/services/utility/utility.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {QRCodeModule} from "angularx-qrcode";
import {UserService} from "../../../core/services/user/user.service";
import User from "../../../core/model/user";
import _forEach from "lodash.foreach";
import moment from "moment";
import {MenService} from "../../../core/services/men/men.service";
import _orderBy from "lodash/orderBy";
import Swal from "sweetalert2";

interface PickerListSelectedItem<T> {
    type: 'ADD' | 'REMOVE';
    value: T;
}

class UserScore extends BaseModel {
    average: number;
    contribution: number;
    note: number;
    offense: number;
}

@Component({
    selector: 'app-user-profile',
    standalone: true,
    templateUrl: './user-profile.component.html',
    imports: [
        MatButtonModule,
        RouterLink,
        MatMenuModule,
        MatIconModule,
        MatListModule,
        AppModule,
        NgStyle,
        MatTabsModule,
        ReactiveFormsModule,
        NgForOf,
        FileUploadModule,
        NgIf,
        QRCodeModule,
    ],
    styleUrls: ['./user-profile.component.scss'],
    animations: [
        trigger('selectedTab', [
            state('true', style({
                backgroundColor: 'lightblue' // Style lorsque l'onglet est sélectionné
            })),
            state('false', style({
                backgroundColor: 'transparent' // Style lorsque l'onglet n'est pas sélectionné
            })),
            transition('true <=> false', animate('0.3s ease-in-out')) // Transition de l'état sélectionné à non sélectionné
        ])
    ]
})

export class UserProfileComponent implements OnInit{
    user: User;
    public session;
    companies: Company[];
    passwordForm: FormGroup;
    permissionForm: FormGroup;
    positions: Position[];
    profileForm: FormGroup;
    roleForm: FormGroup;
    roles: Role[];
    score: UserScore;
    uploader: FileUploader;
    userForm: FormGroup;

    accountNumber: string;

    id: number;

    loginToken: String;
    marital_statuses: any[];
    minDate: any;
    submitted: boolean;
    submittedPassword: boolean;
    submittedProfile: boolean;
    Selected: PickerListSelectedItem<Company>;
    SelectedGeography: PickerListSelectedItem<Geography>;

    subscription: Subscription;

    selectedType: 'DST' | 'RGN' | 'CMN' = 'RGN';
    searchSelected: string;
    searchAvailable: string;
    availableGeographies: Geography[];
    selectedGeographies: Geography[];

    activeMenu: any;


    constructor(
    private appService: AppService,
    private elementRef: ElementRef,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private notification: NotificationService,
    private printService: PrintService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private settingsCompanyService: SettingsCompanyService,
    private sessionService: SessionService,
    private userService: UserService,
    private utilityService: UtilityService,
    private menService: MenService
    ) {
    }

    ngOnInit(): void {

        this.loginToken = this.sessionService.getToken();
        this.marital_statuses = this.appService.marital_statuses;
        this.minDate = this.appService.getMinDate();
        this.activeMenu = this.sessionService.getActiveMenu();

        this.subscription = this.route.paramMap.subscribe(param => {
            this.id = +param.get('id');
            this.init();
        });
    }
    selectedTabIndex: number = 0;

    tabChanged(index: number) {
        this.selectedTabIndex = index;
    }

    private init() {
        this.submitted = false;
        this.submittedPassword = false;
        this.initUserForm();
        this.initRoleForm();
        this.initUploader();
        this.getUser();
        this.initProfileForm();
        this.resetScore();
        //this.initPasswordForm();
        this.initProfileForm();
        //this.getPositions();
    }

    private initCustomFields(formGroup: FormGroup, profile: any) {
        if (profile) {
            const custom_fields = profile.Position ? profile.Position.custom_fields : null;

            if (custom_fields) {
                custom_fields.forEach(item => {
                    formGroup.addControl(item.key, new FormControl(null));
                });
            }
        }
    }

    private initProfileForm(customFields?) {
        this.profileForm = this.formBuilder.group({
            address: null,
            id: null,
            bio_dob: null,
            bio_nationality: null,
            bio_pob: null,
            custom_fields: this.formBuilder.group({}),
            date_hire: null,
            date_termination: null,
            doc_name: null,
            id_cin: null,
            id_driver_license: null,
            id_other: null,
            id_passport: null,
            marital_status: [null, Validators.required],
            note: null,
            position: [null, Validators.required],
            phone_primary: null,
            phone_work: null,
            salary: null,
            sex: null
        }, {
            validators: this.setPhoneValidator
        });
    }

    setPhoneValidator(group: FormGroup) {
        return !group.get('phone_primary').value && !group.get('phone_work').value
            ? {phoneRequired: true}
            : null;
    }

    private setScore(user: User): void {
        if (user.Profile) {
            let count = 0;

            user.Profile.ProfileEvents.forEach(item => {
                this.score.note += item.type === 'NOTE' ? item.score : 0;

                if (item.type === 'CONTRIBUTION') {
                    this.score.contribution += item.score;
                    count++;
                }
                else if (item.type === 'OFFENSE') {
                    this.score.offense += item.score;
                    count++;
                }
            });

            const total = this.score.offense + this.score.contribution;
            this.score.average = total > 0 ? +(total / count).toFixed(1) : 0;
        }
        else this.notification.error(null, 'PROFILE_NOT_SET');
    }

    private getRoles() {
        this.roleService.list()
            .toPromise()
            .then(res => {
                this.roles = res;
                this.initCheckbox(res, this.user.Roles, this.roleForm, 'Roles');
            })
            .catch(err => this.notification.error(null, err.error));
    }
    private initCheckbox(_data: any[], _user_data: any[], _form: FormGroup, _control: string) {
        const group = {};

        for (let i = 0; i < _data.length; i++) {
            const elem = _data[i];
            group[elem.id] = false;

            _forEach(_user_data, item => {
                if (elem.id === item.id) {
                    group[elem.id] = true;
                }
            });
        }

        const FGp = this.formBuilder.group(group);
        _form.setControl(_control, FGp);
    }

    private getCompanies() {
        this.settingsCompanyService.list(true)
            .toPromise()
            .then(res => {
                this.companies = _orderBy(res, ['company_name'], ['asc']);
                this.user.Companies = _orderBy(
                    this.user.Companies.map(elem => {
                        const index = this.companies.findIndex(item => item.id === elem.id);

                        if (index !== -1) {
                            const value = this.companies[index];

                            this.companies.splice(index, 1);

                            return value;
                        }

                        return elem;
                    }),
                    ['company_name'],
                    ['asc']
                );
            })
            .catch(err => this.notification.error(null, err.error));
    }

    private getUser() {
        this.userService.get(this.id)
            .toPromise()
            .then(res => {
                console.log(res)
                this.user = new User(res);
                this.userForm.patchValue({
                    name: res.name,
                    email: res.email,
                    enabled: res.enabled
                });

                this.initCustomFields(this.profileForm.get('custom_fields') as FormGroup, res.Profile);

                this.profileForm.patchValue(Object.assign({}, res.Profile, {
                    bio_dob: (res.Profile && res.Profile.bio_dob) ? moment(res.Profile.bio_dob).toDate() : null,
                    date_hire: (res.Profile && res.Profile.date_hire) ? moment(res.Profile.date_hire).toDate() : null,
                    date_termination: (res.Profile && res.Profile.date_termination) ? moment(res.Profile.date_termination).toDate() : null,
                    position: res.Profile ? res.Profile.Position : null
                }));

                this.setScore(this.user);
                this.getCompanies();
                this.getRoles();

                if (this.activeMenu && ((this.activeMenu.men && this.activeMenu.men.root) || (this.activeMenu.inventory && this.activeMenu.inventory.root))) {
                    this.getGeographies();
                }
            })
            .catch(err => this.notification.error(null, err.error));
    }

    save(){

    }
    onSelect(id,type){

    }
    private initRoleForm() {
        this.roleForm = this.formBuilder.group({
            Roles: this.formBuilder.group({})
        });
    }

    private initUserForm() {
        this.userForm = this.formBuilder.group({
            id: '',
            name: ['', Validators.required],
            email: ['', Validators.required],
            enabled: true
        });
    }

    private resetScore() {
        this.score = new UserScore({
            average: 0,
            contribution: 0,
            note: 0,
            offense: 0
        });
    }

    private getGeographies() {
        this.selectedGeographies = this.user.Geographies.filter(geography => geography.type === this.selectedType);
        this.menService.getGeographies(this.selectedType).then(geographies => {
            this.availableGeographies = geographies.filter(geography => !this.selectedGeographies.find(selected => selected.id === geography.id));
        }).catch(err => {
            this.notification.error(null, err.error);
        });
    }


    private initUploader() {
        this.uploader = new FileUploader({
            url: this.utilityService.getUploadUrl(this.id, 'USER'),
            method: 'POST',
            headers: [
                {name: 'X-Access-Token', value: this.sessionService.getToken()}
            ],
            autoUpload: true
        });
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploader.onSuccessItem = (file, response, status, header) => {
            this.init();
            Swal.fire({
                toast: true,
                position: 'top',
                title: 'success',
                text: 'Modification avec succés, reconnecter vous pour vérifier',
                icon: 'success',
            })
        };
    }

}
