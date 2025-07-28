import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {SharedPipeModule} from '../../../../../../../shared/pipes/shared-pipe.module';
import {
    LuthierCustomFieldModel,
    LuthierTableFieldModel,
    LuthierTableModel,
    LuthierTableReferenceModel,
    LuthierVisionDatasetFieldTypeEnum
} from '../../../../../../../shared/models/luthier.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {LuthierDictionaryDatasetComponent} from '../../luthier-dictionary-dataset.component';
import {TableType} from '../../../table/luthier-dictionary-table.component';
import {cloneDeep} from 'lodash-es';
import {SelectionModel} from '@angular/cdk/collections';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector       : 'luthier-dictionary-dataset-field-modal',
    styleUrls      : ['/luthier-dictionary-dataset-field-modal.component.scss'],
    templateUrl    : './luthier-dictionary-dataset-field-modal.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        FormsModule,
        NgFor,
        NgClass,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        NgIf,
        MatCheckboxModule
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryDatasetFieldModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatSort) sort: MatSort;
    model: {
        fieldType?: LuthierVisionDatasetFieldTypeEnum,
        reference?: LuthierTableReferenceModel,
        table?: LuthierTableModel
        fields?: SelectionModel<LuthierTableFieldModel | LuthierCustomFieldModel>
    } = {
        table: new LuthierTableModel(),
        reference: new LuthierTableReferenceModel(),
        fields: new SelectionModel<LuthierTableFieldModel | LuthierCustomFieldModel>(true, [])
    };
    references: LuthierTableReferenceModel[] = [];
    displayedColumns = [ 'buttons', 'code', 'key', 'name', 'label', 'fieldType', 'size',  'notNull', 'precision' ];
    public dataSource = new MatTableDataSource<LuthierTableFieldModel | LuthierCustomFieldModel>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    LuthierVisionDatasetFieldTypeEnum = LuthierVisionDatasetFieldTypeEnum;
    private _parent: LuthierDictionaryDatasetComponent;

    set parent(value: LuthierDictionaryDatasetComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryDatasetComponent {
        return  this._parent;
    }
    private _fieldType: TableType = 'fields';
    get fieldType(): TableType {
        return this._fieldType;
    }

    set fieldType(value: TableType) {
        this._fieldType = value;
        if (this._fieldType === 'customFields') {
            this.displayedColumns.splice(this.displayedColumns.findIndex(x => x === 'customValue'), 1);
        }
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryDatasetFieldModalComponent>)
    {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }


    doSaving() {
        this.dialogRef.close('ok');
    }

    canSave(): boolean {
        return UtilFunctions.isValidStringOrArray(this.model.fieldType) === true && UtilFunctions.isValidStringOrArray(this.model.fields.selected) === true;
    }


    announceSortChange(sort: Sort) {

    }

    changeTable(event: MatSelectChange) {
        if (UtilFunctions.isValidStringOrArray(this.model.reference.tablePK.fields) === false) {
            this.parent.service.getTable(this.model.reference.tablePK.code)
                .then(table => {
                    this.model.reference.tablePK = table;
                    this.model.reference.tablePK.fields.forEach(x => {
                        x['forbidden'] = this.parent.model.fields.findIndex(y => y.tableField?.name === x.name) >= 0;
                        if (x['forbidden'] === false && this.fieldType === 'customFields') {
                            x['forbidden'] = this.parent.model.customFields.findIndex(y => y.tableField?.name === x.name) >= 0;
                        }
                    })
                    this.dataSource.data = this.model.reference.tablePK.fields;
                    this.dataSource._updateChangeSubscription();
                    this._changeDetectorRef.detectChanges();
                })
        }
        else {
            this.dataSource.data = this.model.reference.tablePK.fields;
            this.dataSource._updateChangeSubscription();
            this._changeDetectorRef.detectChanges();
        }
    }

    changeFieldType(event: MatSelectChange) {
        this.model.reference = new LuthierTableReferenceModel();
        if (event.value === LuthierVisionDatasetFieldTypeEnum.NORMAL) {
            this.model.fields = new SelectionModel<LuthierTableFieldModel | LuthierCustomFieldModel>(true, []);
        }
        else {
            this.model.fields = new SelectionModel<LuthierTableFieldModel | LuthierCustomFieldModel>(false, []);
        }
        this.dataSource.data = [];
        this.dataSource._updateChangeSubscription();
        if (UtilFunctions.isValidStringOrArray(this.model.table.fields) === true) {
            if (event.value === LuthierVisionDatasetFieldTypeEnum.NORMAL) {
                let fields: Array<any> = this.model.table.fields;
                if (this.fieldType === 'customFields') {
                    fields.push(this.model.table.customFields);
                }
                this.dataSource.data = fields;
                this.dataSource._updateChangeSubscription();
            }
            this._changeDetectorRef.detectChanges();
        }
        else {
            this.parent.service.getTable(this.parent.model.table.code)
                .then(table => {
                    this.parent.model.table = table;
                    this.model.table = cloneDeep(this.parent.model.table);
                    this.model.table.fields.forEach(x => {
                        x['forbidden'] = this.parent.model.fields.findIndex(y => y.tableField?.name === x.name) >= 0;
                        if (x['forbidden'] === false && this.fieldType === 'customFields') {
                            x['forbidden'] = this.parent.model.customFields.findIndex(y => y.tableField?.name === x.name) >= 0;
                        }
                    })
                    this.model.table.customFields.forEach(x => {
                        x['forbidden'] = this.parent.model.customFields.findIndex(y => y.tableField?.name === x.name) >= 0;
                    })
                    this.references = this.model.table.references;
                    if (event.value === LuthierVisionDatasetFieldTypeEnum.NORMAL) {
                        let fields: Array<any> = this.model.table.fields;
                        if (this.fieldType === 'customFields') {
                            this.model.table.customFields.forEach(x => {
                                fields.push(x);
                            })
                        }
                        //console.log(fields);
                        this.dataSource.data = fields;
                        this.dataSource._updateChangeSubscription();
                    }
                    this._changeDetectorRef.detectChanges();
                })
        }
    }

    filterFields(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    isAllSelected() {
        const numSelected = this.model.fields.selected.length;
        const numRows = this.dataSource.data.filter(x => x['forbidden'] !== true).length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    toggleAllRows() {
        if (this.isAllSelected()) {
            this.model.fields.clear();
            return;
        }

        this.model.fields.select(...this.dataSource.data.filter(x => x['forbidden'] !== true));
    }

}
