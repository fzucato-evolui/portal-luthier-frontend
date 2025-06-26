import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierParameterModel} from '../../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../../luthier.service';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../../shared/util/util-classes';
import {DatePipe, NgIf} from '@angular/common';
import {LuthierManagerPatchesLupComponent} from '../luthier-manager-patches-lup.component';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {FilterModel, FilterRequestModel} from '../../../../../../../shared/models/filter.model';
import {FilterComponent} from '../../../../../../../shared/components/filter';
import {DrawerState} from '../../luthier-manager-patches.component';

@Component({
    selector: 'luthier-manager-patches-lup-parameter',
    templateUrl: './luthier-manager-patches-lup-parameter.component.html',
    styleUrls: ['/luthier-manager-patches-lup-parameter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        FormsModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatInputModule,
        MatCheckboxModule,
        MatTooltipModule,
        NgIf,
        DatePipe,
        MatSidenavModule,
        MatButtonModule,
        FilterComponent
    ]
})
export class LuthierManagerPatchesLupParameterComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges{

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('matDrawer', {static: false}) sidenavRight: MatDrawer;
    @ViewChild('drawerContainer', {static: false}) drawerContainer: MatDrawerContainer;
    @ViewChild('appFilter', {static: false}) appFilter: FilterComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierParameterModel>();
    displayedColumns = ['select', 'statusRow', 'name', 'user.name', 'creationDate', 'description'];
    selection = new SelectionModel<LuthierParameterModel>(true, []);

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
        if (this._parent && this._parent.parent) {
            return this._parent.parent.drawerState$;
        }
        return null;
    }

    filters: FilterModel[] = [
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
        },
        {
            column: 'user.name',
            label: 'Nome Usuário',
            type: 'TEXT',
            operator: 'CONTAINS',
            required: false
        },
        {
            column: 'creationDate',
            label: 'Data Criação',
            type: 'DATE_RANGE',
            operator: 'BETWEEN',
            required: false
        }
    ];

    constructor(private _parent: LuthierManagerPatchesLupComponent,
                private _changeDetectorRef: ChangeDetectorRef) {
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
        this.datasource.filterPredicate = (data: LuthierParameterModel, filter: string) => {
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
        const numRows = this.datasource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        if (this.isAllSelected() === true) {
            this.datasource.data.forEach(row => {
                row['statusRow'] = '#none';
                this.selection.clear()
            });
        }
        else {
            this.datasource.data.forEach(row => {
                row['statusRow'] = '#selected';
                this.selection.select(row);
            });
        }

        // Reaplica o filtro se não estiver no estado indeterminado
        if (this.selectionFilter !== this.SELECTION_FILTER.INDETERMINATE) {
            this.applyFilter();
        }
    }

    toggleSelection(row: LuthierParameterModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['statusRow'] = '#selected';
        } else {
            row['statusRow'] = '#none';
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

    refresh() {
        if (!this.import) {
            const filters = this.appFilter ? this.appFilter.getFilters() : null;
            if (filters != null) {
                this.handleFilter(filters);
            }
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }

    toggleMatRight() {
        this.sidenavRight.toggle();
    }

    handleFilter(filterData: FilterModel[]): void {
        //console.log('Filtros aplicados:', filterData);
        if (!this.import) {
            const filterRequest: FilterRequestModel = {
                filters: filterData,
            }
            this.service.filterParameters(filterRequest)
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
}
