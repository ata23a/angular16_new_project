import {Injectable} from '@angular/core';
import moment from "moment";
import {FormGroup} from "@angular/forms";

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    constructor() {
    }

    getToken = () => {
        return window.sessionStorage.getItem('token');
    };
    getUser = () => {
        const session = this.getSession();
        return session ? session.user : null;
    };

    setDateForm(form: FormGroup, key: string, attribut: string): void {
        const session = sessionStorage.getItem(key);
        const tableState = session ? JSON.parse(session) : null;

        if (tableState) {
            const formValue = form.getRawValue();
            const filter = tableState.filter.hasOwnProperty(attribut) ? tableState.filter[attribut] : [];
            let start = formValue.start ? moment(formValue.start).startOf('day').toDate() : null;
            let end = formValue.end ? moment(formValue.end).endOf('day').toDate() : null;

            filter.forEach((item, index) => {
                if (item.operator === 'gte') {
                    start = moment(item.value).startOf('day').toDate();
                }
                else if (item.operator === 'lte') {
                    end = moment(item.value).endOf('day').toDate();
                }
            });

            form.patchValue({
                start,
                end
            });
        }
    }

    getSession() {
        try {
            const session = JSON.parse(sessionStorage.getItem('session'));

            if (!session) {
                // throw new Error('user disconnected!');
                return {};
            }

            return session;
        } catch (e) {
            console.log(e);
        }

        return {};
    }

    getCompanyId = () => {
        const company = this.getActiveCompany();
        return company ? parseInt(company.id) : null;
    }
    getActiveCompany = () => {
        const user = this.getUser();
        return user ? user.activeCompany : null;
    }
}
