import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {PortalLuthierHistoryService} from './portal-luthier-history.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTable, MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {StorageChange} from '../../../../core/auth/auth.service';
import {UtilFunctions} from '../../../../shared/util/util-functions';
import {MessageDialogService} from '../../../../shared/services/message/message-dialog-service';
import {UserService} from '../../../../shared/services/user/user.service';
import {
    PortalHistoryPersistTypeEnum,
    PortalLuthierHistoryFilterModel,
    PortalLuthierHistoryModel
} from '../../../../shared/models/portal_luthier_history.model';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import {SharedPipeModule} from '../../../../shared/pipes/shared-pipe.module';
import {FilterPredicateUtil} from '../../../../shared/util/util-classes';
import {PortalLuthierHistoryConfigModel} from '../../../../shared/models/system-config.model';
import {SelectionModel} from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {saveAs} from 'file-saver';
import {LuthierBasicModel} from '../../../../shared/models/luthier.model';

export const FORMAT = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
@Component({
    selector     : 'portal-luthier-history',
    templateUrl  : './portal-luthier-history.component.html',
    styleUrls : ['./portal-luthier-history.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: [
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        NgClass,
        NgIf,
        DatePipe,
        MatSidenavModule,
        MatDatepickerModule,
        MatSelectModule,
        SharedPipeModule,
        NgForOf,
        MatCheckboxModule

    ]
})
export class PortalLuthierHistoryComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<any>;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    public unsubscribeAll: Subject<any> = new Subject<any>();
    public dataSource = new MatTableDataSource<PortalLuthierHistoryModel>();
    displayedColumns = ['buttons', 'user.image', 'id', 'persistDate', 'user.name', 'luthierDatabase.identifier', 'persistType', 'classDescription', 'classKey'];
    workDataBase: number;
    dadosDataBase: number;
    filterModel: PortalLuthierHistoryFilterModel = new PortalLuthierHistoryFilterModel();
    PortalHistoryPersistTypeEnum = PortalHistoryPersistTypeEnum;
    config: PortalLuthierHistoryConfigModel;
    historical = new SelectionModel<PortalLuthierHistoryModel>(true, []);
    jsonDataList: Array<{fileName?: string, data?: string}> = [];
    filesProcessed = 0;
    /**
     * Constructor
     */
    constructor(public service: PortalLuthierHistoryService,
                public messageService: MessageDialogService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _userService: UserService,
                private _matDialog: MatDialog)

    {
        //window.addEventListener('storage', this.handleStorageChange);
    }

    handleStorageChange(event: StorageEvent) {
        console.log('Storage event detected:', event);

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.service.model$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((databases: PortalLuthierHistoryModel[]) =>
            {
                this.dataSource.data = databases;
            });
        this.service.config$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe(config =>
            {
                this.config = config;
            });
        const luthierDatabase = this._userService.luthierDatabase;
        if (UtilFunctions.isValidStringOrArray(luthierDatabase) === true) {
            this.workDataBase = parseInt(luthierDatabase);
        }
        const dadosDatabase = this._userService.dadosDatabase;
        if (UtilFunctions.isValidStringOrArray(dadosDatabase) === true) {
            this.dadosDataBase = parseInt(dadosDatabase);
        }
        this._userService.storageChange$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((storage: StorageChange) =>
            {
                if (storage.key === 'luthierDatabase') {
                    this.dadosDataBase = null;
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        this.workDataBase = parseInt(storage.value);
                    }
                    else {
                        this.workDataBase = null;
                    }
                }
                else if (storage.key === 'dadosDatabase') {
                    if (UtilFunctions.isValidStringOrArray(storage.value) === true) {
                        this.dadosDataBase = parseInt(storage.value);
                    }
                    else {
                        this.dadosDataBase = null;
                    }
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        window.removeEventListener('storage', this.handleStorageChange, false);
        // Unsubscribe from all subscriptions
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.dataSource);
        const filterPredicateFields = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.dataSource.filterPredicate = filterPredicateFields.instance.bind(filterPredicateFields);
        this.dataSource.sort = this.sort
    }

    refresh() {
        firstValueFrom(this.service.filter(this.filterModel));
    }

    update() {
        const me = this;
        setTimeout(() =>{
            me.table.renderRows();
            me._changeDetectorRef.detectChanges();
        });
    }

    delete(id) {
        this.messageService.open('Deseja realmente remover o histórico Luthier?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.delete(id).then(value => {
                        this.messageService.open('Histórico Luthier removido com sucesso', 'SUCESSO', 'success');
                    });
                }
            }
        });
    }

    announceSortChange($event: any) {

    }

    filter(event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    check(id) {
        this.workDataBase = id;
        this._userService.luthierDatabase = id;
    }

    copy(id) {
        this.messageService.open('Deseja realmente copiar os metatados desse banco para o banco de trabalho? Todos os dados atuais serão apagados.', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                const index = this.dataSource.data.findIndex(r => r.id === id);
                if (index >= 0) {
                    this.service.copy(id).then(value => {
                        this.workDataBase = null;
                        this._userService.luthierDatabase = "";
                        this.messageService.open('Dados copiados com sucesso', 'SUCESSO', 'success');
                    });
                }
            }
        });

    }
    clearImage(model: PortalLuthierHistoryModel) {
        model.user.image = 'assets/images/noPicture.png';
    }

    cleanFilter() {
        this.filterModel = new PortalLuthierHistoryFilterModel();
    }

    getHistoryDescription(): string {
        if (this.config == null) {
            this.config = new PortalLuthierHistoryConfigModel();
        }
        if (this.config.enabled) {
            return `Os históricos ficam salvos por ${this.config.daysToKeep} dias`;
        }
        else {
            return `A gravação de históricos está desabilitada`;
        }
    }


    isAllSelected() {
        const numSelected = this.historical.selected.length;
        const numRows = this.dataSource.data.filter(x => x['forbidden'] !== true).length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    toggleAllRows() {
        if (this.isAllSelected()) {
            this.historical.clear();
            return;
        }

        this.historical.select(...this.dataSource.data.filter(x => x['forbidden'] !== true));
    }

    applyHistory() {
        const sameDatabase = this.historical.selected.filter(x => x.luthierDatabase.id === this.workDataBase);
        let message = 'Deseja realmente aplicar os históricos escolhidos? Eles serão aplicados na ordem crescente de data.'
        if (UtilFunctions.isValidStringOrArray(sameDatabase)) {
            message += ' EXISTEM HISTÓRICOS DA MESMA BASE LUTHIER CONECTADA.'
        }
        this.messageService.open(message, 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
            if (result === 'confirmed') {
                this.service.applyHistorical(this.historical.selected).then(value => {
                    this.messageService.open('Históricos aplicados com sucesso', 'SUCESSO', 'success');
                });
            }
        });
    }

    canApply(): boolean {
        return this.historical.selected.length > 0 && UtilFunctions.isValidStringOrArray(this.workDataBase) && UtilFunctions.isValidStringOrArray(this.dadosDataBase);
    }

    download(model: PortalLuthierHistoryModel) {
        this.service.get(model.id).then(value => {
            const blob = new Blob([JSON.stringify(value)], {type: "text/plain;charset=utf-8"});
            const filename = `history_${model.id}.json`;
            saveAs(blob, filename);
        });

    }
    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const files = Array.from(input.files);
            this.filesProcessed = 0;
            this.jsonDataList = [];
            files.forEach(file => this.readFile(file, files.length));
        }
    }

    readFile(file: File, totalFiles: number): void {
        const reader = new FileReader();

        reader.onload = (e) => {
            const fileContent = e.target?.result as string;

            try {
                this.jsonDataList.push({
                    fileName: file.name,
                    data: fileContent
                });

                this.filesProcessed++;

                if (this.filesProcessed === totalFiles) {
                    setTimeout(() => {
                        this.uploadHistorical();
                    }, 100)

                }
            } catch (error) {
                this.messageService.open(`Erro ao processar arquivo ${file.name}: ${error}`, 'ERRO', 'error');
                console.error(`Error parsing JSON from file ${file.name}:`, error);
            }
        };

        reader.readAsText(file);
    }

    uploadHistorical(): void {
        try {
            const historical: Array<PortalLuthierHistoryModel> = [];
            this.jsonDataList.forEach(json => {
                try {
                    const history = JSON.parse(json.data) as PortalLuthierHistoryModel;
                    if (UtilFunctions.isValidStringOrArray(history.className) === false || !history.className.includes('br.com.evolui.')) {
                        throw new Error(`Histórico inválido (className)`);
                    }
                    if (UtilFunctions.isValidStringOrArray(history.persistType) === false || !Object.keys(PortalHistoryPersistTypeEnum).includes(history.persistType)) {
                        throw new Error(`Histórico inválido (persistType)`);
                    }
                    if (UtilFunctions.isValidStringOrArray(history.persistDate) === false) {
                        throw new Error(`Histórico inválido (persistDate)`);
                    }
                    if (UtilFunctions.isValidStringOrArray(history.json) === false) {
                        throw new Error(`Histórico inválido (json)`);
                    }
                    else {
                        const bean: LuthierBasicModel = JSON.parse(history.json);
                        if (UtilFunctions.isValidStringOrArray(bean.code) === false) {
                            throw new Error(`Histórico inválido (json)`);
                        }
                    }

                    historical.push(history);
                }
                catch (error) {
                    throw new Error(`Arquivo ${json.fileName}: ${error}`);
                }
            });
            this.service.applyHistorical(historical).then(value => {
                this.messageService.open('Históricos aplicados com sucesso', 'SUCESSO', 'success');
            });
        }
        catch (error) {
            this.messageService.open(`Erro ao processar arquivos: ${error}`, 'ERRO', 'error');
        }
    }


}
