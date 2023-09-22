import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';
import {inject} from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, throwError } from 'rxjs';
import {AuthentificationService} from "../services/authentification/authentification.service";

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> =>
{

    const authService = inject(AuthentificationService);
    let newReq = req.clone();

    const token = authService.accessToken;
    if ( authService.accessToken && !AuthUtils.isTokenExpired(authService.accessToken) )
    {
        newReq = req.clone({
            headers: req.headers.set('X-Access-Token', token),
        });
    }

    return next(newReq).pipe(
        catchError((error) =>
        {
            if ( error instanceof HttpErrorResponse && error.status === 401 )
            {
                authService.logout();

                location.reload();
            }

            return throwError(error);
        }),
    );
};
