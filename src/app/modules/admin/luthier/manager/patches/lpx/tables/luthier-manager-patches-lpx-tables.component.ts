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
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {saveAs} from 'file-saver';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierTableModel} from '../../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../../luthier.service';
import {LuthierManagerPatchesLpxComponent} from '../luthier-manager-patches-lpx.component';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../../shared/util/util-classes';
import {NgIf} from '@angular/common';

@Component({
    selector: 'luthier-manager-patches-lpx-tables',
    templateUrl: './luthier-manager-patches-lpx-tables.component.html',
    styleUrls: ['/luthier-manager-patches-lpx-tables.component.scss'],
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
        NgIf
    ]
})
export class LuthierManagerPatchesLpxTablesComponent implements OnInit, OnDestroy, AfterViewInit{

    @ViewChild(MatSort) sort!: MatSort;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierTableModel>();
    displayedColumns: string[] = ['select', 'status', 'code', 'name', 'description', 'objectType'];
    selection = new SelectionModel<LuthierTableModel>(true, []);

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

    constructor(private _parent: LuthierManagerPatchesLpxComponent) {
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
        // if (!this.import) {
        //     this.service.tables$.pipe()
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe(value => {
        //             this.datasource.data = value;
        //         });
        // }
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.datasource.data.length;
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
                row['status'] = '#selected';
                this.selection.select(row);
            });
        }
    }

    toggleSelection(row: LuthierTableModel) {
        this.selection.toggle(row);
        if (this.selection.isSelected(row)) {
            row['status'] = '#selected';
        } else {
            row['status'] = '#none';
        }
    }

    filter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.datasource.filter = filterValue.trim().toLowerCase();
    }

    refresh() {
        if (!this.import) {
            firstValueFrom(this.service.getTables())
                .then(result => {
                    this.datasource.data = result;
                    this.selection.clear();
                });
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }
}
