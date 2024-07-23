import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
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
    LuthierBasicModel,
    LuthierCustomFieldModel,
    LuthierCustomizationModel,
    LuthierFieldCharcaseEnum,
    LuthierFieldCharcaseEnumParser,
    LuthierFieldEditorEnum,
    LuthierFieldEditorEnumParser,
    LuthierFieldLayoutEnum,
    LuthierFieldModifierEnum,
    LuthierFieldTypeEnum,
    LuthierGroupInfoModel,
    LuthierGroupInfoTypeEnum,
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
    LuthierViewBodyEnum,
    LuthierViewModel
} from '../../../../../shared/models/luthier.model';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../shared/util/util-functions';
import {cloneDeep} from 'lodash-es';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
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
import {DatabaseTypeEnum} from '../../../../../shared/models/portal-luthier-database.model';
import {debounceTime, takeUntil} from 'rxjs';
import {MatMenuModule} from '@angular/material/menu';

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
        NgTemplateOutlet,
        MatMenuModule
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
    currentTab: TableType = 'fields';
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
    get dadosDatabaseType(): DatabaseTypeEnum | string {
        return this._parent.currentDataBase?.dbType;
    }
    get dadosViewBodyType(): LuthierViewBodyEnum | string {
        if (this.dadosDatabaseType === 'MSSQL') {
            return LuthierViewBodyEnum.SQLSERVER;
        }
        else {
            return this.dadosDatabaseType;
        }
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
    LuthierGroupInfoTypeEnum = LuthierGroupInfoTypeEnum
    // @ts-ignore
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (event.code === 'F8' || event.code === 'Escape') {
            const row = this.getRowEditing(this.currentTab);
            if (row) {
                event.preventDefault();
                const fg = this.getFieldGroup(row, this.currentTab);
                fg.patchValue(row);
                row['editing'] = false;
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
        this._parent.parent.workDataBase$
            .pipe(takeUntil(this._parent.parent.unsubscribeAll), debounceTime(100))
            .subscribe((workDataBase: number) =>
            {
                this._changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {
        this.fieldsDataSource.sort = this.sortFields.get(0);
        this.indexesDataSource.sort = this.sortIndexes;
        this.referencesDataSource.sort = this.sortReferences;
        this.searchsDataSource.sort = this.sortSearchs;
        this.groupsInfoDataSource.sort = this.sortFields.get(1);
        this.customFieldsDataSource.sort = this.sortFields.get(2);
        this.customizationsDataSource.sort = this.sortFields.get(3);

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
            groupInfos: this.formBuilder.array([]),
            views: this.formBuilder.array([])
        });
        this.addFields('fields');
        this.addFields('customFields');
        this.addGroupInfos();
        this.addViews();
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
        if (type === 'groupInfos') {
            this.newGroupInfo();
        }
        else {
            const fg = this.addField(type);
            this.getFields(type).push(fg);
            const newField = fg.value;
            newField['pending'] = true;
            if (type === 'fields') {
                this.fieldsDataSource.data.push(newField);
                this.fieldsDataSource._updateChangeSubscription();
            } else {
                this.customFieldsDataSource.data.push(newField);
                this.customFieldsDataSource._updateChangeSubscription();
            }
            this._changeDetectorRef.detectChanges();
        }
    }

    delete(model: LuthierBasicModel, index: number,type: TableType) {
        index = this.getRealIndex(index, type).index;
        const fieldIndex = this.getFields(type).controls.findIndex(x => this.compareCode(x.value, model));
        this.getFields(type).removeAt(fieldIndex);
        if (type === 'groupInfos') {
            this.deleteGroupInfo(model, index);
        }
        else {
            const dataSource = type === 'fields' ? this.fieldsDataSource : this.customFieldsDataSource;
            const data = dataSource.data[index].code;
            dataSource.data.splice(index, 1);
            dataSource._updateChangeSubscription();
            if (type === 'fields') {
                this.customizationsDataSource._updateChangeSubscription();
                const references = this.referencesDataSource.data
                    .filter(x => x.fieldsReference.findIndex(y => this.compareCode(y.fieldFK, data) || this.compareCode(y.fieldPK, data)) >= 0)
                    .map(x => this.referencesDataSource.data.findIndex(y => y.name === x.name));
                if (UtilFunctions.isValidStringOrArray(references)) {
                    references.forEach(index => {
                        this.referencesDataSource.data.splice(index, 1);
                    });
                    this.referencesDataSource._updateChangeSubscription();
                }
                const indexes = this.indexesDataSource.data
                    .filter(x => x.indexFields.findIndex(y => this.compareCode(y.tableField, data)) >= 0)
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
                                this.compareCode(search.searchFields[index].tableField, data)) {
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
    }

    announceSortChange(event: Sort) {

    }

    save() {
        this.model = Object.assign({}, this.model, this.formSave.value) as LuthierTableModel;
        this.saveCustomizations();
        this.service.saveTable(this.model)
            .then(result => {
                result.id = this.model.id;
                this.model = result;
                this.refresh();
                const index = this._parent.tabsOpened.findIndex(x => x.id === this.model.id);
                this._parent.tabsOpened.splice(index, 1, this.model);
                this._parent.selectedTab = this.model;
                this._changeDetectorRef.detectChanges();
                this.messageService.open(`${this.model.objectType === 'TABLE' ? 'Tabela' : 'View'} salva com sucesso`, 'SUCESSO', 'success')
            })
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
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
                customizations.push(model.customMask);
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
                    const fieldIndex = this.model.fields.findIndex(x => this.compareCode(x, searchFieldModel.tableField));
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
        return this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray;
    }
    getFieldGroup(model: LuthierBasicModel, type: TableType): FormGroup {
        const index =(this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray).controls.findIndex(x => this.compareCode(x.value, model));
        const fg = (this.formSave.get(type === 'customizations' ? 'fields' : type) as FormArray).at(index) as FormGroup;
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
                if (UtilFunctions.isValidStringOrArray(x.id) === false) {
                    x.id = crypto.randomUUID();
                }
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
    }
    addViews() {
        if (this.model.objectType === 'VIEW') {
            const fa = (this.formSave.get('views') as FormArray);
            fa.clear();
            if (UtilFunctions.isValidStringOrArray(this.model.views) === true) {
                this.model.views.forEach(x => {
                    fa.push(this.addViewField());
                })
                const pipe = new EnumToArrayPipe();
                const keyPair = pipe.transform(LuthierViewBodyEnum);
                keyPair.forEach(x => {
                    const index = this.model.views.findIndex(y => y.databaseType === x.key);
                    if (index < 0) {
                        fa.push(this.addViewField(x.key));
                    }
                })
            }
        }
    }
    addGroupInfos() {
        const fa = (this.formSave.get('groupInfos') as FormArray);
        fa.clear();
        if (UtilFunctions.isValidStringOrArray(this.model.groupInfos) === true) {
            this.model.groupInfos.forEach(x => {
                x.id = crypto.randomUUID();
                fa.push(this.addGroupInfoField())
            })
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
                technicalDescription: [null],
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
                groupInfo: [null],
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
            parent: [null]
        });
        return c;
    }
    addStaticField(type: TableType): FormGroup {
        const c = this.formBuilder.group({
            code: [null],
            caption: [null, [Validators.required]],
            value: [null, [Validators.required]],
            permissionType: [LuthierPermissionTypeEnum.USER, [Validators.required]],
            permissionMessage: [null],

        });
        if (type === 'fields') {
            return this.formBuilder.group({
                ...c.controls,
                customCaption: this.addCustomizationField(),
                resource: [null]
            })
        }
        else {
            return this.formBuilder.group({
                ...c.controls,
                resource: [null]

            });
        }
    }

    addViewField(bodyType?: LuthierViewBodyEnum): FormGroup {
        const c = this.formBuilder.group({
            databaseType: [bodyType],
            body: [null]
        });
        return c;
    }

    getView(bodyType: LuthierViewBodyEnum | any): FormGroup {
        const fa = (this.formSave.get('views') as FormArray);
        const index = fa.controls.findIndex(x => x.get('databaseType').value === bodyType);
        if (index >= 0) {
            return fa.at(index) as FormGroup;
        }
        const c = this.addViewField(bodyType);
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
                    name: ['', [Validators.required]]
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
                lookupFastField: [null, Validators.required],
                lookupDescriptionField: [null, Validators.required],
                tablePK: [null, Validators.required],
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
    getRealIndex(index: number, type: TableType): {index: number, dataSource: MatTableDataSource<any>} {
        const dataSource = this.getDatasourceFromType(type);
        if (index < 0) {
            return {index: index, dataSource: dataSource};
        }
        return {index: dataSource.data.indexOf(dataSource.filteredData[index]), dataSource: dataSource};
    }

    getDatasourceFromType(type: TableType): MatTableDataSource<any> {

        if (type === 'fields') {
            return this.fieldsDataSource;
        }
        else if (type === 'customFields') {
            return this.customFieldsDataSource;
        }
        else if (type === 'customizations') {
            return this.customizationsDataSource;
        }
        else if (type === 'groupInfos') {
            return this.groupsInfoDataSource;
        }
        else if (type === 'references') {
            return this.referencesDataSource;
        }
        else if (type === 'indexes') {
            return this.indexesDataSource;
        }
        else if (type === 'searchs') {
            return this.searchsDataSource;
        }
    }

    getRowEditing(type: TableType): any {
        const dataSource = this.getDatasourceFromType(type);
        const index = dataSource.data.findIndex(x => x['editing'] === true);
        if (index >= 0) {
            return dataSource.data[index];
        }
        return null;
    }
    editRow(index: number, type: TableType) {
        const editing = this.getRealIndex(index, type);
        editing.dataSource.data[editing.index]['editing'] = true;
    }

    saveRow(model: LuthierBasicModel, index: number, type: TableType) {
        const editing = this.getRealIndex(index, type);
        index = editing.index;
        const fg = this.getFieldGroup(model, type);
        if (fg.invalid) {
            console.log(fg, fg.errors);
            this.messageService.open("Existem campo inválidos!", "Error de Validação", "warning");
            fg.updateValueAndValidity();
            this._changeDetectorRef.detectChanges();
            return;
        }
        if (type === 'fields') {
            this.fieldsDataSource.data[index] = Object.assign({}, this.fieldsDataSource.data[index], fg.value);
            this.fieldsDataSource._updateChangeSubscription();
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'customizations') {
            this.customizationsDataSource.data[index] = Object.assign({}, this.customizationsDataSource.data[index], fg.value);
            this.customizationsDataSource._updateChangeSubscription();
        }
        else if (type === 'groupInfos') {
            this.editGroupInfo(model, index, fg.value as LuthierGroupInfoModel);
        }
        else {
            this.customFieldsDataSource.data[index] = Object.assign({}, this.customFieldsDataSource.data[index], fg.value);
            this.customFieldsDataSource._updateChangeSubscription();
        }
        editing.dataSource[editing.index]['editing'] = false;
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
        index = this.getRealIndex(index, type).index;
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
                    const fg = this.getFieldGroup(model, type);
                    fg.controls = modal.componentInstance.formSave.controls;
                    fg.updateValueAndValidity();
                    this.saveRow(model, index, type);
                }
                this._changeDetectorRef.detectChanges();
            });
        })

    }
    newIndex() {
        this.editIndex(new LuthierTableIndexModel(), -1);
    }
    deleteIndex(index: number) {
        index = this.getRealIndex(index, 'indexes').index;
        this.indexesDataSource.data.splice(index, 1);
        this.indexesDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editIndex(model: LuthierTableIndexModel, index: number) {
        index = this.getRealIndex(index, 'indexes').index;
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
        index = this.getRealIndex(index, 'references').index;
        this.referencesDataSource.data.splice(index, 1);
        this.referencesDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editReference(model: LuthierTableReferenceModel, index: number) {
        index = this.getRealIndex(index, 'references').index;
        if (index >= 0 && model.tablePK && model.tablePK.code >= 0) {
            this.service.getTable(model.tablePK.code)
                .then(table => {
                    this.openModalReference(model, index, table.fields);
                })
        }
        else {
            if (model.tablePK && this.compareCode(model.tablePK, this.model)) {
                this.openModalReference(model, index, this.model.fields);
            }
            else {
                this.openModalReference(model, index, []);
            }

        }
    }
    openModalReference(model: LuthierTableReferenceModel, index: number, fieldsPK: LuthierTableFieldModel[]) {
        const fields = this.model.fields.filter(x => UtilFunctions.isValidStringOrArray(x['pending']) === false || x['pending']=== false);
        const modal = this._matDialog.open(LuthierDictionaryTableReferenceModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-table-reference-modal-container' });
        modal.componentInstance.title = "Referência da Tabela " + this.model.name;
        modal.componentInstance.parent = this;
        modal.componentInstance.referenceModel = model;
        modal.componentInstance.fields = fields;
        modal.componentInstance.index = index;
        modal.componentInstance.tables = cloneDeep(this._parent.tables);
        if (UtilFunctions.isValidStringOrArray(this.model.code) === false) {
            modal.componentInstance.tables.unshift(this.model);
        }
        modal.componentInstance.fieldsPK = fieldsPK;
        console.log('openModalReference', fieldsPK, modal.componentInstance.tables, model);
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
        index = this.getRealIndex(index, 'searchs').index;
        this.searchsDataSource.data.splice(index, 1);
        this.searchsDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    editSearch(model: LuthierTableSearchModel, index: number) {
        index = this.getRealIndex(index, 'searchs').index;
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
        const fg = this.addGroupInfoField();
        this.getFields('groupInfos').push(fg);
        const newField = fg.value as LuthierGroupInfoModel;
        newField['pending'] = true;
        this.groupsInfoDataSource.data.push(newField);
        this.groupsInfoDataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }
    deleteGroupInfo(model: LuthierBasicModel, index: number) {
        index = this.getRealIndex(index, 'groupInfos').index;
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent &&  this.compareCode(x.parent, groupInfo))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => this.compareCode(x, y)));
        console.log('groupInfoWithGroupInfo', groupInfoWithGroupInfo, groupInfo);
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent = null;
            });
        }
        this.groupsInfoDataSource.data.splice(index, 1);
        this.groupsInfoDataSource._updateChangeSubscription();

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  this.compareCode(x.groupInfo, groupInfo))
            .map(x => this.fieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.fieldsDataSource.data[x], 'fields').get('groupInfo').patchValue(new LuthierGroupInfoModel());
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = null;
                this.getFieldGroup(this.customFieldsDataSource.data[x], 'customFields').get('groupInfo').setValue(null);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this._changeDetectorRef.detectChanges();
    }
    editGroupInfo(model: LuthierBasicModel, index: number, value: LuthierGroupInfoModel) {
        index = this.getRealIndex(index, 'groupInfos').index;
        const groupInfo =  this.groupsInfoDataSource.data[index];
        const groupInfoWithGroupInfo = this.groupsInfoDataSource.data
            .filter(x => x.parent && this.compareCode(x.parent, groupInfo))
            .map(x => this.groupsInfoDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(groupInfoWithGroupInfo)) {
            groupInfoWithGroupInfo.forEach(x => {
                this.groupsInfoDataSource.data[x].parent.description = value.description;
            });
        }

        const fieldsWithGroupInfo = this.fieldsDataSource.data
            .filter(x => x.groupInfo &&  this.compareCode(x.groupInfo, groupInfo))
            .map(x => this.fieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(fieldsWithGroupInfo)) {
            fieldsWithGroupInfo.forEach(x => {
                this.fieldsDataSource.data[x].groupInfo.description = value.description;
            });
            this.fieldsDataSource._updateChangeSubscription();
        }
        const customFieldsWithGroupInfo = this.customFieldsDataSource.data
            .filter(x => x.groupInfo === groupInfo.description)
            .map(x => this.customFieldsDataSource.data.findIndex(y => this.compareCode(x, y)));
        if (UtilFunctions.isValidStringOrArray(customFieldsWithGroupInfo)) {
            customFieldsWithGroupInfo.forEach(x => {
                this.customFieldsDataSource.data[x].groupInfo = value.description;
                this.getFieldGroup(this.customFieldsDataSource.data[x], 'customFields').get('groupInfo').setValue(value.description);
            });
            this.customFieldsDataSource._updateChangeSubscription();
        }
        this.groupsInfoDataSource.data[index] = Object.assign({}, this.groupsInfoDataSource.data[index], value);
        this.groupsInfoDataSource._updateChangeSubscription();
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

    isGroupInfoAllowed(field: LuthierGroupInfoModel, option: LuthierGroupInfoModel): boolean {
        if (this.compareCode(field, option) === true) {
            return false;
        }
        if (!option.parent) {
            return true;
        }
        return !this.compareCode(option.parent, field);

    }

    parseView(bodyType: LuthierViewBodyEnum) {
        const fg = this.getView(bodyType);
        const model = fg.value as LuthierViewModel;
        if (model && UtilFunctions.isValidStringOrArray(model.body) === true) {
            this.service.parseView(this.model.name, model)
                .then(table => {
                    console.log(table);
                    if (UtilFunctions.isValidStringOrArray(table.fields) === true) {
                        table.fields.forEach(x => {
                            const index = this.fieldsDataSource.data.findIndex(y => y.name.toUpperCase() === x.name.toUpperCase());
                            if (index < 0) {
                                UtilFunctions.nullCodeAndSetID(x, ['staticFields[?].resource.code']);
                                const fg = this.addField('fields');
                                if (UtilFunctions.isValidStringOrArray(x.staticFields)) {
                                    x.staticFields.forEach(y => {
                                        (fg.get('staticFields') as FormArray).push(this.addStaticField('fields'));
                                    });
                                }
                                this.getFields('fields').push(fg);
                                fg.patchValue(x);
                                const newField = fg.value;
                                newField['pending'] = true;
                                this.fieldsDataSource.data.push(newField);
                                this.fieldsDataSource._updateChangeSubscription();
                            }
                        });
                    }
                    if (UtilFunctions.isValidStringOrArray(table.customFields) === true) {
                        table.customFields.forEach(x => {
                            const index = this.customFieldsDataSource.data.findIndex(y => y.name.toUpperCase() === x.name.toUpperCase());
                            if (index < 0) {
                                UtilFunctions.nullCodeAndSetID(x);
                                const fg = this.addField('customFields');
                                if (UtilFunctions.isValidStringOrArray(x.staticFields)) {
                                    x.staticFields.forEach(y => {
                                        (fg.get('staticFields') as FormArray).push(this.addStaticField('customFields'));
                                    });
                                }
                                this.getFields('customFields').push(fg);
                                fg.patchValue(x);
                                const newField = fg.value;
                                newField['pending'] = true;
                                this.customFieldsDataSource.data.push(newField);
                                this.customFieldsDataSource._updateChangeSubscription();
                            }
                        });
                    }
                })
        }
    }

    async readTableFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const model = JSON.parse(text) as LuthierTableModel;
            setTimeout(() => {
                this.importTable(model);
            })
        } catch (error) {
            this.messageService.open('Erro ao ler conteúdo do clipboard '+ error, 'ERRO', 'error');
            console.error('Failed to read clipboard contents: ', error);
        }
    }

    readTableFromFile(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            // You can further process the selected file here
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                const model = JSON.parse(text) as LuthierTableModel;
                setTimeout(() => {
                    this.importTable(model);
                });

            };
            reader.onerror = (error) => {
                this.messageService.open('Erro ao ler arquivo '+ error, 'ERRO', 'error');
            };
            reader.readAsText(file);
        }
    }

    importTable(model: LuthierTableModel) {
        if (model) {
            this.service.getActiveSubsystems()
                .then(subsystems => {
                    try {
                        if (UtilFunctions.isValidStringOrArray(model.code) === false) {
                            this.messageService.open('Erro ao ler tabela', 'ERRO', 'error');
                            return;
                        }
                        if (model.objectType != this.model.objectType) {
                            this.messageService.open('Erro ao ler tabela', 'ERRO', 'error');
                            return;
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.code) === false) {
                            this.model.name = model.name;
                        }
                        const importedCode = model.code;
                        model.name = this.model.name;
                        model.code = this.model.code;
                        model.id = this.model.id;
                        model.bonds = this.model.bonds;

                        //groupInfos
                        if (UtilFunctions.isValidStringOrArray(model.groupInfos) === false) {
                            model.groupInfos = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.groupInfos) === false) {
                            this.model.groupInfos = [];
                        }

                        for(let i = 0; i < this.model.groupInfos.length; i++) {
                            let groupInfo = this.model.groupInfos[i];
                            let index = model.groupInfos.findIndex(x => x.description.toUpperCase() === groupInfo.description.toUpperCase());
                            if (index >= 0) {
                                model.groupInfos[index].code = groupInfo.code;
                                model.groupInfos[index].id = groupInfo.id;

                                const [item] = model.groupInfos.splice(index, 1);
                                model.groupInfos.splice(i, 0, item);
                            }
                            else {
                                model.groupInfos.splice(i, 0, groupInfo);
                            }
                        }
                        for(let i = this.model.groupInfos.length; i < model.groupInfos.length; i++) {
                            let groupInfo = model.groupInfos[i];
                            groupInfo.code = null;
                            groupInfo.id = crypto.randomUUID();
                        }
                        for (let i = 0; i < model.groupInfos.length; i++) {
                            let groupInfo = model.groupInfos[i];
                            if (groupInfo.parent) {
                                const index = model.groupInfos.findIndex(x => x.description === groupInfo.parent.description);
                                groupInfo.parent = model.groupInfos[index];
                            }
                        }
                        //end groupInfos

                        // field
                        if (UtilFunctions.isValidStringOrArray(model.fields) === false) {
                            model.fields = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.fields) === false) {
                            this.model.fields = [];
                        }
                        for(let i = 0; i < this.model.fields.length; i++) {
                            let field = this.model.fields[i];
                            let index = model.fields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                            if (index >= 0) {
                                model.fields[index].code = field.code;
                                model.fields[index].id = field.id;
                                if (UtilFunctions.isValidStringOrArray(field.staticFields) === false) {
                                    field.staticFields = [];
                                }
                                if (UtilFunctions.isValidStringOrArray(model.fields[index].staticFields) === false) {
                                    model.fields[index].staticFields = [];
                                }
                                for (let j = 0; j < field.staticFields.length; j++) {
                                    let staticField = field.staticFields[j];
                                    const staticFieldIndex = model.fields[index].staticFields.findIndex(x => x.value.toUpperCase() === staticField.value.toUpperCase());
                                    if (staticFieldIndex >= 0) {
                                        model.fields[index].staticFields[staticFieldIndex].code = staticField.code;
                                        model.fields[index].staticFields[staticFieldIndex].id = staticField.id;
                                        const [itemStatic] = model.fields[index].staticFields.splice(staticFieldIndex, 1);
                                        model.fields[index].staticFields.splice(j, 0, itemStatic);
                                    }
                                    else {
                                        model.fields[index].staticFields.splice(j, 0, staticField);
                                    }
                                }
                                for (let j = field.staticFields.length; j < model.fields[index].staticFields.length; j++) {
                                    let staticField = model.fields[index].staticFields[j];
                                    staticField.code = null;
                                    staticField.id = crypto.randomUUID();
                                }

                                const [item] = model.fields.splice(index, 1);
                                model.fields.splice(i, 0, item);
                            }
                            else {
                                model.fields.splice(i, 0, field);
                            }
                        }
                        for(let i = this.model.fields.length; i < model.fields.length; i++) {
                            let field = model.fields[i];
                            field.code = null;
                            field.id = crypto.randomUUID();
                            field.staticFields.forEach(x => {
                                x.code = null;
                                x.id = crypto.randomUUID();
                            });
                        }
                        for(let i = 0; i < model.fields.length; i++) {
                            let field = model.fields[i];
                            if (field.groupInfo && UtilFunctions.isValidStringOrArray(field.groupInfo.description) === true) {
                                const index = model.groupInfos.findIndex(x => x.description === field.groupInfo.description);
                                field.groupInfo = model.groupInfos[index];
                            }
                            else {
                                field.groupInfo = null;
                            }
                        }
                        // end fields

                        // customFields
                        if (UtilFunctions.isValidStringOrArray(model.customFields) === false) {
                            model.customFields = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.customFields) === false) {
                            this.model.customFields = [];
                        }
                        for(let i = 0; i < this.model.customFields.length; i++) {
                            let field = this.model.customFields[i];
                            let index = model.customFields.findIndex(x => x.name.toUpperCase() === field.name.toUpperCase());
                            if (index >= 0) {
                                model.customFields[index].code = field.code;
                                model.customFields[index].id = field.id;
                                if (UtilFunctions.isValidStringOrArray(field.staticFields) === false) {
                                    field.staticFields = [];
                                }
                                if (UtilFunctions.isValidStringOrArray(model.customFields[index].staticFields) === false) {
                                    model.customFields[index].staticFields = [];
                                }
                                for (let j = 0; j < field.staticFields.length; j++) {
                                    let staticField = field.staticFields[j];
                                    const staticFieldIndex = model.customFields[index].staticFields.findIndex(x => x.value.toUpperCase() === staticField.value.toUpperCase());
                                    if (staticFieldIndex >= 0) {
                                        model.customFields[index].staticFields[staticFieldIndex].code = staticField.code;
                                        model.customFields[index].staticFields[staticFieldIndex].id = staticField.id;
                                        const [itemStatic] = model.customFields[index].staticFields.splice(staticFieldIndex, 1);
                                        model.customFields[index].staticFields.splice(j, 0, itemStatic);
                                    }
                                    else {
                                        model.customFields[index].staticFields.splice(j, 0, staticField);
                                    }
                                }
                                for (let j = field.staticFields.length; j < model.fields[index].staticFields.length; j++) {
                                    let staticField = model.customFields[index].staticFields[j];
                                    staticField.code = null;
                                    staticField.id = crypto.randomUUID();
                                }

                                const [item] = model.customFields.splice(index, 1);
                                model.customFields.splice(i, 0, item);
                            }
                            else {
                                model.customFields.splice(i, 0, field);
                            }
                        }
                        for(let i = this.model.customFields.length; i < model.customFields.length; i++) {
                            let field = model.customFields[i];
                            field.code = null;
                            field.id = crypto.randomUUID();
                            field.staticFields.forEach(x => {
                                x.code = null;
                                x.id = crypto.randomUUID();
                            });
                        }
                        for(let i = 0; i < model.customFields.length; i++) {
                            let field = model.customFields[i];
                            if (field.groupInfo && UtilFunctions.isValidStringOrArray(field.groupInfo) === true) {
                                const index = model.groupInfos.findIndex(x => x.description === field.groupInfo);
                                field.groupInfo = model.groupInfos[index].description;
                            }
                            else {
                                field.groupInfo = null;
                            }
                        }
                        // end customFields

                        //references
                        if (UtilFunctions.isValidStringOrArray(model.references) === false) {
                            model.references = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.references) === false) {
                            this.model.references = [];
                        }

                        for(let i = 0; i < this.model.references.length; i++) {
                            let reference = this.model.references[i];
                            let index = model.references.findIndex(x => x.name.toUpperCase() === reference.name.toUpperCase());
                            if (index >= 0) {
                                model.references[index].code = reference.code;
                                model.references[index].id = reference.id;
                                const [item] = model.references.splice(index, 1);
                                model.references.splice(i, 0, item);
                            }
                            else {
                                model.references.splice(i, 0, reference);
                            }
                        }
                        for(let i = this.model.references.length; i < model.references.length; i++) {
                            let reference = model.references[i];
                            reference.code = null;
                            reference.id = crypto.randomUUID();
                            for (let j = 0; j < reference.fieldsReference.length; j++) {
                                let referenceField = reference.fieldsReference[j];
                                referenceField.code = null;
                                referenceField.id = crypto.randomUUID();
                            }
                        }
                        for(let i = 0; i < model.references.length;) {
                            let reference = model.references[i];
                            if (reference.tablePK.code === importedCode) {
                                reference.tablePK = {id: model.id, code: model.code, name: model.name};
                                reference.fieldsReference.forEach(referenceField => {
                                    const indexField = model.fields.findIndex(x => x.name.toUpperCase() === referenceField.fieldPK.name.toUpperCase());
                                    referenceField.fieldPK = model.fields[indexField];
                                });
                                {
                                    const indexField = model.fields.findIndex(x => x.name.toUpperCase() === reference.lookupFastField.name.toUpperCase());
                                    reference.lookupFastField = model.fields[indexField];
                                }
                                {
                                    const indexField = model.fields.findIndex(x => x.name.toUpperCase() === reference.lookupDescriptionField.name.toUpperCase());
                                    reference.lookupDescriptionField = model.fields[indexField];
                                }

                            }
                            else if (this._parent.tables.findIndex(x => x.code === reference.tablePK.code) < 0) {
                                model.references.splice(i, 1);
                                continue;
                            }
                            if (UtilFunctions.isValidStringOrArray(reference.fieldsReference) === false) {
                                reference.fieldsReference = [];
                            }
                            for (let j = 0; j < reference.fieldsReference.length; j++) {
                                let referenceField = reference.fieldsReference[j];
                                const indexField = model.fields.findIndex(x => x.name.toUpperCase() === referenceField.fieldFK.name.toUpperCase());
                                referenceField.fieldFK = model.fields[indexField];
                            }
                            i++;
                        }

                        //end references

                        //indexes
                        if (UtilFunctions.isValidStringOrArray(model.indexes) === false) {
                            model.indexes = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.indexes) === false) {
                            this.model.indexes = [];
                        }

                        for(let i = 0; i < this.model.indexes.length; i++) {
                            let idx = this.model.indexes[i];
                            let index = model.indexes.findIndex(x => x.name.toUpperCase() === idx.name.toUpperCase());
                            if (index >= 0) {
                                model.indexes[index].code = idx.code;
                                model.indexes[index].id = idx.id;

                                const [item] = model.indexes.splice(index, 1);
                                model.indexes.splice(i, 0, item);
                            }
                            else {
                                model.indexes.splice(i, 0, idx);
                            }
                        }
                        for(let i = this.model.indexes.length; i < model.indexes.length; i++) {
                            let idx = model.indexes[i];
                            idx.code = null;
                            idx.id = crypto.randomUUID();
                        }
                        for(let i = 0; i < model.indexes.length; i++) {
                            let idx = model.indexes[i];
                            if (UtilFunctions.isValidStringOrArray(idx.indexFields) === false) {
                                idx.indexFields = [];
                            }
                            for (let j = 0; j < idx.indexFields.length; j++) {
                                let idxField = idx.indexFields[j];
                                const indexField = model.fields.findIndex(x => x.name.toUpperCase() === idxField.tableField.name.toUpperCase());
                                idxField.tableField = model.fields[indexField];
                            }
                        }

                        //end indexes

                        //searchs
                        if (UtilFunctions.isValidStringOrArray(model.searchs) === false) {
                            model.searchs = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.searchs) === false) {
                            this.model.searchs = [];
                        }

                        for(let i = 0; i < this.model.searchs.length; i++) {
                            let search = this.model.searchs[i];
                            let index = model.searchs.findIndex(x => x.name.toUpperCase() === search.name.toUpperCase());
                            if (index >= 0) {
                                model.searchs[index].code = search.code;
                                model.searchs[index].id = search.id;
                                if (UtilFunctions.isValidStringOrArray(search.searchFields) === false) {
                                    search.searchFields = [];
                                }
                                if (UtilFunctions.isValidStringOrArray(model.searchs[index].searchFields) === false) {
                                    model.searchs[index].searchFields = [];
                                }
                                for (let j = 0; j < search.searchFields.length; j++) {
                                    let searchField = search.searchFields[j];
                                    const searchFieldIndex = model.searchs[index].searchFields.findIndex(x => x.label.toUpperCase() === searchField.label.toUpperCase());
                                    if (searchFieldIndex >= 0) {
                                        model.searchs[index].searchFields[searchFieldIndex].code = searchField.code;
                                        model.searchs[index].searchFields[searchFieldIndex].id = searchField.id;
                                        const [itemSearch] = model.searchs[index].searchFields.splice(searchFieldIndex, 1);
                                        model.searchs[index].searchFields.splice(j, 0, itemSearch);
                                    }
                                    else {
                                        model.searchs[index].searchFields.splice(j, 0, searchField);
                                    }
                                }
                                for (let j = search.searchFields.length; j < model.searchs[index].searchFields.length; j++) {
                                    let searchField = model.searchs[index].searchFields[j];
                                    searchField.code = null;
                                    searchField.id = crypto.randomUUID();
                                }
                                for (let j = search.subsystems.length; j < model.searchs[index].subsystems.length;) {
                                    let subsystemField = model.searchs[index].subsystems[j];

                                    const indexField = subsystems.findIndex(x => x.code === subsystemField.subsystem.code);
                                    if (indexField < 0) {
                                        model.searchs[index].subsystems.splice(j, 1);
                                        continue;
                                    }
                                    j++;
                                }
                                for (let j = 0; j < model.searchs[index].searchFields.length; j++) {
                                    let searchField = model.searchs[index].searchFields[j];
                                    const indexField = model.fields.findIndex(x => x.name.toUpperCase() === searchField.tableField.name.toUpperCase());
                                    searchField.tableField = model.fields[indexField];
                                }

                                const [item] = model.searchs.splice(index, 1);
                                model.searchs.splice(i, 0, item);
                            }
                            else {
                                model.searchs.splice(i, 0, search);
                            }
                        }
                        for(let i = this.model.searchs.length; i < model.searchs.length; i++) {
                            let search = model.searchs[i];
                            search.code = null;
                            search.id = crypto.randomUUID();
                            for (let j = 0; j < search.searchFields.length; j++) {
                                let searchField = search.searchFields[j];
                                searchField.code = null;
                                searchField.id = crypto.randomUUID();

                                const indexField = model.fields.findIndex(x => x.name.toUpperCase() === searchField.tableField.name.toUpperCase());
                                searchField.tableField = model.fields[indexField];
                            }
                            for (let j = 0; j < search.subsystems.length;) {
                                let subsystemField = search.subsystems[j];

                                const indexField = subsystems.findIndex(x => x.code === subsystemField.subsystem.code);
                                if (indexField < 0) {
                                    search.subsystems.splice(j, 1);
                                    continue;
                                }
                                j++;
                            }
                        }
                        //end searchs

                        //customizations
                        if (UtilFunctions.isValidStringOrArray(model.customizations) === false) {
                            model.customizations = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.customizations) === false) {
                            this.model.customizations = [];
                        }
                        for(let i = 0; i < model.customizations.length; i++) {
                            model.customizations[i].name1 = this.model.name;
                        }

                        for(let i = 0; i < this.model.customizations.length; i++) {
                            let customization = this.model.customizations[i];
                            let index = model.customizations.findIndex(x =>
                                x.name1.toUpperCase() === customization.name1.toUpperCase() &&
                                x.name2.toUpperCase() === customization.name2.toUpperCase() &&
                                x.name3.toUpperCase() === customization.name3.toUpperCase() &&
                                x.name4.toUpperCase() === customization.name4.toUpperCase() &&
                                x.name5.toUpperCase() === customization.name5.toUpperCase() &&
                                x.type === customization.type
                            );
                            if (index >= 0) {
                                model.customizations[index].code = customization.code;
                                model.customizations[index].id = customization.id;
                                const [item] = model.customizations.splice(index, 1);
                                model.customizations.splice(i, 0, item);
                            }
                            else {
                                model.customizations.splice(i, 0, customization);
                            }
                        }
                        for(let i = this.model.customizations.length; i < model.customizations.length; i++) {
                            let customization = model.customizations[i];
                            customization.code = null;
                            customization.id = crypto.randomUUID();
                        }
                        //end customizations
                        this._cloneModel = model;
                        this.refresh();
                        this._changeDetectorRef.detectChanges();
                        this.messageService.open('Importação realizada com sucesso', 'SUCESSO', 'success');

                    } catch (e) {
                        this.messageService.open('Erro na importação : ' + e, 'ERRO', 'error');
                    }
                });
        }
    }
}
