import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, of, switchMap} from 'rxjs';
import {AuthUtils} from '../../auth/auth.utils';
import {AppService} from "../app/app.service";
import {UserService} from "../user/user.service";

@Injectable({
    providedIn: 'root'
})
export class AuthentificationService {
    private _authenticated: boolean = false;

    constructor(private httpClient: HttpClient,
                private _httpClient: HttpClient,
                private router: Router,
                private _userService: UserService,) {
    }

    login(email: string, password: string) {
        this._authenticated = true;
        return this.httpClient.post<any>([AppService.API, 'login'].join('/'), {
            email: email,
            password: password,
        });
    }

    set accessToken(token: string) {
        sessionStorage.setItem('token', token);
    }

    get accessToken(): string {
        return sessionStorage.getItem('token') ?? '';
    }

    logout() {
        sessionStorage.clear();
        this._authenticated = true;
        sessionStorage.clear()
        this.router.navigate(['/']);
    }

    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }
        if (!this.accessToken) {
            return of(false);
        }
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }
        return this.signInUsingToken();
    }

    signInUsingToken(): Observable<any> {
        return this._httpClient.post([AppService.API, 'login'].join('/'), {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>
                of(false),
            ),
            switchMap((response: any) => {
                if (response.token) {
                    this.accessToken = response.token;
                }
                this._authenticated = true;
                this._userService.user = response.user;
                return of(true);
            }),
        );
    }

}
