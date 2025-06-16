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
import {
    LuthierResourceModel,
    LuthierResourceTypeEnum,
    LuthierResourceTypeParser
} from '../../../../../../../shared/models/luthier.model';
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
    selector: 'luthier-manager-patches-lup-resource',
    templateUrl: './luthier-manager-patches-lup-resource.component.html',
    styleUrls: ['/luthier-manager-patches-lup-resource.component.scss'],
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
export class LuthierManagerPatchesLupResourceComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges{

    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('matDrawer', {static: false}) sidenavRight: MatDrawer;
    @ViewChild('drawerContainer', {static: false}) drawerContainer: MatDrawerContainer;
    @ViewChild('appFilter', {static: false}) appFilter: FilterComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierResourceModel>();
    displayedColumns = ['select', 'statusRow', 'code', 'name', 'identifier', 'resourceType', 'description', 'height', 'width'];
    selection = new SelectionModel<LuthierResourceModel>(true, []);

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

    get drawerState$() {
        if (this._parent && this._parent.parent) {
            return this._parent.parent.drawerState$;
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
            column: 'identifier',
            label: 'Categoria',
            type: 'TEXT',
            operator: 'CONTAINS',
            required: false
        },
        {
            column: 'resourceType',
            label: 'Tipo',
            type: 'MULTIPLE_SELECT',
            operator: 'IN',
            required: false,
            options: Object.keys(LuthierResourceTypeEnum).map((key,index) => ({
                label: key,
                value: LuthierResourceTypeParser.parse(key)
            }))
        },
        // {
        //     column: 'resourceType',
        //     label: 'Tipo',
        //     type: 'TEXT',
        //     operator: 'CONTAINS',
        //     required: false
        // },
        {
            column: 'description',
            label: 'Descrição',
            type: 'TEXT',
            operator: 'CONTAINS',
            required: false
        },
        {
            column: 'height',
            label: 'Altura',
            type: 'NUMBER',
            operator: 'EQUALS',
            required: false
        },
        {
            column: 'width',
            label: 'Largura',
            type: 'NUMBER',
            operator: 'EQUALS',
            required: false
        }
    ];

    constructor(private _parent: LuthierManagerPatchesLupComponent,
                private _changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (this.drawerState$) {
            this.drawerState$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((state: DrawerState) => {
                    setTimeout(() => {
                        this.updateDrawerLayout();
                    }, 50);
                });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['hidden'] && !changes['hidden'].currentValue && changes['hidden'].previousValue) {
            setTimeout(() => {
                this.updateDrawerLayout();
            }, 0);
        }
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.datasource);

        const filterPredicateSearchs = FilterPredicateUtil.withColumns(this.displayedColumns);

        this.datasource.filterPredicate = (data: LuthierResourceModel, filter: string) => {
            const textMatches = filterPredicateSearchs.instance(data, this.textFilter);

            let selectionMatches = true;
            if (this.selectionFilter === this.SELECTION_FILTER.SELECTED) {
                selectionMatches = this.selection.isSelected(data);
            } else if (this.selectionFilter === this.SELECTION_FILTER.NOT_SELECTED) {
                selectionMatches = !this.selection.isSelected(data);
            }

            return textMatches && selectionMatches;
        };

        this.datasource.sort = this.sort;
        this.applyFilter();

        setTimeout(() => {
            this.updateDrawerLayout();
        }, 100);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private updateDrawerLayout(): void {
        if (this.drawerContainer) {
            this.drawerContainer.updateContentMargins();
            this._changeDetectorRef.detectChanges();
            setTimeout(() => {
                if (this.drawerContainer) {
                    this.drawerContainer.updateContentMargins();
                }
            }, 100);
        }
    }

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

        if (this.selectionFilter !== this.SELECTION_FILTER.INDETERMINATE) {
            this.applyFilter();
        }
    }

    toggleSelection(row: LuthierResourceModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['statusRow'] = '#selected';
        } else {
            row['statusRow'] = '#none';
        }

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
            this.service.filterResources(filterRequest)
                .then(value => {
                    this.datasource.data = value;
                    this.applyFilter();
                });
            this.selection.clear();
            this.selectionFilter = this.SELECTION_FILTER.INDETERMINATE;
        }
    }
}
