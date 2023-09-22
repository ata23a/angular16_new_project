import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }
    getToken = () => {
        return window.sessionStorage.getItem('token');
    };
  getUser = () => {
    const session = this.getSession();
    return session ? session.user : null;
  };
  getSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem('session'));

      if (!session) {
        // throw new Error('user disconnected!');
        return {};
      }

      return session;
    }
    catch (e) {
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
