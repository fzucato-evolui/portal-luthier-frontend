import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Subject} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierLayoutControlModel} from '../../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../../luthier.service';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../../shared/util/util-classes';
import {DatePipe, NgIf} from '@angular/common';
import {LuthierManagerPatchesLupComponent} from '../luthier-manager-patches-lup.component';

@Component({
    selector: 'luthier-manager-patches-lup-layout-control',
    templateUrl: './luthier-manager-patches-lup-layout-control.component.html',
    styleUrls: ['/luthier-manager-patches-lup-layout-control.component.scss'],
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
        DatePipe
    ]
})
export class LuthierManagerPatchesLupLayoutControlComponent implements OnInit, OnDestroy, AfterViewInit{

    @ViewChild(MatSort) sort!: MatSort;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierLayoutControlModel>();
    displayedColumns = ['select', 'statusRow', 'name', 'type', 'plataform', 'creationDate', 'changedAt', 'lockDate', 'userLocker.name'];
    selection = new SelectionModel<LuthierLayoutControlModel>(true, []);

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

    constructor(private _parent: LuthierManagerPatchesLupComponent) {
    }

    ngAfterViewInit(): void {
        UtilFunctions.setSortingDataAccessor(this.datasource);
        const filterPredicateSearchs = FilterPredicateUtil.withColumns(this.displayedColumns);
        this.datasource.filterPredicate = filterPredicateSearchs.instance.bind(filterPredicateSearchs);
        this.datasource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {

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
    }

    toggleSelection(row: LuthierLayoutControlModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['statusRow'] = '#selected';
        } else {
            row['statusRow'] = '#none';
        }
    }

    filter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasource.filter = filterValue.trim().toLowerCase();
    }

    refresh() {
        if (!this.import) {
            this.service.getLayoutControls()
                .then(value => {
                    this.datasource.data = value;
                });
            this.selection.clear();
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }

    checkRow(layoutControl: LuthierLayoutControlModel) {
        const rowIndex = this.datasource.data.findIndex(item => item.name.toLowerCase() === layoutControl.name.toLowerCase());
        if (rowIndex > -1) {
            this.datasource.data[rowIndex]['statusRow'] = '#selected';
            this.selection.select(this.datasource.data[rowIndex]);
        }
        else {
            this.datasource.data.push(layoutControl);
            this.datasource.data[this.datasource.data.length - 1]['statusRow'] = '#selected';
            this.selection.select(this.datasource.data[this.datasource.data.length - 1]);
        }
    }

    uncheckRow(layoutControl: LuthierLayoutControlModel) {
        const rowIndex = this.datasource.data.findIndex(item => item.name.toLowerCase() === layoutControl.name.toLowerCase());
        if (rowIndex > -1) {
            this.datasource.data[rowIndex]['statusRow'] = '#none';
            this.selection.deselect(this.datasource.data[rowIndex]);
        }
    }
}
