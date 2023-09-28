import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }
    error(title, content) {
        /*const isObject = content ? content.hasOwnProperty('message') : false;
        let message = isObject ? content.message : content;

        if (/.*UNIQUE_CONSTRAINT_ERROR.*!/.test(message)) {
            message = content.error.toUpperCase() + '_NOT_UNIQUE';
        }*/

        /*this.toastOptions.title = this.translateMessage(title || 'ERROR');
        this.toastOptions.msg = this.translateMessage(message, 'ERROR');

        this.toastyService.error(this.toastOptions);*/
    }
    info(title, message) {
        /*title = this.translateMessage(title || 'INFO');
        message = this.translateMessage(message);

        this.toastOptions.title = title;
        this.toastOptions.msg = message;

        this.toastyService.info(this.toastOptions);*/
    }
    success(title, message) {
        /*title = this.translateMessage(title || 'SUCCESS');
        message = this.translateMessage(message);

        this.toastOptions.title = title;
        this.toastOptions.msg = message;

        this.toastyService.success(this.toastOptions);*/
    }
}
