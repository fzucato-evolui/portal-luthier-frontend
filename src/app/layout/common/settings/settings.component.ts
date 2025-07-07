import {NgClass, NgFor, NgIf} from '@angular/common';
import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router} from '@angular/router';
import {FuseDrawerComponent} from '@fuse/components/drawer';
import {FuseConfig, FuseConfigService, Scheme, Theme, Themes} from '@fuse/services/config';

import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {UserService} from '../../../shared/services/user/user.service';
import {UserModel} from '../../../shared/models/user.model';
import {UtilFunctions} from '../../../shared/util/util-functions';

@Component({
    selector     : 'settings',
    templateUrl  : './settings.component.html',
    styles       : [
        `
            settings {
                z-index: 1000;
                position: static;
                display: block;
                flex: none;
                width: auto;
            }

            @media (screen and min-width: 1280px) {

                empty-layout + settings .settings-cog {
                    right: 0 !important;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: [MatIconModule, FuseDrawerComponent, MatButtonModule, NgFor, NgClass, MatTooltipModule, NgIf],
})
export class SettingsComponent implements OnInit, OnDestroy
{
    config: FuseConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _userService: UserService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) =>
            {
                // Store the config
                this.config = config;
            });

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: UserModel) =>
            {
                if (user && user.config) {
                    if (UtilFunctions.isValidStringOrArray(user.config.theme) === true) {
                        this.config.theme = user.config.theme;
                        const theme: Theme = this.config.theme;
                        this._fuseConfigService.config = {theme};
                    }
                    if (UtilFunctions.isValidStringOrArray(user.config.scheme) === true) {
                        this.config.scheme = user.config.scheme;
                        const scheme: Scheme = this.config.scheme;
                        this._fuseConfigService.config = {scheme};
                    }
                }

            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the layout on the config
     *
     * @param layout
     */
    setLayout(layout: string): void
    {
        // Clear the 'layout' query param to allow layout changes
        this._router.navigate([], {
            queryParams        : {
                layout: null,
            },
            queryParamsHandling: 'merge',
        }).then(() =>
        {
            // Set the config
            this._fuseConfigService.config = {layout};
        });
    }

    /**
     * Set the scheme on the config
     *
     * @param scheme
     */
    setScheme(scheme: Scheme): void
    {
        this._fuseConfigService.config = {scheme};
        firstValueFrom(this._userService.saveConfig({
            theme: this.config.theme,
            scheme: scheme
        }));
    }

    /**
     * Set the theme on the config
     *
     * @param theme
     */
    setTheme(theme: Theme): void
    {
        this._fuseConfigService.config = {theme};
        firstValueFrom(this._userService.saveConfig({
            theme: theme,
            scheme: this.config.scheme
        }));
    }
}
