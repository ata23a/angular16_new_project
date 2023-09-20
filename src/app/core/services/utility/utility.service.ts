import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }
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
        style.background = 'default';
        style.color = 'dark';
        style.valuenow = 0;
        style.width = '0%';
        break;
      case 'VOIDED':
        style.background = 'default';
        style.color = 'dark';
        style.valuenow = 0;
        style.width = '0%';
        break;
      case 'REFUNDED':
        style.background = 'default';
        style.color = 'dark';
        style.valuenow = 0;
        style.width = '0%';
        break;
      case 'OPEN':
        style.background = 'primary';
        style.color = 'white';
        style.valuenow = 10;
        style.width = '10%';
        break;
      case 'SENT':
        style.background = 'danger';
        style.color = 'white';
        style.valuenow = 20;
        style.width = '20%';
        break;
      case 'APPROVED':
        style.background = 'danger';
        style.color = 'white';
        style.valuenow = 25;
        style.width = '25%';
        break;
      case 'IN_PROGRESS':
        style.background = 'info';
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
        style.background = 'warning';
        style.color = 'dark';
        style.valuenow = 50;
        style.width = '50%';
        break;
      case 'PAID':
        style.background = 'success';
        style.color = 'white';
        style.valuenow = 100;
        style.width = '100%';
        break;
      case 'COMPLETED':
        style.background = 'success';
        style.color = 'white';
        style.valuenow = 100;
        style.width = '100%';
        break;
      default:  //  DRAFT
        style.background = 'danger';
        style.color = 'white';
        style.valuenow = 100;
        style.width = '100%';
        break;
    }

    return style;
  };
}
