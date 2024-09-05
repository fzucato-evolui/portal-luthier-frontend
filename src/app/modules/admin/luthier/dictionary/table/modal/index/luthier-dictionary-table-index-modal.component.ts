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
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgFor, NgIf} from '@angular/common';
import {SharedPipeModule} from '../../../../../../../shared/pipes/shared-pipe.module';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {
    LuthierIndexSortEnum,
    LuthierTableFieldModel,
    LuthierTableIndexModel
} from '../../../../../../../shared/models/luthier.model';
import {LuthierDictionaryTableComponent} from '../../luthier-dictionary-table.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector       : 'luthier-dictionary-table-index-modal',
    styleUrls      : ['/luthier-dictionary-table-index-modal.component.scss'],
    templateUrl    : './luthier-dictionary-table-index-modal.component.html',
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
export class LuthierDictionaryTableIndexModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    formSave: FormGroup;
    @ViewChild(MatSort) sort: MatSort;
    indexModel: LuthierTableIndexModel;
    fields: LuthierTableFieldModel[];
    index: number;
    public dataSource = new MatTableDataSource<FormGroup>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryTableComponent;
    displayedColumns = [ 'buttons', 'tableField.name', 'order'];
    LuthierIndexSortEnum = LuthierIndexSortEnum;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}, 'J': { pattern: new RegExp('\[a-zA-Z0-9\]')} };
    set parent(value: LuthierDictionaryTableComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryTableComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryTableIndexModalComponent>)
    {
    }

    ngOnInit(): void {
        this.formSave = this.parent.addIndex();
        if (UtilFunctions.isValidStringOrArray(this.indexModel.indexFields)) {
            this.indexModel.indexFields.forEach(y => {
                this.getIndexFields().push(this.parent.addIndexField());
            });
        }
        this.formSave.patchValue(this.indexModel);
        this.dataSource.data = this.getIndexFields().controls as (FormGroup[]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    getIndexFields(): FormArray {
        return this.formSave.get('indexFields') as FormArray;
    }

    doSaving() {
        const fc = this.formSave.get('name');
        const index = this.parent.indexesDataSource.data.findIndex(x => x.name.toUpperCase() === this.formSave.get('name').value.toString().toUpperCase())
        if (index >= 0 && this.index !== index) {
            fc.setErrors({
                'sameName': true
            },{emitEvent: true});
            fc.markAsDirty();
            this._changeDetectorRef.detectChanges();
            this.parent.messageService.open("Já existe um índice com o mesmo nome", "Erro de Validação", "warning");
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
        const fg = this.parent.addIndexField();
        fg.get('order').setValue(UtilFunctions.getNextValue(this.getIndexFields().value, 'order'));
        this.getIndexFields().push(fg);
        this.dataSource.data = this.getIndexFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    delete(i: number) {
        this.getIndexFields().removeAt(i);
        this.dataSource.data = this.getIndexFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    announceSortChange(sort: Sort) {
        const data = this.getIndexFields().controls as (FormGroup[]);
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
}
