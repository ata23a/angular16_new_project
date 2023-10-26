import {Component, OnDestroy, OnInit} from '@angular/core';
import {FuseNavigationService, FuseVerticalNavigationComponent} from "../../../@fuse/components/navigation";
import {MatIconModule} from "@angular/material/icon";
import {JsonPipe, NgIf, NgStyle} from "@angular/common";
import {NotificationsComponent} from "../common/notifications/notifications.component";
import {UserComponent} from "../common/user/user.component";
import {Subject, takeUntil} from "rxjs";
import {FuseMediaWatcherService} from "../../../@fuse/services/media-watcher";
import {Navigation} from "../../core/navigation/navigation.types";
import {NavigationService} from "../../core/navigation/navigation.service";
import {FuseFullscreenComponent} from "../../../@fuse/components/fullscreen";
import {LanguagesComponent} from "../common/languages/languages.component";
import {MatButtonModule} from "@angular/material/button";
import {MessagesComponent} from "../common/messages/messages.component";
import {QuickChatComponent} from "../common/quick-chat/quick-chat.component";
import {RouterLink, RouterOutlet} from "@angular/router";
import {SearchComponent} from "../common/search/search.component";
import {ShortcutsComponent} from "../common/shortcuts/shortcuts.component";
import {FuseLoadingBarComponent} from "../../../@fuse/components/loading-bar";
import {AppService} from "../../core/services/app/app.service";
import {UtilityService} from "../../core/services/utility/utility.service";
import {SessionService} from "../../core/services/session/session.service";
import {AppModule} from "../../app.module";
import {UserService} from "../../core/services/user/user.service";

@Component({
    selector: 'online-bus-layout',
    standalone: true,
    templateUrl: './online-bus-layout.component.html',
    imports: [
        FuseVerticalNavigationComponent,
        MatIconModule,
        NgIf,
        NotificationsComponent,
        UserComponent,
        FuseFullscreenComponent,
        LanguagesComponent,
        MatButtonModule,
        MessagesComponent,
        QuickChatComponent,
        RouterOutlet,
        SearchComponent,
        ShortcutsComponent,
        FuseLoadingBarComponent,
        RouterLink,
        JsonPipe,
        AppModule,
        NgStyle
    ],
    styleUrls: ['./online-bus-layout.component.scss']
})
export class OnlineBusLayoutComponent implements OnInit, OnDestroy{
    isScreenSmall: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    navigation: Navigation;
    public user;
    logoUrl: string;
    public session;
    userProfileUrl


 constructor(
     private utilityService:UtilityService,
     private _navigationService: NavigationService,
     private _fuseMediaWatcherService: FuseMediaWatcherService,
     private _userService: UserService,
     private _fuseNavigationService: FuseNavigationService,
     private sessionService: SessionService
 ) {
 }

    ngOnInit(): void {

        this.session = JSON.parse(sessionStorage.getItem('session'));
        this.user = this.session ? this.session.user : {};
        this.user = this.sessionService.getUser();
        this.userProfileUrl = this.utilityService.getImageUrl(this.user.photo, 'STATIC', 'photo');
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                this.isScreenSmall = !matchingAliases.includes('md');
            });
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });
        this.setLogo()
    }
    setLogo() {
        this.logoUrl = this.utilityService.getImageUrl(AppService.APP_ID, 'LOGO');
        const favIcon: HTMLLinkElement = document.querySelector('#appIcon');

        if (favIcon) {
            favIcon.href = this.logoUrl;
        }
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
