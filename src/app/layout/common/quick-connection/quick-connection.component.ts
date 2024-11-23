import {Overlay, OverlayRef, ScrollStrategy, ScrollStrategyOptions} from '@angular/cdk/overlay';
import {TextFieldModule} from '@angular/cdk/text-field';
import {AsyncPipe, DatePipe, DOCUMENT, NgClass, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {FuseScrollbarDirective} from '@fuse/directives/scrollbar';
import {QuickChatService} from 'app/layout/common/quick-chat/quick-chat.service';
import {firstValueFrom, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {PortalLuthierDatabaseModel} from '../../../shared/models/portal-luthier-database.model';
import {LuthierDatabaseModel} from '../../../shared/models/luthier.model';
import {LuthierService} from '../../../modules/admin/luthier/luthier.service';
import {StorageChange, UserService} from '../../../shared/services/user/user.service';
import {MessageDialogService} from '../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../shared/util/util-functions';
import {
    PortalLuthierDatabaseService
} from '../../../modules/admin/portal/luthier-database/portal-luthier-database.service';
import {TemplatePortal} from '@angular/cdk/portal';
import {FormsModule} from '@angular/forms';

@Component({
    selector     : 'quick-connection',
    templateUrl  : './quick-connection.component.html',
    styleUrls    : ['./quick-connection.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'quickConnection',
    standalone   : true,
    imports: [
        NgClass,
        NgIf,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        FuseScrollbarDirective,
        NgFor,
        NgTemplateOutlet,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        DatePipe,
        AsyncPipe
    ],
})
export class QuickConnectionComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('messageInput') messageInput: ElementRef;
    @ViewChild('connectionsPanel') private _connectionsPanel: TemplateRef<any>;
    currentOrigin: HTMLElement = null;
    filterValue: string;
    withLuthier = false;
    luthierDatabases: Array<PortalLuthierDatabaseModel> = [];
    dadosDatabases: Array<LuthierDatabaseModel> = [];
    filteredLuthierDatabases: ReplaySubject<Array<PortalLuthierDatabaseModel>> = new ReplaySubject<Array<PortalLuthierDatabaseModel>>(1);
    filteredDadosDatabases: ReplaySubject<Array<LuthierDatabaseModel>> = new ReplaySubject<Array<LuthierDatabaseModel>>(1);
    selectedLuthierDatabase: PortalLuthierDatabaseModel;
    selectedDadosDatabase: LuthierDatabaseModel;
    opened: boolean = false;
    private _mutationObserver: MutationObserver;
    private _scrollStrategy: ScrollStrategy = this._scrollStrategyOptions.block();
    private _overlay: HTMLElement;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _elementRef: ElementRef,
        private _renderer2: Renderer2,
        private _ngZone: NgZone,
        private _quickChatService: QuickChatService,
        private _scrollStrategyOptions: ScrollStrategyOptions,
        private _changeDetectorRef: ChangeDetectorRef,
        private _portalDatabaseService: PortalLuthierDatabaseService,
        private _luthierService: LuthierService,
        private _userService: UserService,
        private _messageService: MessageDialogService,
        private _overlayTootip: Overlay,
        private _viewContainerRef: ViewContainerRef,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Decorated methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any
    {
        return {
            'quick-chat-opened': this.opened,
        };
    }

    /**
     * Resize on 'input' and 'ngModelChange' events
     *
     * @private
     */
    @HostListener('input')
    @HostListener('ngModelChange')
    private _resizeMessageInput(): void
    {
        // This doesn't need to trigger Angular's change detection by itself
        this._ngZone.runOutsideAngular(() =>
        {
            setTimeout(() =>
            {
                // Set the height to 'auto' so we can correctly read the scrollHeight
                this.messageInput.nativeElement.style.height = 'auto';

                // Get the scrollHeight and subtract the vertical padding
                this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;
            });
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        this._userService.storageChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((storage: StorageChange) =>
            {
                if (storage.key === 'luthierDatabase') {
                    this.selectedDadosDatabase = null;
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        this.selectedLuthierDatabase = this.luthierDatabases.filter(x => x.id.toString() === storage.value.toString())[0];
                        this._userService.dadosDatabase = '';
                        if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                            Promise.all(
                                [
                                    firstValueFrom(this._luthierService.getDatabases()),
                                    firstValueFrom(this._luthierService.checkUser())
                                ]
                            ).then(async value => {
                                const databases = value[0];
                                const user = value[1];
                                if (!UtilFunctions.isValidObject(databases) || databases.toString().toUpperCase().includes("FALL")) {
                                    throw new Error("Invalid Databases")
                                }
                                if (!UtilFunctions.isValidObject(user) || user.toString().toUpperCase().includes("FALL")) {
                                    throw new Error("Invalid User")
                                }
                            }).catch(error => {
                                console.error(error);
                                this._userService.luthierDatabase = "";
                            });

                        }
                    }
                    else {
                        this.selectedLuthierDatabase = null;
                    }

                }
                else if (storage.key === 'dadosDatabase') {
                    this.selectedDadosDatabase = UtilFunctions.isValidStringOrArray(storage.value) ? this.dadosDatabases.filter(x => x.code.toString() === storage.value)[0] : null;
                }
                this._changeDetectorRef.detectChanges();
            });
        this._portalDatabaseService.model$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((databases: PortalLuthierDatabaseModel[]) =>
            {
                // Load the connections
                this.luthierDatabases = databases;
                const luthierDatabase = this._userService.luthierDatabase;
                if (UtilFunctions.isValidStringOrArray(luthierDatabase)) {
                    this.selectedLuthierDatabase = this.luthierDatabases.filter(x =>x.id.toString() === luthierDatabase)[0];
                }

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
                const dadosDatabase = this._userService.dadosDatabase;
                if (UtilFunctions.isValidStringOrArray(dadosDatabase)) {
                    this.selectedDadosDatabase = this.dadosDatabases.filter(x => x.code.toString() === dadosDatabase)[0];
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
                this.filterObjects();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        // Fix for Firefox.
        //
        // Because 'position: sticky' doesn't work correctly inside a 'position: fixed' parent,
        // adding the '.cdk-global-scrollblock' to the html element breaks the navigation's position.
        // This fixes the problem by reading the 'top' value from the html element and adding it as a
        // 'marginTop' to the navigation itself.
        this._mutationObserver = new MutationObserver((mutations) =>
        {
            mutations.forEach((mutation) =>
            {
                const mutationTarget = mutation.target as HTMLElement;
                if ( mutation.attributeName === 'class' )
                {
                    if ( mutationTarget.classList.contains('cdk-global-scrollblock') )
                    {
                        const top = parseInt(mutationTarget.style.top, 10);
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', `${Math.abs(top)}px`);
                    }
                    else
                    {
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', null);
                    }
                }
            });
        });
        this._mutationObserver.observe(this._document.documentElement, {
            attributes     : true,
            attributeFilter: ['class'],
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Disconnect the mutation observer
        this._mutationObserver.disconnect();

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the panel
     */
    open(): void
    {
        // Return if the panel has already opened
        if ( this.opened )
        {
            return;
        }

        // Open the panel
        this._toggleOpened(true);
    }

    /**
     * Close the panel
     */
    close(): void
    {
        // Return if the panel has already closed
        if ( !this.opened )
        {
            return;
        }

        // Close the panel
        this._toggleOpened(false);
    }

    /**
     * Toggle the panel
     */
    toggle(withLuthier?: boolean): void
    {
        if ( this.opened )
        {
            if (!withLuthier) {
                this.close();
                this.withLuthier = false;
            }
            else {
                this.withLuthier = !this.withLuthier;
            }
        }
        else
        {
            this.withLuthier = withLuthier;
            this.open();
        }
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || item.code || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the backdrop
     *
     * @private
     */
    private _showOverlay(): void
    {
        // Try hiding the overlay in case there is one already opened
        this._hideOverlay();

        // Create the backdrop element
        this._overlay = this._renderer2.createElement('div');

        // Return if overlay couldn't be create for some reason
        if ( !this._overlay )
        {
            return;
        }

        // Add a class to the backdrop element
        this._overlay.classList.add('quick-connection-overlay');

        // Append the backdrop to the parent of the panel
        this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

        // Enable block scroll strategy
        this._scrollStrategy.enable();

        // Add an event listener to the overlay
        this._overlay.addEventListener('click', () =>
        {
            this.close();
        });
    }

    /**
     * Hide the backdrop
     *
     * @private
     */
    private _hideOverlay(): void
    {
        if ( !this._overlay )
        {
            return;
        }

        // If the backdrop still exists...
        if ( this._overlay )
        {
            // Remove the backdrop
            this._overlay.parentNode.removeChild(this._overlay);
            this._overlay = null;
        }

        // Disable block scroll strategy
        this._scrollStrategy.disable();
    }

    /**
     * Open/close the panel
     *
     * @param open
     * @private
     */
    private _toggleOpened(open: boolean): void
    {
        // Set the opened
        this.opened = open;

        // If the panel opens, show the overlay
        if ( open )
        {
            this._showOverlay();
        }
        // Otherwise, hide the overlay
        else
        {
            this._hideOverlay();
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
            if (children.length > 0 && this.selectedLuthierDatabase && x.id === this.selectedLuthierDatabase.id) {
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

    openPanel(origin: HTMLElement, database:PortalLuthierDatabaseModel): void
    {
        // Return if the connections panel or its origin is not defined
        if ( !this._connectionsPanel || !origin)
        {
            return;
        }

        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay(origin);
        }
        else {
            this.closePanel(origin);
            this._createOverlay(origin);
        }


        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._connectionsPanel, this._viewContainerRef, {database: database}));
    }

    private _createOverlay(origin: HTMLElement): void
    {
        // Create the overlay
        this._overlayRef = this._overlayTootip.create({
            //hasBackdrop     : true,
            //backdropClass   : 'fuse-backdrop-on-mobile',
            positionStrategy: this._overlayTootip.position()
                .flexibleConnectedTo(origin)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'center',
                        overlayX: 'end',
                        overlayY: 'center',
                    }
                ]),
        });
        this.currentOrigin = origin;

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() =>
        {
            this._overlayRef.detach();
        });
    }
    closePanel(origin: HTMLElement): void
    {
        if (this._overlayRef && this.currentOrigin === origin) {
            this.currentOrigin = null;
            this._overlayRef.detach();
        }
    }
    toggleLuthierDatabase(id: number): void
    {
        this._messageService.open('Ao alterar o banco de trabalho Luthier, os metadados são recarregados e todo trabalho atual será perdido. Confirma a operação?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.selectedDadosDatabase = null;
                this._userService.luthierDatabase = id.toString();

            }
        });
    }

    toggleDadosDatabase(id: number): void
    {
        this._userService.dadosDatabase = id.toString();
    }
}
