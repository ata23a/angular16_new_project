import {Component, OnDestroy, OnInit} from '@angular/core';
import {FuseNavigationService, FuseVerticalNavigationComponent} from "../../../@fuse/components/navigation";
import {MatIconModule} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import {NotificationsComponent} from "../common/notifications/notifications.component";
import {UserComponent} from "../common/user/user.component";
import {Subject, takeUntil} from "rxjs";
import {FuseMediaWatcherService} from "../../../@fuse/services/media-watcher";
import {Navigation} from "../../core/navigation/navigation.types";
import {NavigationService} from "../../core/navigation/navigation.service";
import {User} from "../../core/user/user.types";
import {UserService} from "../../core/user/user.service";
import {FuseFullscreenComponent} from "../../../@fuse/components/fullscreen";
import {LanguagesComponent} from "../common/languages/languages.component";
import {MatButtonModule} from "@angular/material/button";
import {MessagesComponent} from "../common/messages/messages.component";
import {QuickChatComponent} from "../common/quick-chat/quick-chat.component";
import {RouterOutlet} from "@angular/router";
import {SearchComponent} from "../common/search/search.component";
import {ShortcutsComponent} from "../common/shortcuts/shortcuts.component";
import {FuseLoadingBarComponent} from "../../../@fuse/components/loading-bar";

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
        FuseLoadingBarComponent
    ],
    styleUrls: ['./online-bus-layout.component.scss']
})
export class OnlineBusLayoutComponent implements OnInit, OnDestroy{
    isScreenSmall: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    navigation: Navigation;
    user: User;

 constructor(
     private _navigationService: NavigationService,
     private _fuseMediaWatcherService: FuseMediaWatcherService,
     private _userService:UserService,
     private _fuseNavigationService: FuseNavigationService
 ) {
 }

    ngOnInit(): void {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });


        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) =>
            {
                this.user = user;
            });

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
