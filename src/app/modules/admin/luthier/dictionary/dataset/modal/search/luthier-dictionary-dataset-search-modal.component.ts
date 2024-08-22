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
    LuthierSearchFieldEditorEnum,
    LuthierSearchFieldOperatorEnum,
    LuthierSearchStatusEnum,
    LuthierSearchTypeEnum,
    LuthierSubsystemModel,
    LuthierTableSearchSubsystemModel,
    LuthierVisionDatasetFieldModel,
    LuthierVisionDatasetModel,
    LuthierVisionDatasetSearchModel,
    LuthierVisionDatasetSearchSubsystemModel
} from '../../../../../../../shared/models/luthier.model';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryDatasetComponent} from '../../luthier-dictionary-dataset.component';

@Component({
    selector       : 'luthier-dictionary-dataset-search-modal',
    styleUrls      : ['/luthier-dictionary-dataset-search-modal.component.scss'],
    templateUrl    : './luthier-dictionary-dataset-search-modal.component.html',
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
export class LuthierDictionaryDatasetSearchModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    formSave: FormGroup;
    @ViewChild(MatSort) sort: MatSort;
    searchModel: LuthierVisionDatasetSearchModel;
    private _subsystems: LuthierSubsystemModel[];
    get subsystems(): LuthierSubsystemModel[] {
        return this._subsystems;
    }

    set subsystems(value: LuthierSubsystemModel[]) {
        value.unshift({
            code: -1,
            description: 'Todos subsistemas'
        })
        this._subsystems = value;
    }
    index: number;
    public dataSource = new MatTableDataSource<FormGroup>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryDatasetComponent;
    displayedColumns = [ 'buttons', 'order', 'code', 'dataset.name', 'field.tableField.name', 'field.tableField.fieldType', 'field.tableField.size', 'label', 'customLabel', 'operator', 'editor'];
    LuthierSearchTypeEnum = LuthierSearchTypeEnum;
    LuthierSearchStatusEnum = LuthierSearchStatusEnum;
    LuthierSearchFieldEditorEnum = LuthierSearchFieldEditorEnum;
    LuthierSearchFieldOperatorEnum = LuthierSearchFieldOperatorEnum;
    datasets: LuthierVisionDatasetModel[];
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}, 'J': { pattern: new RegExp('\[a-zA-Z0-9\]')} };
    set parent(value: LuthierDictionaryDatasetComponent) {
        this._parent = value;
        this.datasets = [];
        this.datasets.push(value.model);
        if (UtilFunctions.isValidStringOrArray(value.model.relatives) === true) {
            value.model.relatives.forEach(x => {
                if (x.name !== value.model.name) {
                    this.datasets.push(x);
                }
            })
        }

    }

    get parent(): LuthierDictionaryDatasetComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryDatasetSearchModalComponent>)
    {
    }

    ngOnInit(): void {
        this.formSave = this.parent.addSearch();
        if (UtilFunctions.isValidStringOrArray(this.searchModel.searchFields)) {
            this.searchModel.searchFields.forEach(y => {
                this.getSearchFields().push(this.parent.addSearchField());
            });
        }
        if (UtilFunctions.isValidStringOrArray(this.searchModel.subsystems) === false) {
            this.searchModel.subsystems = [];
            this.subsystems.forEach(x => {
                if (x.code > 0) {
                    const model = new LuthierVisionDatasetSearchSubsystemModel();
                    model.subsystem = x;
                    this.searchModel.subsystems.push(model);
                }
            })
        }
        this.searchModel.subsystems.forEach(y => {
            this.getSubsystems().push(this.parent.addSearchSubsystem());
        });
        this.formSave.patchValue(this.searchModel);
        this.dataSource.data = this.getSearchFields().controls as (FormGroup[]);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    getSearchFields(): FormArray {
        return this.formSave.get('searchFields') as FormArray;
    }

    getSubsystems(): FormArray {
        return this.formSave.get('subsystems') as FormArray;
    }

    onSelectionChange(event: MatSelectChange) {
        const fa = this.getSubsystems();
        fa.clear();
        const selectedValues = event.value as LuthierSubsystemModel[];

        if (UtilFunctions.isValidStringOrArray(selectedValues)) {
            const index = selectedValues.findIndex(x => x.code === -1);
            if (index < 0) {
                selectedValues.forEach(x => {
                    const c = this.parent.addSearchSubsystem();
                    c.get('subsystem').patchValue(x);
                    fa.push(c);
                })
            }
            else {
                const c = this.parent.addSearchSubsystem();
                c.get('subsystem').patchValue(selectedValues[index]);
                fa.push(c);
                //event.source.value = [selectedValues[index]];
                this._changeDetectorRef.detectChanges();
            }
        }
    }

    doSaving() {
        const fc = this.formSave.get('name');
        const index = this.parent.searchsDataSource.data.findIndex(x => x.name.toUpperCase() === fc.value.toString().toUpperCase())
        if (index >= 0 && this.index !== index) {
            fc.setErrors({
                'sameName': true
            },{emitEvent: true});
            fc.markAsDirty();
            this._changeDetectorRef.detectChanges();
            this.parent.messageService.open("Já existe uma pesquisa com o mesmo nome", "Erro de Validação", "warning");
            return;
        }
        const fa = this.getSubsystems();
        const selectedSubsystems = fa.value as LuthierVisionDatasetSearchSubsystemModel[];
        if (UtilFunctions.isValidStringOrArray(selectedSubsystems)) {
            let selectedAll = false;
            for (const sub of selectedSubsystems) {
                if (sub.subsystem.code === -1) {
                    selectedAll = true;
                    break;
                }
            }
            if (selectedAll) {
                fa.clear();
                this.subsystems.forEach(x => {
                    if (x.code != -1) {
                        const c = this.parent.addSearchSubsystem();
                        c.get('subsystem').patchValue(x);
                        fa.push(c);
                    }
                });
            }
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
        this.getSearchFields().push(this.parent.addSearchField());
        this.dataSource.data = this.getSearchFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    delete(i: number) {
        this.getSearchFields().removeAt(i);
        this.dataSource.data = this.getSearchFields().controls as (FormGroup[]);
        this._changeDetectorRef.detectChanges();
    }

    announceSortChange(sort: Sort) {
        const data = this.getSearchFields().controls as (FormGroup[]);
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

    compareSubsytemsCode(v1: LuthierSubsystemModel , v2: LuthierTableSearchSubsystemModel): boolean {
        if (v1 && v2 && v2.subsystem) {
            return v1.code === v2.subsystem.code;
        }
        else {
            return v1 === v2;
        }
    }

    isSubsystemDisabled(t: LuthierSubsystemModel, value: LuthierTableSearchSubsystemModel[]): boolean {
        if (t.code === -1) {
            return false;
        }
        return UtilFunctions.isValidStringOrArray(value) === true && value.findIndex(x => x.subsystem.code === -1) >= 0;
    }

    getDatasetFields(model: FormGroup): LuthierVisionDatasetFieldModel[] {
        const datasetName = model.get('dataset')?.value?.name;
        if(UtilFunctions.isValidStringOrArray(datasetName) === true) {
            const index = this.datasets.findIndex(x => x.name === datasetName);
            if (index >= 0) {
                return this.datasets[index].fields;
            }
        }
        return null;
    }

    datasetChanged(model: FormGroup, event: MatSelectChange) {
        model.get('field')?.get('tableField').patchValue(
            {
                id: '',
                code: null,
                name: '',
                label: '',
                size: null,
                fieldType: null
            }
        );
        this._changeDetectorRef.detectChanges();
    }

    fieldChanged(model: FormGroup, event: MatSelectChange) {
        model.get('label').setValue(event.value.tableField.label);
        this._changeDetectorRef.detectChanges();

    }

    getInvalidControls() {
        const invalid = [];
        (this.formSave.get('searchFields') as FormArray).controls.forEach(x => {
            const fgField = x.get('field') as FormGroup;

            const controls =fgField.controls;
            for (const name in controls) {
                if (controls[name].invalid) {
                    invalid.push(name);
                }
            }

        });
        return invalid;
    }
}
