import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LuthierManagerComponent} from '../luthier-manager.component';
import {LuthierService} from '../../luthier.service';
import {LuthierManagerPatchesLedComponent} from './led/luthier-manager-patches-led.component';
import {LuthierManagerPatchesLpxComponent} from './lpx/luthier-manager-patches-lpx.component';
import {LuthierManagerPatchesLupComponent} from './lup/luthier-manager-patches-lup.component';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {FuseMediaWatcherService} from '../../../../../../@fuse/services/media-watcher';

export interface DrawerState {
    mode: 'over' | 'side';
    opened: boolean;
}

export type PatchType = 'LED' | 'LUP' | 'LPX';
@Component({
    selector: 'luthier-manager-patches',
    templateUrl: './luthier-manager-patches.component.html',
    styleUrls: ['/luthier-manager-patches.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonToggleModule,
        FormsModule,
        LuthierManagerPatchesLedComponent,
        LuthierManagerPatchesLpxComponent,
        LuthierManagerPatchesLupComponent
    ]
})
export class LuthierManagerPatchesComponent implements OnInit, OnDestroy {
    patchType: PatchType = null;
    @Input('import')
    import: boolean = false;

    private _drawerMode: 'over' | 'side' = 'side';
    private _drawerOpened: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // BehaviorSubject para comunicar mudanças aos componentes filhos
    private _drawerState$ = new BehaviorSubject<DrawerState>({
        mode: 'side',
        opened: true
    });

    /**
     * Observable que os componentes filhos podem subscrever para receber mudanças do drawer
     */
    get drawerState$() {
        return this._drawerState$.asObservable();
    }

    get drawerOpened(): boolean {
        return this._drawerOpened;
    }

    set drawerOpened(value: boolean) {
        if (this._drawerOpened !== value) {
            this._drawerOpened = value;
            this._updateDrawerState();
        }
    }

    get drawerMode(): "over" | "side" {
        return this._drawerMode;
    }

    set drawerMode(value: "over" | "side") {
        if (this._drawerMode !== value) {
            this._drawerMode = value;
            this._updateDrawerState();
        }
    }

    /**
     * Atualiza o estado do drawer e notifica os componentes filhos
     */
    private _updateDrawerState(): void {
        const newState: DrawerState = {
            mode: this._drawerMode,
            opened: this._drawerOpened
        };

        this._drawerState$.next(newState);
        this._changeDetectorRef.detectChanges();
    }

    get service(): LuthierService {
        if (this._parent != null) {
            return this._parent.service;
        }
        return null;

    }
    get messageService(): MessageDialogService {
        if (this._parent != null) {
            return this._parent.messageService;
        }
        return null;
    }
    constructor(private _parent: LuthierManagerComponent,
                private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                const wasChanged = this._drawerMode !== (matchingAliases.includes('lg') ? 'side' : 'over') ||
                                  this._drawerOpened !== matchingAliases.includes('lg');

                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this._drawerMode = 'side';
                    this._drawerOpened = true;
                } else {
                    this._drawerMode = 'over';
                    this._drawerOpened = false;
                }

                // Só notifica se houve mudança
                if (wasChanged) {
                    this._updateDrawerState();
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this._drawerState$.complete();
    }
}
