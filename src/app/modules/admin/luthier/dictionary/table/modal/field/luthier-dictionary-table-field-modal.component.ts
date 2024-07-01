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
    LuthierCustomFieldModel,
    LuthierFieldCharcaseEnum,
    LuthierFieldEditorEnum,
    LuthierFieldLayoutEnum,
    LuthierFieldModifierEnum,
    LuthierFieldTypeEnum,
    LuthierGroupInfoModel,
    LuthierPermissionTypeEnum,
    LuthierResourceModel,
    LuthierTableFieldModel
} from '../../../../../../../shared/models/luthier.model';
import {LuthierDictionaryTableComponent, TableType} from '../../luthier-dictionary-table.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';

@Component({
    selector       : 'luthier-dictionary-table-field-modal',
    styleUrls      : ['/luthier-dictionary-table-field-modal.component.scss'],
    templateUrl    : './luthier-dictionary-table-field-modal.component.html',
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
        MatSlideToggleModule,
        MatTableModule,
        MatSortModule,
        NgIf
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryTableFieldModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    formSave: FormGroup;
    @ViewChild(MatSort) sort: MatSort;
    resources: LuthierResourceModel[] = [];
    model: LuthierTableFieldModel | LuthierCustomFieldModel;
    displayedColumns = [ 'buttons', 'code', 'caption', 'value', 'customValue', 'resource', 'permissionType', 'permissionMessage'];
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
    public dataSource = new MatTableDataSource<FormGroup>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryTableComponent;
    LuthierFieldTypeEnum = LuthierFieldTypeEnum;
    LuthierFieldModifierEnum = LuthierFieldModifierEnum;
    LuthierFieldLayoutEnum = LuthierFieldLayoutEnum;
    LuthierFieldEditorEnum = LuthierFieldEditorEnum;
    LuthierFieldCharcaseEnum = LuthierFieldCharcaseEnum;
    LuthierPermissionTypeEnum = LuthierPermissionTypeEnum;

    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')} };

    set parent(value: LuthierDictionaryTableComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryTableComponent {
        return  this._parent;
    }

    get groupInfoModel(): LuthierGroupInfoModel[] {
        return this._parent.model.groupInfos;
    }
    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryTableFieldModalComponent>)
    {
    }

    ngOnInit(): void {
        /*
        this.formSave = this._formBuilder.group({
                id: [crypto.randomUUID()],
                code: [null],
                name: [null, [Validators.required]],
                fieldType: [null, [Validators.required]],
                size: [null, [Validators.required]],
                key: [false, [Validators.required]],
                search: [false, [Validators.required]],
                label: [null, [Validators.required]],
                customLabel: [null],
                notNull: [false],
                defaultValue: [null],
                tableCode: [null],
                precision: [0, [Validators.required]],
                minValue: ["0"],
                maxValue: ["0"],
                mask: [null],
                charCase: [LuthierFieldCharcaseEnum.NORMAL],
                order: [null, [Validators.required]],
                autoInc: [false],
                editor: [LuthierFieldEditorEnum.AUTO],
                modifyType: [LuthierFieldModifierEnum.INTERNO],
                attributeName: [null, [Validators.required]],
                technichalDescription: [null],
                userDescription: [null],
                layoutSize: [LuthierFieldLayoutEnum.NAO_DEFINIDO],
                uiConfiguration: [null],
                groupInfo: this._formBuilder.group(
                    {
                        code: [null],
                        description: [null],
                    }
                ),
                staticFields: this._formBuilder.array([])

            },
            {
                validators: LuthierFieldValidator.validate(),
            },
        );
        */
        this.formSave = this.parent.addField(this._fieldType);
        if (UtilFunctions.isValidStringOrArray(this.model.staticFields)) {
            this.model.staticFields.forEach(y => {
                this.getStaticFields().push(this.parent.addStaticField(this._fieldType));
            });
        }
        this.formSave.patchValue(this.model);
        this.dataSource.data = this.getStaticFields().controls as (FormGroup[]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    getStaticFields(): FormArray {
        return this.formSave.get('staticFields') as FormArray;
    }


    doSaving() {
        this.dialogRef.close('ok');
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }


    add() {
        this.getStaticFields().push(this.parent.addStaticField(this._fieldType));
        this.dataSource.data = this.getStaticFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    delete(i: number) {
        this.getStaticFields().removeAt(i);
        this.dataSource.data = this.getStaticFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    getSeletctedImage(value: any): string {
        if (value && UtilFunctions.isValidStringOrArray(value.code) === true) {
            const code = value.code;
            if (UtilFunctions.isValidStringOrArray(code) === true) {
                const index = this.resources.findIndex(x => x.code === code);
                if (index >= 0) {
                    return this.resources[index].file;
                }
            }
        }
        else if (this.fieldType === 'customFields' && UtilFunctions.isValidStringOrArray(value) === true) {
            const index = this.resources.findIndex(x => x.name.toUpperCase() === value.toUpperCase());
            if (index >= 0) {
                return this.resources[index].file;
            }
        }
        return null;
    }

    announceSortChange(sort: Sort) {
        const data = this.getStaticFields().controls as (FormGroup[]);
        if (!sort.active || sort.direction === '') {
            this.dataSource.data = data;
            return;
        }

        this.dataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';

            switch (sort.active) {
                case 'code': return this.compare(
                    parseInt(UtilFunctions.isValidStringOrArray(a.value.code) === true ? a.value.code : -1),
                    parseInt(UtilFunctions.isValidStringOrArray(b.value.code) === true ? b.value.code : -1), isAsc);
                default: return this.compare(a.value[sort.active], b.value[sort.active], isAsc);;
            }
        });
    }

    compare(a: any, b: any, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
    compareImageName(v1: string , v2: string): boolean {
        return v1 === v2;
    }
}
