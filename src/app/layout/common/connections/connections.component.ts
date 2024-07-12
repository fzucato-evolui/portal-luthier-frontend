import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {AsyncPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {firstValueFrom, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {
    PortalLuthierDatabaseService
} from '../../../modules/admin/portal/luthier-database/portal-luthier-database.service';
import {LuthierService} from '../../../modules/admin/luthier/luthier.service';
import {PortalLuthierDatabaseModel} from '../../../shared/models/portal-luthier-database.model';
import {LuthierDatabaseModel} from '../../../shared/models/luthier.model';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MessageDialogService} from '../../../shared/services/message/message-dialog-service';
import {StorageChange, UserService} from '../../../shared/services/user/user.service';

@Component({
    selector       : 'connections',
    templateUrl    : './connections.component.html',
    styleUrls      : ['./connection.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'connections',
    standalone     : true,
    imports: [
        MatButtonModule,
        FormsModule,
        NgIf,
        MatIconModule,
        MatTooltipModule,
        NgFor,
        NgClass,
        NgTemplateOutlet,
        RouterLink,
        DatePipe,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        AsyncPipe],
})
export class ConnectionsComponent implements OnInit, OnDestroy
{
    @ViewChild('connectionsOrigin') private _connectionsOrigin: MatButton;
    @ViewChild('connectionsPanel') private _connectionsPanel: TemplateRef<any>;
    filterValue: string;
    luthierDatabases: Array<PortalLuthierDatabaseModel> = [];
    dadosDatabases: Array<LuthierDatabaseModel> = [];

    filteredLuthierDatabases: ReplaySubject<Array<PortalLuthierDatabaseModel>> = new ReplaySubject<Array<PortalLuthierDatabaseModel>>(1);
    filteredDadosDatabases: ReplaySubject<Array<LuthierDatabaseModel>> = new ReplaySubject<Array<LuthierDatabaseModel>>(1);
    workLuthierDatabase: number;
    workDadosDatabase: number;
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    state: 'collapsed' | 'expanded' = 'expanded';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _portalDatabaseService: PortalLuthierDatabaseService,
        private _luthierService: LuthierService,
        private _userService: UserService,
        private _messageService: MessageDialogService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
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
        const luthierDatabase = this._userService.luthierDatabase;
        if (UtilFunctions.isValidStringOrArray(luthierDatabase)) {
            this.workLuthierDatabase = parseInt(luthierDatabase);
        }
        const dadosDatabase = this._userService.dadosDatabase;
        if (UtilFunctions.isValidStringOrArray(dadosDatabase)) {
            this.workDadosDatabase = parseInt(dadosDatabase);
        }
        this._userService.storageChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storage: StorageChange) =>
            {
                if (storage.key === 'luthierDatabase') {
                    this.workLuthierDatabase = parseInt(storage.value);
                    this._userService.dadosDatabase = '';
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        firstValueFrom(this._luthierService.getDatabases());
                        firstValueFrom(this._luthierService.checkUser());
                    }

                }
                else if (storage.key === 'dadosDatabase') {
                    this.workDadosDatabase = UtilFunctions.isValidStringOrArray(storage.value) ? parseInt(storage.value) : null;
                }
            });
        this._portalDatabaseService.model$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((databases: PortalLuthierDatabaseModel[]) =>
            {
                // Load the connections
                this.luthierDatabases = databases;

                // Mark for check
                this._changeDetectorRef.markForCheck();
                this.filterObjects();
            });

        this._luthierService.databases$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((databases: LuthierDatabaseModel[]) =>
            {
                // Load the connections
                this.dadosDatabases = databases;

                // Mark for check
                this._changeDetectorRef.markForCheck();
                this.filterObjects();
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

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the connections panel
     */
    openPanel(): void
    {
        // Return if the connections panel or its origin is not defined
        if ( !this._connectionsPanel || !this._connectionsOrigin )
        {
            return;
        }

        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay();
        }

        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._connectionsPanel, this._viewContainerRef));
    }

    /**
     * Close the connections panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    toggleLuthierDatabase(id: number): void
    {
        this._messageService.open('Ao alterar o banco de trabalho Luthier, os metadados são recarregados e todo trabalho atual será perdido. Confirma a operação?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this._userService.luthierDatabase = id.toString();

            }
        });


    }

    toggleDadosDatabase(id: number): void
    {
        this._userService.dadosDatabase = id.toString();
    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._connectionsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX : 'start',
                        originY : 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX : 'end',
                        originY : 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX : 'end',
                        originY : 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() =>
        {
            this._overlayRef.detach();
        });
    }

    toggleState() {
        if (this.state === 'collapsed') {
            this.state = 'expanded';
        }
        else {
            this.state = 'collapsed';
        }
    }

    filterObjects() {
        const filterText = this.filterValue;
        const children = this.dadosDatabases ? this.dadosDatabases.filter(x => {
            const model = x;
            let valid = true;
            if (UtilFunctions.isValidStringOrArray(filterText) === true) {
                valid = UtilFunctions.removeAccents(model.code.toString()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.database.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.user.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.server.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.dbType.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase()))
            }
            return valid;
        }) : [];
        this.filteredDadosDatabases.next(children);
        this.filteredLuthierDatabases.next(this.luthierDatabases.filter(x => {
            const model = x;
            let valid = true;
            if (children.length > 0 && x.id === this.workLuthierDatabase) {
                return true
            }
            if (UtilFunctions.isValidStringOrArray(filterText) === true) {
                valid = UtilFunctions.removeAccents(model.description.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.identifier.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase())) ||
                    UtilFunctions.removeAccents(model.databaseType.toUpperCase()).includes(UtilFunctions.removeAccents(filterText.toUpperCase()))
            }
            return valid;
        }));

    }
}
