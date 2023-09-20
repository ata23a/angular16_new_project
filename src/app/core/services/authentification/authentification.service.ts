import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, Observable, of, switchMap} from 'rxjs';
import {AuthUtils} from '../../auth/auth.utils';
import {UserService} from '../../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService {
    private _authenticated: boolean = false;
  constructor(private httpClient: HttpClient,
              private _httpClient: HttpClient,
              private router: Router,
              private _userService: UserService,) { }
    login(email: string, password: string) {
        this._authenticated = true;
        return this.httpClient.post<any>(['https://api.capsule.mg/grv', 'login'].join('/'), {
            email: email,
            password: password,
        });
    }
    set accessToken(token: string)
    {
        sessionStorage.setItem('token', token);
    }

    get accessToken(): string
    {
        return sessionStorage.getItem('token') ?? '';
    }

    logout() {
        sessionStorage.clear();
        this._authenticated = true;
        this.router.navigate(['/']);
    }

    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
    signInUsingToken(): Observable<any>
    {
        // Sign in using the token
        return this._httpClient.post(['https://api.capsule.mg/grv', 'login'].join('/'), {
            accessToken: this.accessToken,
        }).pipe(
            catchError(() =>

                // Return false
                of(false),
            ),
            switchMap((response: any) =>
            {
                if ( response.token )
                {
                    this.accessToken = response.token;
                }

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            }),
        );
    }

}
