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
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {SharedPipeModule} from '../../../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {
    LuthierReferenceActionEnum,
    LuthierReferenceStatusEnum,
    LuthierTableFieldModel,
    LuthierTableModel,
    LuthierTableReferenceModel
} from '../../../../../../../shared/models/luthier.model';
import {LuthierDictionaryTableComponent} from '../../luthier-dictionary-table.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector       : 'luthier-dictionary-table-reference-modal',
    styleUrls      : ['/luthier-dictionary-table-reference-modal.component.scss'],
    templateUrl    : './luthier-dictionary-table-reference-modal.component.html',
    imports: [
        SharedPipeModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        MatDialogModule,
        NgxMaskDirective,
        JsonPipe,
        MatTableModule,
        MatSortModule,
        NgIf,
        MatSlideToggleModule,
        MatTooltipModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryTableReferenceModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    formSave: FormGroup;
    @ViewChild(MatSort) sort: MatSort;
    referenceModel: LuthierTableReferenceModel;
    fields: LuthierTableFieldModel[];
    fieldsPK: LuthierTableFieldModel[];
    index: number;
    tables: LuthierTableModel[];
    public dataSource = new MatTableDataSource<FormGroup>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryTableComponent;
    displayedColumns = [ 'buttons', 'code', 'fieldPK.name', 'fieldFK.name'];
    LuthierReferenceActionEnum = LuthierReferenceActionEnum;
    LuthierReferenceStatusEnum = LuthierReferenceStatusEnum;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}, 'J': { pattern: new RegExp('\[a-zA-Z0-9\]')} };
    set parent(value: LuthierDictionaryTableComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryTableComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryTableReferenceModalComponent>)
    {
    }

    ngOnInit(): void {
        this.formSave = this.parent.addReference();
        if (UtilFunctions.isValidStringOrArray(this.referenceModel.fieldsReference)) {
            this.referenceModel.fieldsReference.forEach(y => {
                this.getReferenceFields().push(this.parent.addReferenceField());
            });
        }
        this.formSave.patchValue(this.referenceModel);
        this.dataSource.data = this.getReferenceFields().controls as (FormGroup[]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    getReferenceFields(): FormArray {
        return this.formSave.get('fieldsReference') as FormArray;
    }

    doSaving() {
        const fc = this.formSave.get('name');
        const index = this.parent.referencesDataSource.data.findIndex(x => x.name.toUpperCase() === fc.value.toString().toUpperCase())
        if (index >= 0 && this.index !== index) {
            fc.setErrors({
                'sameName': true
            },{emitEvent: true});
            fc.markAsDirty();
            this._changeDetectorRef.detectChanges();
            this.parent.messageService.open("Já existe uma referência com o mesmo nome", "Erro de Validação", "warning");
            return;
        }
        this.dialogRef.close('ok');
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }


    add() {
        this.getReferenceFields().push(this.parent.addReferenceField());
        this.dataSource.data = this.getReferenceFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    delete(i: number) {
        this.getReferenceFields().removeAt(i);
        this.dataSource.data = this.getReferenceFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    announceSortChange(sort: Sort) {
        const data = this.getReferenceFields().controls as (FormGroup[]);
        if (!sort.active || sort.direction === '') {
            this.dataSource.data = data;
            return;
        }

        this.dataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';

            switch (sort.active) {
                case 'order': return this.compare(
                    parseInt(UtilFunctions.isValidStringOrArray(a.value.code) === true ? a.value.code : -1),
                    parseInt(UtilFunctions.isValidStringOrArray(b.value.code) === true ? b.value.code : -1), isAsc);
                default: return this.compare(a.value[sort.active], b.value[sort.active], isAsc);;
            }
        });
    }

    compare(a: any, b: any, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    getKeyFieldsPK(): LuthierTableFieldModel[] {
        if (UtilFunctions.isValidStringOrArray(this.fieldsPK) === true) {
            return this.fieldsPK.filter(x => x.key === true);
        }
        return null;
    }

    changeTablePK(event: MatSelectChange) {
        this.parent.service.getTable(event.value.code)
            .then(table => {
                this.fieldsPK = table.fields;
                this.formSave.get('name').setValue('FK_' + this.parent.model.name + '_' + table.name);
                this.formSave.get('lookupFastFieldCode').setValue(null);
                this.formSave.get('lookupDescriptionFieldCode').setValue(null);
                this.getReferenceFields().clear();
                this.dataSource.data = this.getReferenceFields().controls as (FormGroup[]);
                this.dataSource._updateChangeSubscription();
                this.formSave.updateValueAndValidity();
                this._changeDetectorRef.detectChanges();
            })
    }
}
