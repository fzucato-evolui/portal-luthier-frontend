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
import {LuthierReportModel, LuthierVisionModel} from '../../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../../luthier.service';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../../shared/util/util-classes';
import {DatePipe, NgIf} from '@angular/common';
import {LuthierManagerPatchesLupComponent} from '../luthier-manager-patches-lup.component';

@Component({
    selector: 'luthier-manager-patches-lup-report',
    templateUrl: './luthier-manager-patches-lup-report.component.html',
    styleUrls: ['/luthier-manager-patches-lup-report.component.scss'],
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
export class LuthierManagerPatchesLupReportComponent implements OnInit, OnDestroy, AfterViewInit{

    @ViewChild(MatSort) sort!: MatSort;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierReportModel>();
    displayedColumns: string[] = ['select', 'statusRow', 'code', 'version', 'name', 'description', 'changedAt', 'lockedDate', 'userLocker.name'];
    selection = new SelectionModel<LuthierReportModel>(true, []);

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

    toggleSelection(row: LuthierReportModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['statusRow'] = '#selected';
            if (row.layoutControl) {
                this._parent.layoutControls.checkRow(row.layoutControl);
            }
        } else {
            row['statusRow'] = '#none';
            if (row.layoutControl) {
                this._parent.layoutControls.uncheckRow(row.layoutControl);
            }
        }
    }

    filter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasource.filter = filterValue.trim().toLowerCase();
    }

    refresh() {
        if (!this.import) {
            this.service.getReports()
                .then(value => {
                    this.datasource.data = value;
                });
            this.selection.clear();
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }
}
