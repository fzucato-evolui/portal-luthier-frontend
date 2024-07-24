import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseMediaWatcherService} from '@fuse/services/media-watcher';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {FuseNavigationService, FuseVerticalNavigationComponent} from '../../../../../@fuse/components/navigation';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {SystemConfigModel, SystemConfigModelEnum} from '../../../../shared/models/system-config.model';
import {PortalConfigService} from './portal-config.service';
import {MatIconModule} from '@angular/material/icon';
import {PortalConfigGoogleComponent} from './google/portal-config-google.component';

@Component({
    selector     : 'portal-config',
    templateUrl  : './portal-config.component.html',
    styleUrls : ['/portal-config.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        NgClass,
        MatSidenavModule,
        FuseVerticalNavigationComponent,
        MatIconModule,
        NgForOf,
        NgIf,
        PortalConfigGoogleComponent,
    ],
})
export class PortalConfigComponent implements OnInit, OnDestroy
{
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: SystemConfigModelEnum = SystemConfigModelEnum.GOOGLE;
    SystemConfigModelEnum = SystemConfigModelEnum;
    public model: Array<SystemConfigModel>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _fuseNavigationService: FuseNavigationService,
                public service: PortalConfigService,
                private _changeDetectorRef: ChangeDetectorRef)
    {
    }


    ngOnInit(): void
    {
        this.panels = [
            {
                id         : SystemConfigModelEnum.GOOGLE,
                icon       : {fontSet:"fab", fontIcon:"fa-google"},
                title      : 'Google',
                description: "Autenticação Google"
            },
        ];
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
                this._changeDetectorRef.markForCheck();
            });
        this.service.model$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((configs) => {
                this.model = configs;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    refresh() {
        firstValueFrom(this.service.get());
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    goToPanel(panel: SystemConfigModelEnum): void
    {
        this.selectedPanel = panel;

    }

    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    getConfig(configType: SystemConfigModelEnum) {
        if (this.model) {
            const index = this.model.findIndex(x => x.configType === configType);
            if (index >= 0) {
                return this.model[index];
            }
        }
        return null;
    }
}
