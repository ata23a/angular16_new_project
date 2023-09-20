import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/index';
import {SessionService} from "../services/session/session.service";
import {AuthentificationService} from "../services/authentification/authentification.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthentificationService,
        private sessionService: SessionService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('Intercepteur JWT est appelé');
        // add authorization header with jwt token if available
        const token = this.sessionService.getToken();
        if (token) {
            console.log('Token récupéré dans l\'intercepteur JWT :', token);
            request = request.clone({
                headers: request.headers.set('X-Access-Token', token)
            });
        }

        const API = 'https://api.capsule.mg/grv';
        const URL = request.url;

        if ((!token && !URL.startsWith(API + '/login')) || !API) this.authService.logout();

        return next.handle(request);
    }
}
