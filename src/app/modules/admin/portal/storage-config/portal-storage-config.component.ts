import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Subject, takeUntil} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {CommonModule, DatePipe} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PortalStorageConfigService} from './portal-storage-config.service';
import {PortalStorageConfigModalComponent} from './modal/portal-storage-config-modal.component';
import {MessageDialogService} from 'app/shared/services/message/message-dialog-service';
import {UtilFunctions} from 'app/shared/util/util-functions';
import {FilterPredicateUtil} from 'app/shared/util/util-classes';
import {UserService} from 'app/shared/services/user/user.service';
import {PortalStorageConfigModel} from '../../../../shared/models/portal-storage-config.model';

@Component({
    selector: 'portal-storage-config',
    templateUrl: './portal-storage-config.component.html',
    styleUrls: ['./portal-storage-config.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        DatePipe
    ]
})
export class PortalStorageConfigComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;

    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalStorageConfigModel>();
    displayedColumns = ['buttons', 'id', 'identifier', 'description', 'storageType', 'updatedAt'];


    constructor(
        public service: PortalStorageConfigService,
        public messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _userService: UserService
    ) {}

    ngOnInit(): void {
        this.service.configs$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe(users => {
                this.dataSource.data = users;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.dataSource);
        const filterPredicateMenu = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.dataSource.filterPredicate = filterPredicateMenu.instance.bind(filterPredicateMenu);
        this.dataSource.sort = this.sort;
    }

    refresh(): void {
        this.service.loadConfigs();
    }

    update(): void {
        setTimeout(() => {
            this.table.renderRows();
            this._changeDetectorRef.detectChanges();
        });
    }

    edit(model: PortalStorageConfigModel): void {
        this.service.getConfig(model.id).then(config => {
            const modal = this._matDialog.open(PortalStorageConfigModalComponent, {
                disableClose: true,
                panelClass: 'portal-storage-config-modal-container',
                data: {
                    config: config
                }
            });
            modal.componentInstance.title = "Configurações de Armazenamento";
            modal.componentInstance.parent = this;
        });
    }

    delete(model: PortalStorageConfigModel): void {
        this.messageService.open('Tem certeza que deseja excluir esta configuração?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.deleteConfig(model.id).subscribe({
                    next: () => {
                        this.refresh();
                    },
                });
            }
        });

    }

    addConfig(): void {
        const modal = this._matDialog.open(PortalStorageConfigModalComponent, {
            disableClose: true,
            panelClass: 'portal-storage-config-modal-container',
            data: {
                config: null
            }
        });
        modal.componentInstance.title = "Nova Configuração de Armazenamento";
        modal.componentInstance.parent = this;
    }

    filter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    announceSortChange(): void {
        // Implementação se necessário
    }

    // Métodos auxiliares para verificação de roles
    hasRole(role: string): boolean {
        return this._userService.userHasRole(role);
    }

    hasHierarchyLevel(level: number): boolean {
        const userLevel = this._userService.getUserHighestHierarchyLevel();
        return userLevel !== undefined && userLevel <= level;
    }
}
