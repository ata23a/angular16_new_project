import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'example'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'auth'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'income/list', loadChildren: () => import('app/modules/admin/revenus/revenus/revenus.routes')},
            {path: 'invoiceAdd', loadChildren: () => import('app/modules/admin/revenus/revenus/invoice-add/invoice-add.routes')},
            {path: 'requete', loadChildren: () => import('app/modules/admin/requete/requete.routes')},
            {path: 'invoiceDetail/:id', loadChildren: () => import('app/modules/admin/revenus/revenus/invoice-add/invoice-detail/invoice-detail.routes')},
            {path: 'invoiceList', loadChildren: () => import('app/modules/admin/revenus/revenus/invoice-list/invoice-list.routes')},
            {path: 'income/search', loadChildren: () => import('app/modules/admin/revenus/search/income-search/income-search.routes')},
            {path: 'income/invoice', loadChildren: () => import('app/modules/admin/revenus/revenus/facturation-revenus/facturation-revenus.routes')},
            {path: 'profile/:id', loadChildren: () => import('app/modules/admin/user-profile/user-profile.routes')},
            {path: 'settings/role', loadChildren: () => import('app/modules/admin/settings/role/role.routes')},
            {path: 'edit/:id', loadChildren: () => import('app/modules/admin/settings/role/role-edit/role-edit.routes')},
        ]
    },
];
