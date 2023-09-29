import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {FuseAlertComponent} from "../../../@fuse/components/alert";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'auth-layout',
    standalone: true,
    templateUrl: './auth-layout.component.html',
    imports: [
        RouterOutlet,
        FuseAlertComponent,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        NgIf,
        ReactiveFormsModule
    ],
    styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {

}
