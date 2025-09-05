import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleChange, MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LedImportModel, LuthierTableModel, PatchImportItemModel} from '../../../../../../shared/models/luthier.model';
import {Subject, takeUntil} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {DrawerState, LuthierManagerPatchesComponent} from '../luthier-manager-patches.component';
import {LuthierService} from '../../../luthier.service';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../shared/util/util-classes';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {
    LuthierManagerPatchesLedProcessModalComponent
} from './modal/luthier-manager-patches-led-process-modal.component';
import {FilterModel, FilterRequestModel} from '../../../../../../shared/models/filter.model';
import {FilterComponent} from '../../../../../../shared/components/filter';

export type LedType = 'TABLE';
@Component({
    selector: 'luthier-manager-patches-led',
    templateUrl: './luthier-manager-patches-led.component.html',
    styleUrls: ['/luthier-manager-patches-led.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        FormsModule,
        MatInputModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatTooltipModule,
        NgxFileDropModule,
        NgIf,
        FilterComponent
    ]
})
export class LuthierManagerPatchesLedComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges{

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('matDrawer', {static: false}) sidenavRight: MatDrawer;
    @ViewChild('drawerContainer', {static: false}) drawerContainer: MatDrawerContainer;
    @ViewChild('appFilter', {static: false}) appFilter: FilterComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierTableModel>();
    displayedColumns: string[] = ['select', 'status', 'code', 'name', 'description'];
    selection = new SelectionModel<LuthierTableModel>(true, []);
    ledType: LedType = null;
    fileLoaded: boolean = false;
    fileName: string;

    // Propriedades para controle dos filtros
    private textFilter = '';

    // Estados do filtro de seleção
    readonly SELECTION_FILTER = {
        INDETERMINATE: 'indeterminate',
        SELECTED: 'selected',
        NOT_SELECTED: 'not_selected'
    } as const;

    private selectionFilter: string = this.SELECTION_FILTER.INDETERMINATE;

    get service(): LuthierService {
        if (this._parent != null) {
            return this._parent.service;
        }
        return null;
    }

    get import(): boolean {
        if (this._parent != null) {
            return this._parent.import;
        }
        return false;
    }

    get messageService(): MessageDialogService {
        if (this._parent != null) {
            return this._parent.messageService;
        }
        return null;
    }

    get drawerMode(): 'side' | 'over' {
        if (this._parent != null) {
            return this._parent.drawerMode;
        }
        return 'side';
    }

    get drawerOpened(): boolean {
        if (this._parent != null) {
            return this._parent.drawerOpened;
        }
        return true;
    }

    /**
     * Acesso ao observable de estado do drawer do componente avô
     */
    get drawerState$() {
        if (this._parent) {
            return this._parent.drawerState$;
        }
        return null;
    }

    filters: FilterModel[] = [
        {
            column: 'code',
            label: 'Código',
            type: 'NUMBER',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'name',
            label: 'Nome',
            type: 'TEXT',
            operator: 'CONTAINS',
            required: false
        },
        {
            column: 'description',
            label: 'Descrição',
            type: 'TEXT',
            operator: 'CONTAINS',
            required: false
        }
    ];

    constructor(private _parent: LuthierManagerPatchesComponent,
                private _changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog) {
    }

    ngOnInit(): void {
        // Subscreve às mudanças de estado do drawer
        if (this.drawerState$) {
            this.drawerState$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((state: DrawerState) => {
                    // Aguarda um tick para garantir que as mudanças sejam aplicadas
                    setTimeout(() => {
                        this.updateDrawerLayout();
                    }, 50);
                });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detecta quando o componente se torna visível
        if (changes['hidden'] && !changes['hidden'].currentValue && changes['hidden'].previousValue) {
            // Componente acabou de se tornar visível
            setTimeout(() => {
                this.updateDrawerLayout();
            }, 0);
        }
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.datasource);

        // Usando FilterPredicateUtil melhorado com suporte a múltiplos filtros
        const filterPredicateSearchs = FilterPredicateUtil.withColumns(this.displayedColumns);

        // Configuramos o filtro customizado que combina filtro de texto e seleção
        this.datasource.filterPredicate = (data: LuthierTableModel, filter: string) => {
            // Primeiro aplica o filtro de texto usando o FilterPredicateUtil original
            const textMatches = filterPredicateSearchs.instance(data, this.textFilter);

            // Depois aplica o filtro de seleção baseado no estado atual
            let selectionMatches = true;
            if (this.selectionFilter === this.SELECTION_FILTER.SELECTED) {
                selectionMatches = this.selection.isSelected(data);
            } else if (this.selectionFilter === this.SELECTION_FILTER.NOT_SELECTED) {
                selectionMatches = !this.selection.isSelected(data);
            }
            // Se for INDETERMINATE, selectionMatches permanece true (não filtra)

            return textMatches && selectionMatches;
        };

        this.datasource.sort = this.sort;

        // Aplica o filtro inicial
        this.applyFilter();

        // Força atualização inicial do drawer (caso o componente seja inicializado já visível)
        setTimeout(() => {
            this.updateDrawerLayout();
        }, 100);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Força o recálculo do layout do mat-drawer
     * Necessário quando o estado do drawer muda
     */
    private updateDrawerLayout(): void {
        if (this.drawerContainer) {
            // Força o recálculo das dimensões do drawer container
            this.drawerContainer.updateContentMargins();

            // Força detecção de mudanças
            this._changeDetectorRef.detectChanges();

            // Timeout adicional para garantir que o layout seja recalculado
            setTimeout(() => {
                if (this.drawerContainer) {
                    this.drawerContainer.updateContentMargins();
                }
            }, 100);
        }
    }

    /**
     * Método público para ser chamado pelo componente pai quando necessário
     */
    public forceDrawerUpdate(): void {
        this.updateDrawerLayout();
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.datasource.data.filter(item => UtilFunctions.isValidStringOrArray(item['selectable'] === true)).length;
        return numSelected === numRows;
    }

    masterToggle() {
        if (this.isAllSelected() === true) {
            this.datasource.data.forEach(row => {
                row['status'] = '#none';
                this.selection.clear()
            });
        }
        else {
            this.datasource.data.forEach(row => {
                if (UtilFunctions.isValidStringOrArray(row['selectable'] ) === true) {
                    row['status'] = '#selected';
                    this.selection.select(row);
                }
            });
        }

        // Reaplica o filtro se não estiver no estado indeterminado
        if (this.selectionFilter !== this.SELECTION_FILTER.INDETERMINATE) {
            this.applyFilter();
        }
    }

    toggleSelection(row: LuthierTableModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['status'] = '#selected';
        } else {
            row['status'] = '#none';
        }

        // Reaplica o filtro se não estiver no estado indeterminado
        if (this.selectionFilter !== this.SELECTION_FILTER.INDETERMINATE) {
            this.applyFilter();
        }
    }

    filter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.textFilter = filterValue.trim().toLowerCase();
        this.applyFilter();
    }

    changeSelected(event: MatCheckboxChange) {
        // Cicla através dos três estados baseado no estado atual
        if (this.selectionFilter === this.SELECTION_FILTER.INDETERMINATE) {
            this.selectionFilter = this.SELECTION_FILTER.SELECTED;
        } else if (this.selectionFilter === this.SELECTION_FILTER.SELECTED) {
            this.selectionFilter = this.SELECTION_FILTER.NOT_SELECTED;
        } else {
            this.selectionFilter = this.SELECTION_FILTER.INDETERMINATE;
        }
        this.applyFilter();
    }

    getSelectionFilterChecked(): boolean {
        return this.selectionFilter === this.SELECTION_FILTER.SELECTED ||
               this.selectionFilter === this.SELECTION_FILTER.NOT_SELECTED;
    }

    getSelectionFilterIndeterminate(): boolean {
        return this.selectionFilter === this.SELECTION_FILTER.INDETERMINATE;
    }

    getSelectionFilterLabel(): string {
        switch (this.selectionFilter) {
            case this.SELECTION_FILTER.SELECTED:
                return 'Selecionados';
            case this.SELECTION_FILTER.NOT_SELECTED:
                return 'Não Selecionados';
            default:
                return 'Filtrar por Seleção';
        }
    }

    getFilteredItemsCount(): number {
        return this.datasource.filteredData.length;
    }

    private applyFilter() {
        // Trigger do filtro - o valor específico não importa pois nossa lógica
        // está no filterPredicate que usa this.textFilter e this.selectionFilter
        this.datasource.filter = Date.now().toString();
    }

    toggleMatRight() {
        this.sidenavRight.toggle();
    }

    refresh() {
        if (!this.import) {
            const filters = this.appFilter ? this.appFilter.getFilters() : null;
            if (filters != null) {
                this.handleFilter(filters);
            }
        }
    }

    save() {
        if (!this.import) {
            // let filter = [];
            // if (this.isAllSelected() === false) {
            //     filter = this.selection.selected.map(item => item.code);
            // }
            let filter = this.selection.selected.map(item => item.code);
            // this.service.generateLed(filter)
            //     .then(result => {
            //         this.service.download(result.link)
            //             .then(blob => {
            //                 saveAs(blob, result.fileName);// Handle successful download
            //             })
            //
            //     });

            const modal = this._matDialog.open(LuthierManagerPatchesLedProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-led-process-modal-container' });
            modal.componentInstance.title = "Geração de Arquivo LED";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = filter;
            modal.componentInstance.isImport = false;
        }
        else {
            const model = new LedImportModel();
            model.fileName = this.fileName;
            model.tables = this.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierTableModel>();
                table.item = item;
                return table;
            });
            const modal = this._matDialog.open(LuthierManagerPatchesLedProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-led-process-modal-container' });
            modal.componentInstance.title = "Processamento de Arquivo LED";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = model;
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }

    clearFile() {
        this.fileLoaded = false;
    }

    handleFilter(filterData: FilterModel[]): void {
        //console.log('Filtros aplicados:', filterData);
        if (!this.import) {
            const filterRequest: FilterRequestModel = {
                filters: filterData,
            }
            this.service.filterExportedTables(filterRequest)
                .then(value => {
                    this.datasource.data = value;
                    // Reaplica os filtros após carregar novos dados
                    this.applyFilter();
                });
            this.selection.clear();
            // Reset do filtro de seleção quando recarrega os dados
            this.selectionFilter = this.SELECTION_FILTER.INDETERMINATE;
        }
    }

    public dropped(files: NgxFileDropEntry[]) {
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (ext.toLowerCase() !== '.led') {
                    this.messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    const formData = new FormData();
                    formData.append('file', file, file.name);

                    me.service.uploadLed(formData).then(result => {
                        me.datasource.data = result.tables.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['status'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['status'] = '#selected';
                                me.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.fileLoaded = true;
                        me.fileName = result.fileName;
                        me._changeDetectorRef.markForCheck();
                    });

                });
            }
        })

    }

    onLedTypeChange(event: MatButtonToggleChange) {
        // Força atualização do drawer quando o tipo muda
        setTimeout(() => {
            if (event.value === 'TABLE') {
                this.forceDrawerUpdate();
            }

            this._changeDetectorRef.detectChanges();
        }, 100);
    }
}
