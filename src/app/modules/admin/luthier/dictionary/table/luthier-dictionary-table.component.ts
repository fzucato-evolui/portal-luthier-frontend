import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit, QueryList,
    ViewChild, ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgClass, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabChangeEvent, MatTabsModule} from '@angular/material/tabs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {LuthierDictionaryComponent} from '../luthier-dictionary.component';
import {
    LuthierCustomFieldModel,
    LuthierCustomizationModel,
    LuthierCustomizationType,
    LuthierFieldCharcaseEnum, LuthierFieldCharcaseEnumParser,
    LuthierFieldEditorEnum, LuthierFieldEditorEnumParser,
    LuthierFieldLayoutEnum,
    LuthierFieldModifierEnum,
    LuthierFieldTypeEnum, LuthierGroupInfoModel,
    LuthierIndexSortEnum,
    LuthierPermissionTypeEnum,
    LuthierReferenceActionEnum,
    LuthierReferenceStatusEnum,
    LuthierSearchFieldEditorEnum,
    LuthierSearchFieldOperatorEnum,
    LuthierSearchStatusEnum,
    LuthierSearchTypeEnum,
    LuthierTableFieldModel,
    LuthierTableIndexModel,
    LuthierTableModel,
    LuthierTableReferenceModel,
    LuthierTableSearchModel,
    LuthierViewBodyEnum
} from '../../../../../shared/models/luthier.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {cloneDeep} from 'lodash-es';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckbox, MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {SharedPipeModule} from '../../../../../shared/pipes/shared-pipe.module';
import {MatSelectModule} from '@angular/material/select';
import {LuthierFieldValidator} from '../../../../../shared/validators/luthier.validator';
import {MatDialog} from '@angular/material/dialog';
import {LuthierDictionaryTableFieldModalComponent} from './modal/field/luthier-dictionary-table-field-modal.component';
import {LuthierDictionaryTableIndexModalComponent} from './modal/index/luthier-dictionary-table-index-modal.component';
import {
    LuthierDictionaryTableReferenceModalComponent
} from './modal/reference/luthier-dictionary-table-reference-modal.component';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {EnumToArrayPipe} from '../../../../../shared/pipes/util-functions.pipe';
import {
    LuthierDictionaryTableSearchModalComponent
} from './modal/search/luthier-dictionary-table-search-modal.component';

export type TableType = 'fields' | 'indexes' | 'references' | 'searchs' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
@Component({
    selector     : 'luthier-dictionary-table',
    templateUrl  : './luthier-dictionary-table.component.html',
    styleUrls : ['/luthier-dictionary-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
        NgClass,
        MatIconModule,
        MatButtonModule,
        NgForOf,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        NgIf,
        MatExpansionModule,
        MatTabsModule,
        MatSlideToggleModule,
        MatTableModule,
        MatSortModule,
        NgxMaskDirective,
        MatButtonToggleModule,
        MatCheckboxModule,
        SharedPipeModule,
        MatSelectModule,
        NgTemplateOutlet
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryTableComponent implements OnInit, OnDestroy, AfterViewInit
{
    private _model: LuthierTableModel;
    public fieldsDataSource = new MatTableDataSource<LuthierTableFieldModel>();
    @ViewChildren('sortFields') sortFields: QueryList<MatSort>;
    public indexesDataSource = new MatTableDataSource<LuthierTableIndexModel>();
    @ViewChild('sortIndexes') sortIndexes: MatSort;
    public referencesDataSource = new MatTableDataSource<LuthierTableReferenceModel>();
    @ViewChild('sortReferences') sortReferences: MatSort;
    public searchsDataSource = new MatTableDataSource<LuthierTableSearchModel>();
    @ViewChild('sortSearchs') sortSearchs: MatSort;
    public customFieldsDataSource = new MatTableDataSource<LuthierCustomFieldModel>();
    public customizationsDataSource = new MatTableDataSource<LuthierTableFieldModel>();
    public groupsInfoDataSource = new MatTableDataSource<LuthierGroupInfoModel>();
    @ViewChild('sortGroupsInfo') sortGroupsInfo: MatSort;
    currentTab: TableType = 'fields';
    fieldRowEditing: { [key: string]: string }
    private _cloneModel: LuthierTableModel;
    @Input()
    set model(value: LuthierTableModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
    }
    get model(): LuthierTableModel {
        return this._cloneModel;
    }
    get service(): LuthierService {
        return this._parent.service;
    }
    get messageService(): MessageDialogService {
        return this._parent.messageService;
    }
    formSave: FormGroup;
    displayedFieldColumns = ['buttons', 'order', 'code', 'key', 'name', 'label', 'customLabel', 'fieldType', 'modifyType',
        'attributeName', 'autoInc', 'size', 'groupInfo.description', 'search', 'notNull',
        'defaultValue', 'precision', 'maxValue', 'minValue', 'mask', 'charCase', 'editor',
        'uiConfiguration', 'layoutSize'];
    displayedFieldColumns2 = ['buttons', 'code'];
    displayedIndexColumns = ['buttons', 'code', 'sortType', 'name',
        'creationOrder', 'unique', 'validationMessage'];
    displayedReferenceColumns = ['buttons', 'code', 'status', 'name', 'tablePK.name', 'onUpdate',
        'onDelete', 'attributeName', 'updateMessage', 'deleteMessage'];
    displayedGroupInfoColumns = ['buttons', 'code', 'order', 'description', 'groupInfoType',
        'parent.description'];
    displayedCustomFieldColumns = ['buttons', 'order', 'code', 'key', 'name', 'label', 'fieldType', 'modifyType',
        'attributeName', 'autoInc', 'size', 'groupInfo', 'search', 'notNull',
        'defaultValue', 'precision', 'maxValue', 'minValue', 'mask', 'charCase', 'editor',
        'uiConfiguration', 'layoutSize'];
    displayedCustomizationsColumns = ['buttons', 'code', 'name', 'customSize', 'customNotNull',
        'customDefaultValue', 'customPrecision', 'customMaxValue', 'customMinValue', 'customMask',
        'customCharCase', 'customEditor', 'customUiConfiguration'];
    displayedBondColumns = [ 'code', 'name', 'description'];
    displayedSearchColumns = [ 'buttons', 'code', 'name', 'customName', 'order', 'status', 'type'];
    LuthierFieldTypeEnum = LuthierFieldTypeEnum;
    LuthierFieldModifierEnum = LuthierFieldModifierEnum;
    LuthierFieldLayoutEnum = LuthierFieldLayoutEnum;
    LuthierFieldEditorEnum = LuthierFieldEditorEnum;
    LuthierFieldCharcaseEnum = LuthierFieldCharcaseEnum;
    LuthierViewBodyEnum = LuthierViewBodyEnum;
    // @ts-ignore
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (event.code === 'F8' || event.code === 'Escape') {
            if (UtilFunctions.isValidStringOrArray(this.fieldRowEditing) === true) {
                event.preventDefault();
                const field = this.model.fields[this.fieldRowEditing[this.currentTab]];
                const fg = this.getFieldGroup(field.id, this.currentTab);
                fg.patchValue(field);
                this.fieldRowEditing[this.currentTab] = null;
                this._changeDetectorRef.detectChanges();
            }
        }
    }
    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public formBuilder: FormBuilder,
                private _matDialog: MatDialog,
                private _parent: LuthierDictionaryComponent)
    {
    }

    ngOnInit(): void {
        this.refresh();
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {
        this.fieldsDataSource.sort = this.sortFields.get(0);
        this.indexesDataSource.sort = this.sortIndexes;
        this.referencesDataSource.sort = this.sortReferences;
        this.searchsDataSource.sort = this.sortSearchs;
        this.customFieldsDataSource.sort = this.sortFields.get(1);
        this.customizationsDataSource.sort = this.sortFields.get(2);
        this.groupsInfoDataSource.sort = this.sortGroupsInfo;
    }

    refresh() {
        this.formSave = this.formBuilder.group({
            code: [this.model.code],
            name: ['', [Validators.required]],
            description: ['', [Validators.required]],
            customDescription: this.addCustomizationField(),
            creationDate: [null],
            objectType: [''],
            technicalDescription: ['', []],
            userDescription: ['', []],
            className: ['', []],
            namespace: ['', []],
            logins: [false],
            logup: [false],
            logdel: [false],
            uiConfiguration: ['', []],
            export: [false],
            visible: [false],
            groupInfos: [null],
            views: this.formBuilder.array([])
        });
        this.addFields('fields');
        this.addFields('customFields');
        if (UtilFunctions.isValidStringOrArray(this.model.groupInfos) === true) {
            this.model.groupInfos.forEach(x => {
                x.id = crypto.randomUUID();
            })
        }
        this.setCustomizations();
        this.formSave.patchValue(this.model);
        this.fieldsDataSource.data = this.model.fields;
        this.indexesDataSource.data = this.model.indexes;
        this.referencesDataSource.data = this.model.references;
        this.searchsDataSource.data = this.model.searchs;
        this.customFieldsDataSource.data = this.model.customFields;
        this.customizationsDataSource.data = this.model.fields;
        this.groupsInfoDataSource.data = this.model.groupInfos;
    }

    setCustomizations() {
        if (UtilFunctions.isValidStringOrArray(this.model.customizations)) {
            this.model.customizations.forEach(x => {
                if ( x.type === 'FIELD_TABLE') {
                    const index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customLabel = x;
                    }
                }
                else if ( x.type === 'STATIC_VALUE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        const field = this.model.fields[index];
                        index = field.staticFields.findIndex(y => y.value?.toUpperCase() === x.name3?.toUpperCase());
                        if (index >= 0) {
                            field.staticFields[index].customCaption = x;
                        }
                    }
                }
                else if ( x.type === 'SEARCH_TABLE') {
                    const index = this.model.searchs.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.searchs[index].customName = x;
                    }
                }
                else if ( x.type === 'SEARCH_FIELD_TABLE') {
                    let index = this.model.searchs.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        const search = this.model.searchs[index];
                        index = search.searchFields.findIndex(y => y.tableField.name?.toUpperCase() === x.name3?.toUpperCase());
                        if (index >= 0) {
                            search.searchFields[index].customLabel = x;
                        }
                    }
                }
                else if ( x.type === 'TABLE_FIELD_SIZE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customSize = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_REQUIRED') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customNotNull = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_DEFAULTVALUE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customDefaultValue = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_PRECISION') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customPrecision = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_MAXVALUE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customMaxValue = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_MINVALUE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customMinValue = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_MASK') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customMask = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_CHARCASE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        x.value = LuthierFieldCharcaseEnumParser.toValue(x.value);
                        this.model.fields[index].customCharCase = x;
                    }
                }
                else if ( x.type === 'TABLE_FIELD_EDITORTYPE') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        x.value = LuthierFieldEditorEnumParser.toValue(x.value);
                        this.model.fields[index].customEditor = x;
                    }
                }
                else if ( x.type === 'TABLE_DESCRIPTION') {
                    this.model.customDescription = x;
                }
                else if ( x.type === 'FIELD_UICONFIGURATION') {
                    let index = this.model.fields.findIndex(y => y.name?.toUpperCase() === x.name2?.toUpperCase());
                    if (index >= 0) {
                        this.model.fields[index].customUiConfiguration = x;
                    }
                }
            });
        }
    }

    add(type: TableType) {
        const fg = this.addField(type);
        this.getFields(type).push(fg);
        const newField = fg.value as LuthierTableModel;
        newField['pending'] = true;
        if (type === 'fields') {
            this.fieldsDataSource.data.push(newField);
            this.fieldsDataSource._updateChangeSubscription();
        }
        else {
            this.customFieldsDataSource.data.push(newField);
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this._changeDetectorRef.detectChanges();
    }

    delete(id: string, index: number,type: TableType) {
        const fieldIndex = this.getFields(type).controls.findIndex(x => x.get("id").value === id);
        this.getFields(type).removeAt(fieldIndex);
        const dataSource = type === 'fields' ? this.fieldsDataSource : this.customFieldsDataSource;
        const code = dataSource.data[index].code;
        dataSource.data.splice(index, 1);
        dataSource._updateChangeSubscription();
        if (type === 'fields') {
            this.customizationsDataSource._updateChangeSubscription();
            const references = this.referencesDataSource.data
                .filter(x => x.fieldsReference.findIndex(y => (y.fieldFK.id === id || y.fieldFK.code === code) || (y.fieldPK.id === id || y.fieldPK.code === code)) >= 0)
                .map(x => this.referencesDataSource.data.findIndex(y => y.name === x.name));
            if (UtilFunctions.isValidStringOrArray(references)) {
                references.forEach(index => {
                    this.referencesDataSource.data.splice(index, 1);
                });
                this.referencesDataSource._updateChangeSubscription();
            }
            const indexes = this.indexesDataSource.data
                .filter(x => x.indexFields.findIndex(y => y.tableField.id === id || y.tableField.code === code) >= 0)
                .map(x => this.indexesDataSource.data.findIndex(y => y.name === x.name));
            if (UtilFunctions.isValidStringOrArray(indexes)) {
                indexes.forEach(index => {
                    this.indexesDataSource.data.splice(index, 1);
                });
                this.indexesDataSource._updateChangeSubscription();
            }
            let deleted = false;
            this.searchsDataSource.data.forEach(search => {
                if (UtilFunctions.isValidStringOrArray(search.searchFields) === true) {
                    for (let index = 0; index < search.searchFields.length;) {
                        if (search.searchFields[index].tableField &&
                            (search.searchFields[index].tableField.id === id || search.searchFields[index].tableField.code === code)) {
                            search.searchFields.splice(index, 1);
                            deleted = true;
                            continue;
                        }
                        index++;
                    }
                }
            });
            this._changeDetectorRef.detectChanges();
        }
    }

    announceSortChange(event: Sort) {

    }

    save() {
        this.model = Object.assign({}, this.model, this.formSave.value) as LuthierTableModel;
        this.saveCustomizations();
        console.log(this.model, this.formSave.value, this.model.customizations);
    }

    saveCustomizations() {
        const customizations: LuthierCustomizationModel[] = [];
        if (this.model.customDescription
            && UtilFunctions.isValidStringOrArray(this.model.customDescription.value) === true
            && this.model.customDescription.value !== this.model.description
        ) {
            this.model.customDescription.type = 'TABLE_DESCRIPTION';
            this.model.customDescription.name1 = this.model.name;
            customizations.push(this.model.customDescription);
        }

        this.model.fields.forEach(model => {
            if (model.customLabel
                && UtilFunctions.isValidStringOrArray(model.customLabel.value) === true
                && model.customLabel.value !== model.label
            ) {
                model.customLabel.type = 'FIELD_TABLE';
                model.customLabel.name1 = this.model.name;
                model.customLabel.name2 = model.name;
                customizations.push(model.customLabel);
            }
            if (model.customSize
                && UtilFunctions.isValidStringOrArray(model.customSize.value) === true
                && parseInt(model.customSize.value) !== parseInt(model.size + '')
            ) {
                model.customSize.type = 'TABLE_FIELD_SIZE';
                model.customSize.name1 = this.model.name;
                model.customSize.name2 = model.name;
                customizations.push(model.customSize);
            }
            if (model.customNotNull
                && UtilFunctions.isValidStringOrArray(model.customNotNull.value) === true
                && model.customNotNull.value !== model.notNull
            ) {
                model.customNotNull.type = 'TABLE_FIELD_REQUIRED';
                model.customNotNull.name1 = this.model.name;
                model.customNotNull.name2 = model.name;
                model.customNotNull.value = model.customNotNull.value ? '1' : '0';
                customizations.push(model.customNotNull);
            }
            if (model.customDefaultValue
                && UtilFunctions.isValidStringOrArray(model.customDefaultValue.value) === true
                && model.customDefaultValue.value !== model.defaultValue
            ) {
                model.customDefaultValue.type = 'TABLE_FIELD_DEFAULTVALUE';
                model.customDefaultValue.name1 = this.model.name;
                model.customDefaultValue.name2 = model.name;
                customizations.push(model.customDefaultValue);
            }
            if (model.customPrecision
                && UtilFunctions.isValidStringOrArray(model.customPrecision.value) === true
                && parseInt(model.customPrecision.value) !== parseInt(model.precision + '')
            ) {
                model.customPrecision.type = 'TABLE_FIELD_PRECISION';
                model.customPrecision.name1 = this.model.name;
                model.customPrecision.name2 = model.name;
                customizations.push(model.customPrecision);
            }
            if (model.customMaxValue
                && UtilFunctions.isValidStringOrArray(model.customMaxValue.value) === true
                && parseInt(model.customMaxValue.value) !== parseInt(model.maxValue + '')
            ) {
                model.customMaxValue.type = 'TABLE_FIELD_MAXVALUE';
                model.customMaxValue.name1 = this.model.name;
                model.customMaxValue.name2 = model.name;
                customizations.push(model.customMaxValue);
            }
            if (model.customMinValue
                && UtilFunctions.isValidStringOrArray(model.customMinValue.value) === true
                && parseInt(model.customMinValue.value) !== parseInt(model.minValue + '')
            ) {
                model.customMinValue.type = 'TABLE_FIELD_MINVALUE';
                model.customMinValue.name1 = this.model.name;
                model.customMinValue.name2 = model.name;
                customizations.push(model.customMinValue);
            }
            if (model.customMask
                && UtilFunctions.isValidStringOrArray(model.customMask.value) === true
                && model.customMask.value !== model.mask
            ) {
                model.customMask.type = 'TABLE_FIELD_MASK';
                model.customMask.name1 = this.model.name;
                model.customMask.name2 = model.name;
                customizations.push(model.customDefaultValue);
            }
            if (model.customCharCase
                && UtilFunctions.isValidStringOrArray(model.customCharCase.value) === true
                && model.customCharCase.value !== model.charCase
            ) {
                model.customCharCase.type = 'TABLE_FIELD_CHARCASE';
                model.customCharCase.name1 = this.model.name;
                model.customCharCase.name2 = model.name;
                model.customCharCase.value = LuthierFieldCharcaseEnumParser.fromValue(model.customCharCase.value);
                customizations.push(model.customCharCase);
            }
            if (model.customEditor
                && UtilFunctions.isValidStringOrArray(model.customEditor.value) === true
                && model.customEditor.value !== model.charCase
            ) {
                model.customEditor.type = 'TABLE_FIELD_EDITORTYPE';
                model.customEditor.name1 = this.model.name;
                model.customEditor.name2 = model.name;
                model.customEditor.value = LuthierFieldEditorEnumParser.fromValue(model.customEditor.value);
                customizations.push(model.customEditor);
            }
            if (model.customUiConfiguration
                && UtilFunctions.isValidStringOrArray(model.customUiConfiguration.value) === true
                && model.customUiConfiguration.value !== model.mask
            ) {
                model.customUiConfiguration.type = 'FIELD_UICONFIGURATION';
                model.customUiConfiguration.name1 = this.model.name;
                model.customUiConfiguration.name2 = model.name;
                customizations.push(model.customUiConfiguration);
            }
            model.staticFields.forEach(staticModel => {
                if (staticModel.customCaption
                    && UtilFunctions.isValidStringOrArray(staticModel.customCaption) === true
                    && staticModel.customCaption.value !== staticModel.caption
                ) {
                    staticModel.customCaption.type = 'STATIC_VALUE';
                    staticModel.customCaption.name1 = this.model.name;
                    staticModel.customCaption.name2 = model.name;
                    staticModel.customCaption.name3 = staticModel.value;
                    customizations.push(staticModel.customCaption);
                }
            });
        });

        this.model.searchs.forEach(model => {
            if (model.customName
                && UtilFunctions.isValidStringOrArray(model.customName.value) === true
                && model.customName.value !== model.name
            ) {
                model.customName.type = 'SEARCH_TABLE';
                model.customName.name1 = this.model.name;
                model.customName.name2 = model.name;
                customizations.push(model.customName);
            }
            model.searchFields.forEach(searchFieldModel => {
                if (searchFieldModel.customLabel
                    && UtilFunctions.isValidStringOrArray(searchFieldModel.customLabel) === true
                    && searchFieldModel.customLabel.value !== searchFieldModel.label
                ) {
                    const fieldIndex = this.model.fields.findIndex(x => x.id === searchFieldModel.tableField.id);
                    if (fieldIndex >= 0) {
                        searchFieldModel.customLabel.type = 'SEARCH_FIELD_TABLE';
                        searchFieldModel.customLabel.name1 = this.model.name;
                        searchFieldModel.customLabel.name2 = model.name;
                        searchFieldModel.customLabel.name3 = this.model.fields[fieldIndex].name;
                        customizations.push(searchFieldModel.customLabel);
                    }
                }
            });
        });

    }


    revert() {
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }

    getFields(type: TableType): FormArray {
        return this.formSave.get(type !== 'customFields' ? 'fields' : type) as FormArray;
    }
    getFieldGroup(id: string, type: TableType): FormGroup {
        const index =(this.formSave.get(type !== 'customFields' ? 'fields' : type) as FormArray).controls.findIndex(x => x.get("id").value === id);
        const fg = (this.formSave.get(type !== 'customFields' ? 'fields' : type) as FormArray).at(index) as FormGroup;
        return fg;
    }
    addFields(type: TableType) {
        let fields = this.getFields(type);
        if (!fields) {
            fields =  this.formBuilder.array([]);
            this.formSave.addControl(type, fields);
        }
        const modelFields = type === 'fields' ? this.model.fields : this.model.customFields;
        if (UtilFunctions.isValidStringOrArray(modelFields) === true) {
            modelFields.forEach(x => {
                x.id = crypto.randomUUID();
                /*
                if (UtilFunctions.isValidStringOrArray(this.model.customizations) === true) {
                    const index = this.model.customizations.findIndex(y =>
                        y.type === 'FIELD_TABLE' && y.name2 && y.name2.toUpperCase() === x.name.toUpperCase());
                    if (index >= 0) {
                        x['customLabel']= this.model.customizations[index].value;
                        return;
                    }
                }
                 */
                const c = this.addField(type);
                if (UtilFunctions.isValidStringOrArray(x.staticFields)) {
                    x.staticFields.forEach(y => {
                        (c.get('staticFields') as FormArray).push(this.addStaticField(type));
                    });
                }
                fields.push(c);
            })
        }
        if (this.model.objectType === 'VIEW') {
            const fa = (this.formSave.get('views') as FormArray);
            fa.clear();
            if (UtilFunctions.isValidStringOrArray(this.model.views) === true) {
                this.model.views.forEach(x => {
                    fa.push(this.addView());
                })
                const pipe = new EnumToArrayPipe();
                const keyPair = pipe.transform(LuthierViewBodyEnum);
                keyPair.forEach(x => {
                    const index = this.model.views.findIndex(y => y.databaseType === x.key);
                    if (index < 0) {
                        fa.push(this.addView(x.key));
                    }
                })
            }
        }
    }

    addField(type: TableType): FormGroup {
        const c = this.formBuilder.group({
                id: [crypto.randomUUID()],
                code: [null],
                name: [null, [Validators.required]],
                fieldType: [null, [Validators.required]],
                size: [0, [Validators.required]],
                key: [false, [Validators.required]],
                search: [false, [Validators.required]],
                label: [null, [Validators.required]],
                notNull: [false],
                defaultValue: [null],
                tableCode: [null],
                precision: [0, [Validators.required]],
                minValue: ["0"],
                maxValue: ["0"],
                mask: [null],
                charCase: [LuthierFieldCharcaseEnum.NORMAL],
                order: [
                    this.model.fields.reduce((max, field) => field.order > max ? field.order : max, this.model.fields[0].order) + 1,
                    [Validators.required]
                ],
                autoInc: [false],
                editor: [LuthierFieldEditorEnum.AUTO],
                modifyType: [LuthierFieldModifierEnum.INTERNO],
                attributeName: [null, [Validators.required]],
                technichalDescription: [null],
                userDescription: [null],
                layoutSize: [LuthierFieldLayoutEnum.NAO_DEFINIDO],
                uiConfiguration: [null],
                staticFields: this.formBuilder.array([])
            },
            {
                validators: LuthierFieldValidator.validate(this.getFields(type)),
            },
        );
        if (type === 'fields') {
            const allFields = this.formBuilder.group ({
                ...c.controls,
                groupInfo: this.addGroupInfoField(),
                customSize: this.addCustomizationField(),
                customLabel: this.addCustomizationField(),
                customNotNull: this.addCustomizationField(),
                customDefaultValue: this.addCustomizationField(),
                customPrecision: this.addCustomizationField(),
                customMinValue: this.addCustomizationField(),
                customMaxValue: this.addCustomizationField(),
                customMask: this.addCustomizationField(),
                customCharCase: this.addCustomizationField(),
                customEditor: this.addCustomizationField(),
                customUiConfiguration: this.addCustomizationField()
            });
            return allFields;
        }
        else {
            const allFields = this.formBuilder.group ({
                ...c.controls,
                groupInfo: [null]
            });
            return allFields;
        }

    }

    addCustomizationField(): any {
        const c = this.formBuilder.group({
            code: [null],
            type: [null],
            value: [null],
            name1: [null],
            name2: [null],
            name3: [null]
        });
        return c;
    }
    addGroupInfoField(): any {
        const c = this.formBuilder.group({
            id: [crypto.randomUUID()],
            code: [null],
            description: [null, [Validators.required]],
            groupInfoType: [null, [Validators.required]],
            order: [null, [Validators.required]],
            parent: this.formBuilder.group({
                id: [null],
                code: [null],
                description: [null]
            })
        });
        return c;
    }
    addStaticField(type: TableType): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            caption: ['', [Validators.required]],
            value: ['', [Validators.required]],
            permissionType: [LuthierPermissionTypeEnum.USER, [Validators.required]],
            permissionMessage: [''],

        });
        if (type === 'fields') {
            return this.formBuilder.group({
                ...c.controls,
                customCaption: this.addCustomizationField(),
                resource: this.formBuilder.group(
                    {
                        code: [null],
                        name: ['']
                    }
                )
            })
        }
        else {
            return this.formBuilder.group({
                ...c.controls,
                resource: [null]

            });
        }
    }

    addView(bodyType?: LuthierViewBodyEnum): FormGroup {
        const c = this.formBuilder.group({
            databaseType: [bodyType],
            body: ['']
        });
        return c;
    }

    getView(bodyType: LuthierViewBodyEnum | any): FormGroup {
        const fa = (this.formSave.get('views') as FormArray);
        const index = fa.controls.findIndex(x => x.get('databaseType').value === bodyType);
        if (index >= 0) {
            return fa.at(index) as FormGroup;
        }
        console.log('view is null', fa, bodyType);
        const c = this.addView(bodyType);
        fa.push(c);
        return c;
    }
    addIndex(): FormGroup {
        const c = this.formBuilder.group({
                code: [null],
                name: [null, [Validators.required]],
                sortType: [LuthierIndexSortEnum.ASC, [Validators.required]],
                unique: [false, [Validators.required]],
                creationOrder: [1, [Validators.required]],
                validationMessage: [null],
                indexFields: this.formBuilder.array([], [Validators.required])

            }
        );
        return c;
    }
    addIndexField(): FormGroup {
        const c = this.formBuilder.group({
            order: [null],
            tableField: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: [',', [Validators.required]]
                }, { validators: [Validators.required]}
            )
        });
        return c;
    }
    addReference(): FormGroup {
        const c = this.formBuilder.group({
                code: [null],
                name: [null, [Validators.required]],
                status: [LuthierReferenceStatusEnum.ACTIVE, [Validators.required]],
                onDelete: [LuthierReferenceActionEnum.NONE, [Validators.required]],
                onUpdate: [LuthierReferenceActionEnum.NONE, [Validators.required]],
                attributeName: [null],
                updateMessage: [null],
                deleteMessage: [null],
                lookupFastFieldCode: [null, [Validators.required]],
                lookupDescriptionFieldCode: [null, [Validators.required]],
                tablePK: this.formBuilder.group({
                    code: [null, [Validators.required]],
                    name: [null, [Validators.required]]
                }, { validators: [Validators.required]}),
                fieldsReference: this.formBuilder.array([], [Validators.required])

            }
        );
        return c;
    }
    addReferenceField(): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            status: [LuthierReferenceStatusEnum.ACTIVE],
            fieldPK: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: [null, [Validators.required]]
                }, { validators: [Validators.required]}
            ),
            fieldFK: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: [null, [Validators.required]]
                }, { validators: [Validators.required]}
            )
        });
        return c;
    }
    addSearch(): FormGroup {
        const c = this.formBuilder.group({
                code: [null],
                name: [null, [Validators.required]],
                customName: this.addCustomizationField(),
                status: [LuthierSearchStatusEnum.ACTIVE, [Validators.required]],
                type: [LuthierSearchTypeEnum.SIMPLE_MULTIPLE, [Validators.required]],
                order: [1, [Validators.required]],
                searchFields: this.formBuilder.array([], [Validators.required]),
                subsystems: this.formBuilder.array([], [Validators.required])
            }
        );
        return c;
    }
    addSearchField(): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            notNull: [null],
            label: [null, [Validators.required]],
            customLabel: this.addCustomizationField(),
            operator: [LuthierSearchFieldOperatorEnum.EQUAL, [Validators.required]],
            order: [null, [Validators.required]],
            editor: [LuthierSearchFieldEditorEnum.DEFAULT, [Validators.required]],
            tableField: this.formBuilder.group(
                {
                    id: [null],
                    code: [null],
                    name: ['', [Validators.required]],
                    fieldType: [],
                    size: []
                }, { validators: [Validators.required]}
            )
        });
        return c;
    }
    addSearchSubsystem(): FormGroup {
        const c = this.formBuilder.group({
            subsystem: this.formBuilder.group({
                code: [null, [Validators.required]],
                description: [null, [Validators.required]]
            })
        });
        return c;
    }
    editRow(index: number, type: TableType) {
        this.fieldRowEditing[type] = index.toString();
    }

    saveRow(id: string, index: number, type: TableType) {
        const fg = this.getFieldGroup(id, type);
        if (fg.invalid) {
            console.log(fg, fg.errors);
            this.messageService.open("Existem campo inválidos!", "Error de Validação", "warning");
            fg.updateValueAndValidity();
            this._changeDetectorRef.detectChanges();
            return;
        }
        if (type === 'fields') {
            this.fieldsDataSource.data[index] = fg.value;
            this.fieldsDataSource._updateChangeSubscription();
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'customizations') {
            this.customizationsDataSource.data[index] = fg.value;
            this.customizationsDataSource._updateChangeSubscription();
        }
        else {
            this.customFieldsDataSource.data[index] = fg.value;
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this.fieldRowEditing = null;
        this._changeDetectorRef.detectChanges();
    }

    onRowClick(index: number) {

    }

    compareCode(v1: any , v2: any): boolean {
        if (v1 && v2) {
            if (UtilFunctions.isValidStringOrArray(v1.code) === true) {
                return v1.code === v2.code || v1.code === v2;
            }
            else {
                return v1.id === v2.id || v1.id === v2;
            }
        }
        else {
            return v1 === v2;
        }
    }

    detailField(model: LuthierTableFieldModel, index: number, type: TableType) {
        this._parent.service.getImagesResources().then(resources => {
            const modal = this._matDialog.open(LuthierDictionaryTableFieldModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-field-modal-container' });
            modal.componentInstance.title = "Campo da Tabela " + this.model.name;
            modal.componentInstance.parent = this;
            modal.componentInstance.model = model;
            modal.componentInstance.resources = resources;
            modal.componentInstance.fieldType = type;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    const fg = this.getFieldGroup(model.id, type);
                    fg.controls = modal.componentInstance.formSave.controls;
                    fg.updateValueAndValidity();
                    this.saveRow(model.id, index, type);
                }
                this._changeDetectorRef.detectChanges();
            });
        })

    }
    newIndex() {
        this.editIndex(new LuthierTableIndexModel(), -1);
    }
    deleteIndex(index: number) {
        this.indexesDataSource.data.splice(index, 1);
        this.indexesDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editIndex(model: LuthierTableIndexModel, index: number) {
        const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
        const modal = this._matDialog.open(LuthierDictionaryTableIndexModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-index-modal-container' });
        modal.componentInstance.title = "Index da Tabela " + this.model.name;
        modal.componentInstance.parent = this;
        modal.componentInstance.indexModel = model;
        modal.componentInstance.fields = fields;
        modal.componentInstance.index = index;
        modal.afterClosed().subscribe((result) =>
        {
            if ( result === 'ok' ) {
                if (index >= 0) {
                    this.indexesDataSource.data[index] = modal.componentInstance.formSave.value;
                }
                else {
                    this.indexesDataSource.data.push(modal.componentInstance.formSave.value);
                }
                this.indexesDataSource._updateChangeSubscription();
                this._changeDetectorRef.detectChanges();
            }

        });

    }
    newReference() {
        this.editReference(new LuthierTableReferenceModel(), -1);
    }
    deleteReference(index: number) {
        this.referencesDataSource.data.splice(index, 1);
        this.referencesDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editReference(model: LuthierTableReferenceModel, index: number) {
        if (index >= 0 && model.tablePK && model.tablePK.code >= 0) {
            this.service.getTable(model.tablePK.code)
                .then(table => {
                    this.openModalReference(model, index, table.fields);
                })
        }
        else {
            this.openModalReference(model, index, []);
        }
    }
    openModalReference(model: LuthierTableReferenceModel, index: number, fielsPK: LuthierTableFieldModel[]) {
        const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
        const modal = this._matDialog.open(LuthierDictionaryTableReferenceModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-reference-modal-container' });
        modal.componentInstance.title = "Referência da Tabela " + this.model.name;
        modal.componentInstance.parent = this;
        modal.componentInstance.referenceModel = model;
        modal.componentInstance.fields = fields;
        modal.componentInstance.fieldsPK = fielsPK;
        modal.componentInstance.index = index;
        modal.componentInstance.tables = cloneDeep(this._parent.tables);
        modal.afterClosed().subscribe((result) =>
        {
            if ( result === 'ok' ) {
                if (index >= 0) {
                    this.referencesDataSource.data[index] = modal.componentInstance.formSave.value;
                }
                else {
                    this.referencesDataSource.data.push(modal.componentInstance.formSave.value);
                }
                this.referencesDataSource._updateChangeSubscription();
                this._changeDetectorRef.detectChanges();
            }

        });
    }
    newSearch() {
        this.editIndex(new LuthierTableSearchModel(), -1);
    }
    deleteSearch(index: number) {
        this.searchsDataSource.data.splice(index, 1);
        this.searchsDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editSearch(model: LuthierTableSearchModel, index: number) {
        this._parent.service.getActiveSubsystems().then(subsystems => {
            const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
            const modal = this._matDialog.open(LuthierDictionaryTableSearchModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-search-modal-container' });
            modal.componentInstance.title = "Pesquisa da Tabela " + this.model.name;
            modal.componentInstance.parent = this;
            modal.componentInstance.searchModel = model;
            modal.componentInstance.fields = fields;
            modal.componentInstance.subsystems = subsystems;
            modal.componentInstance.index = index;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    if (index >= 0) {
                        this.searchsDataSource.data[index] = modal.componentInstance.formSave.value;
                    }
                    else {
                        this.searchsDataSource.data.push(modal.componentInstance.formSave.value);
                    }
                    this.searchsDataSource._updateChangeSubscription();
                    this._changeDetectorRef.detectChanges();
                }

            });
        });
    }

    newGroupInfo() {
        this.editIndex(new LuthierGroupInfoModel(), -1);
    }
    deleteGroupInfo(index: number) {
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  (x.parent.id === groupInfo.id || x.parent.code === groupInfo.code))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => y.id === x.id));
        console.log('groupInfoWithGroupInfo', groupInfoWithGroupInfo, groupInfo);
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent = null;
            });
        }
        this.groupsInfoDataSource.data.splice(index, 1);
        this.groupsInfoDataSource._updateChangeSubscription();

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  (x.groupInfo.id === groupInfo.id || x.groupInfo.code === groupInfo.code))
            .map(x => this.fieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.fieldsDataSource.data[x].id, 'fields').get('groupInfo').patchValue(new LuthierGroupInfoModel());
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => y.id === x.id));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.customFieldsDataSource.data[x].id, 'fields').get('groupInfo').setValue(null);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this._changeDetectorRef.detectChanges();
    }
    editGroupInfo(model: LuthierGroupInfoModel, index: number) {
        this._parent.service.getActiveSubsystems().then(subsystems => {
            const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
            const modal = this._matDialog.open(LuthierDictionaryTableSearchModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-search-modal-container' });
            modal.componentInstance.title = "Pesquisa da Tabela " + this.model.name;
            modal.componentInstance.parent = this;
            modal.componentInstance.searchModel = model;
            modal.componentInstance.fields = fields;
            modal.componentInstance.subsystems = subsystems;
            modal.componentInstance.index = index;
            modal.afterClosed().subscribe((result) =>
            {
                if ( result === 'ok' ) {
                    if (index >= 0) {
                        this.searchsDataSource.data[index] = modal.componentInstance.formSave.value;
                    }
                    else {
                        this.searchsDataSource.data.push(modal.componentInstance.formSave.value);
                    }
                    this.searchsDataSource._updateChangeSubscription();
                    this._changeDetectorRef.detectChanges();
                }

            });
        });
    }

    filterFields(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.fieldsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterIndexes(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.indexesDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterReferences(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.referencesDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterSearchs(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.searchsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterCustomFields(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.customFieldsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterCustomizations(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.customizationsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterGroupsInfo(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.groupsInfoDataSource.filter = filterValue.trim().toLowerCase();
    }

    checkIndeterminate(event: MatCheckboxChange, c: FormControl) {
        if (!event.source.indeterminate) {
            if (UtilFunctions.parseBoolean(c.value) === false) {
                c.setValue(null);
            }
            else {
                c.setValue(true);
            }
        }
        else {
            c.setValue(false);
        }
        this._changeDetectorRef.detectChanges();

    }

    changeTab(event: MatTabChangeEvent) {
        this.currentTab = event.tab.ariaLabel as TableType;
    }
}