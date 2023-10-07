import {Injectable} from '@angular/core';
import {NgbDate} from "@ng-bootstrap/ng-bootstrap";
import moment from "moment";

@Injectable({
    providedIn: 'root'

})
export class UtilityService {

    constructor() {
    }

    ngbDateToMoment = (date: NgbDate) => {
        const cT = moment();

        cT.set({
            date: date.day,
            month: date.month - 1,
            year: date.year,
            hour: 12,
            minute: 0
        });

        return cT;
    };

    statusStyle = (status) => {
        const style = {
            color: 'white',
            background: 'danger',
            valuenow: 100,
            width: '100%'
        };

        switch (status) {
            case 'REJECTED':
            case 'CANCELED':
                style.background = 'red';
                style.color = 'dark';
                style.valuenow = 0;
                style.width = '0%';
                break;
            case 'VOIDED':
                style.background = 'red';
                style.color = 'dark';
                style.valuenow = 0;
                style.width = '0%';
                break;
            case 'REFUNDED':
                style.background = 'red';
                style.color = 'dark';
                style.valuenow = 0;
                style.width = '0%';
                break;
            case 'OPEN':
                style.background = 'green';
                style.color = 'white';
                style.valuenow = 10;
                style.width = '10%';
                break;
            case 'SENT':
                style.background = 'red';
                style.color = 'white';
                style.valuenow = 20;
                style.width = '20%';
                break;
            case 'APPROVED':
                style.background = 'red';
                style.color = 'white';
                style.valuenow = 25;
                style.width = '25%';
                break;
            case 'IN_PROGRESS':
                style.background = 'Light blue';
                style.color = 'white';
                style.valuenow = 50;
                style.width = '50%';
                break;
            case 'ON_HOLD':
                style.background = 'warning';
                style.color = 'dark';
                style.valuenow = 75;
                style.width = '75%';
                break;
            case 'PARTIAL':
                style.background = 'Yellow';
                style.color = 'dark';
                style.valuenow = 50;
                style.width = '50%';
                break;
            case 'PAID':
                style.background = 'green';
                style.color = 'white';
                style.valuenow = 100;
                style.width = '100%';
                break;
            case 'COMPLETED':
                style.background = 'green';
                style.color = 'white';
                style.valuenow = 100;
                style.width = '100%';
                break;
            default:  //  DRAFT
                style.background = 'red';
                style.color = 'white';
                style.valuenow = 100;
                style.width = '100%';
                break;
        }

        return style;
    };

    numberFormat(number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    phoneFormat(phone): string {
        if (phone) {
            const regex = /(\d{3})(\d{2})(\d{3})(\d{2})/;
            return phone.replace(regex, '$1 $2 $3 $4');
        }
        else {
            return '';
        }
    }
}
