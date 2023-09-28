import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-comfirm-modal',
    standalone: true,
    templateUrl: './comfirm-modal.component.html',
    styleUrls: ['./comfirm-modal.component.scss'],
    imports: [
        MatDialogModule
    ]
})

export class ComfirmModalComponent {
    @Input() title: string;
    @Input() text: string;
    @Input() type:  'info' | 'warning' | 'danger' | 'primary';

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<ComfirmModalComponent>
    ) {}
    ajout(){
        this.dialogRef.close(true);
    }
}
