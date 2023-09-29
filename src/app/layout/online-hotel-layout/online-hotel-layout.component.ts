import {Component, OnDestroy, OnInit} from '@angular/core';
import {FuseFullscreenComponent} from "../../../@fuse/components/fullscreen";
import {
    FuseHorizontalNavigationComponent,
    FuseNavigationService,
    FuseVerticalNavigationComponent
} from "../../../@fuse/components/navigation";
import {FuseLoadingBarComponent} from "../../../@fuse/components/loading-bar";
import {LanguagesComponent} from "../common/languages/languages.component";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MessagesComponent} from "../common/messages/messages.component";
import {NgIf} from "@angular/common";
import {NotificationsComponent} from "../common/notifications/notifications.component";
import {QuickChatComponent} from "../common/quick-chat/quick-chat.component";
import {RouterOutlet} from "@angular/router";
import {SearchComponent} from "../common/search/search.component";
import {ShortcutsComponent} from "../common/shortcuts/shortcuts.component";
import {UserComponent} from "../common/user/user.component";
import {Subject, takeUntil} from "rxjs";
import {Navigation} from "../../core/navigation/navigation.types";
import {NavigationService} from "../../core/navigation/navigation.service";
import {FuseMediaWatcherService} from "../../../@fuse/services/media-watcher";

@Component({
    selector: 'online-hotel-layout',
    standalone: true,
    templateUrl: './online-hotel-layout.component.html',
    imports: [
        FuseFullscreenComponent,
        FuseHorizontalNavigationComponent,
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        LanguagesComponent,
        MatButtonModule,
        MatIconModule,
        MessagesComponent,
        NgIf,
        NotificationsComponent,
        QuickChatComponent,
        RouterOutlet,
        SearchComponent,
        ShortcutsComponent,
        UserComponent
    ],
    styleUrls: ['./online-hotel-layout.component.scss']
})
export class OnlineHotelLayoutComponent implements OnInit, OnDestroy{
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isScreenSmall: boolean;
    constructor(
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    ) {
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }
    get currentYear(): number
    {
        return new Date().getFullYear();
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
