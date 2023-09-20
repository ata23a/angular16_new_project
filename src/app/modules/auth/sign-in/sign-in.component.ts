import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import {AuthentificationService} from "../../../core/services/authentification/authentification.service";
import {NotificationsService} from "../../../layout/common/notifications/notifications.service";
@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    submitted: boolean;
    api: string;
    display_id: string;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private authService: AuthentificationService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private router: Router,
        private notification: NotificationsService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.display_id = localStorage.getItem('DISPLAY_ID');
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : [null, [Validators.required, Validators.email]],
            password  : [null, Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn2() {
        this.submitted = true;

        if (this.signInForm.valid) {
            const formValue = this.signInForm.value;

            this.authService.login(formValue.email, formValue.password)
                .toPromise()
                .then(res => {
                    if (res && res['token']) {
                        const user = res['user'];

                        user.activeRoleIndex = 0;

                        sessionStorage.setItem('token', res['token']);
                        sessionStorage.setItem('session', JSON.stringify({
                            user: user,
                            config: res['config']
                        }));
                        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                        this._router.navigateByUrl(redirectURL);
                    }

                })
                .catch(err => {
                    this.notification.error(null, err.error);
                });
        }
        else {
            this.notification.error(null, 'FORM_NOT_VALID');
        }
    }


}
