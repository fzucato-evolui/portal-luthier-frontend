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
import {DatePipe, JsonPipe, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
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
    LuthierBondModel,
    LuthierMetadataHistoryChangeModel,
    LuthierProcedureDependencyModel,
    LuthierProcedureModel,
    LuthierResourceModel,
    LuthierSubsystemModel,
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
import {LuthierValidator} from '../../../../../shared/validators/luthier.validator';
import {LuthierService} from '../../luthier.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {EnumToArrayPipe} from '../../../../../shared/pipes/util-functions.pipe';
import {DatabaseTypeEnum} from '../../../../../shared/models/portal-luthier-database.model';
import {debounceTime, Subject, takeUntil} from 'rxjs';
import {MatMenuModule} from '@angular/material/menu';
import {Clipboard} from '@angular/cdk/clipboard';
import {SharedDirectiveModule} from '../../../../../shared/directives/shared-directive.module';
import {FilterPredicateUtil} from '../../../../../shared/util/util-classes';
import {
    LuthierDictionaryMetadataChangesModalComponent
} from '../modal/metadata-changes/luthier-dictionary-metadata-changes-modal.component';
import {MatDialog} from '@angular/material/dialog';

export type ProcedureType = 'dependencies' | 'bodies' | 'bonds' ;
@Component({
    selector     : 'luthier-dictionary-procedure',
    templateUrl  : './luthier-dictionary-procedure.component.html',
    styleUrls : ['/luthier-dictionary-procedure.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports: [
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
        MatMenuModule,
        DatePipe,
        SharedDirectiveModule,
        JsonPipe
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class LuthierDictionaryProcedureComponent implements OnInit, OnDestroy, AfterViewInit
{
    protected hasChanged = false;
    private _model: LuthierProcedureModel;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public dependenciesDataSource = new MatTableDataSource<LuthierProcedureDependencyModel>();
    @ViewChildren('sortDependencies') sortFields: QueryList<MatSort>;
    public bondsDataSource = new MatTableDataSource<LuthierBondModel>();
    @ViewChild('sortBonds') sortBonds: MatSort;
    public historicalDataSource = new MatTableDataSource<LuthierMetadataHistoryChangeModel>();
    @ViewChild('sortHistorical') sortHistorical: MatSort;
    currentTab: ProcedureType = 'bodies';
    private _cloneModel: LuthierProcedureModel;
    @Input()
    set model(value: LuthierProcedureModel) {
        this._model = value;
        this._cloneModel = cloneDeep(this._model);
    }
    get model(): LuthierProcedureModel {
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
    get clipboard(): Clipboard {
        return this._parent.clipboard;
    }
    get dadosViewBodyType(): LuthierViewBodyEnum | string {
        if (this.dadosDatabaseType === 'MSSQL') {
            return LuthierViewBodyEnum.SQLSERVER;
        }
        else {
            return this.dadosDatabaseType;
        }
    }
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\]')}, 'J': { pattern: new RegExp('\[a-zA-Z0-9_\.\]')} };
    formSave: FormGroup;
    displayedDependenciesColumns = ['buttons', 'dependency.code', 'dependency.name'];
    displayedBondColumns = [ 'code', 'name'];
    displayedHistoricalColumns = [ 'buttons', 'code', 'user.name', 'date', 'type'];
    LuthierViewBodyEnum = LuthierViewBodyEnum;
    // @ts-ignore
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (event.code === 'F8' || event.code === 'Escape') {
            const rows = this.getRowEditing(this.currentTab);
            if (UtilFunctions.isValidStringOrArray(rows)) {
                rows.rows.forEach(row =>  {
                    event.preventDefault();
                    row.row = null;
                    row.editing = false;
                    row.pending = false;
                });
                rows.datasource._updateChangeSubscription();
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
            .pipe(takeUntil(this._unsubscribeAll), debounceTime(100))
            .subscribe((workDataBase: number) =>
            {
                this._changeDetectorRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit() {
        this.dependenciesDataSource.sort = this.sortFields.get(0);
        this.bondsDataSource.sort = this.sortBonds;

        UtilFunctions.setSortingDataAccessor(this.historicalDataSource);
        const filterPredicateHistorical = FilterPredicateUtil.withColumns(this.displayedHistoricalColumns);
        this.historicalDataSource.filterPredicate = filterPredicateHistorical.instance.bind(filterPredicateHistorical);
        this.historicalDataSource.sort = this.sortHistorical;

        if (UtilFunctions.isValidStringOrArray(this.model.code)) {
            UtilFunctions.forceValidations(this.formSave);
        }
        this.model.currentProcedureBodyType = this.dadosViewBodyType;
        this.hasChanged = !LuthierValidator.validateProcedure(this.model, this._model).isSame;

        this.dependenciesDataSource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                this.model.currentProcedureBodyType = this.dadosViewBodyType;
                const ret = LuthierValidator.validateProcedure(this.model, this._model);
                this.hasChanged = !ret.isSame;
                if (ret.needUpdate) {
                    this.dependenciesDataSource._updateChangeSubscription();
                }

            });

    }

    refresh() {
        this.formSave = this.formBuilder.group({
            code: [this.model.code],
            name: ['', [Validators.required]],
            date: [null],
            objectType: [''],
            bodies: this.formBuilder.array([])
        });
        this.addBodies();
        this.formSave.patchValue(this.model);
        //Essa ordem é importante para ordenação do @ViewChildren('sortFields') sortFields: QueryList<MatSort>;
        this.dependenciesDataSource.data = this.model.dependencies;
        this.bondsDataSource.data = this.model.bonds;
        this.historicalDataSource.data = this.model.historical;
        this.hasChanged = false;
        this.formSave.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                this._cloneModel = Object.assign({}, this.model, this.formSave.value) as LuthierProcedureModel;
                const ret = LuthierValidator.validateProcedure(this.model, this._model);
                this.hasChanged = !ret.isSame;
            });
    }


    add(type: ProcedureType) {
        const fg = this.addDependency(type);
        const newField = fg.value as LuthierBasicModel;
        newField.pending = true;
        newField.editing = true;
        newField.row = fg;
        const datasource = this.getDatasourceFromType(type);
        datasource.data.push(newField);
        datasource._updateChangeSubscription()
        this._changeDetectorRef.detectChanges();
    }

    delete(model: LuthierBasicModel,type: ProcedureType) {
        const index = this.getRealIndex(model, type).index;
        const dataSource = this.dependenciesDataSource;
        const data = dataSource.data[index].code;
        dataSource.data.splice(index, 1);
        dataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();
    }

    announceSortChange(event: Sort) {

    }


    save() {
        const rowsEditing = this.getAllRowsEditing();
        if (UtilFunctions.isValidStringOrArray(rowsEditing) === true) {
            rowsEditing.forEach(rows => {
                rows.rows.forEach(row =>  {
                    row.row = null;
                    row.editing = false;
                    row.pending = false;
                });
                rows.datasource._updateChangeSubscription();
                this._changeDetectorRef.detectChanges();
            });
        }
        if (this.hasChanged === false) {
            this.messageService.open('Nenhuma alteração foi detectada. Provavelmente, nenhum histórico será gerado, mas as informações serão levadas para a base de dados (Debug ID). Deseja continuar?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
                if (result === 'confirmed') {
                    this.doSave();

                }
            });
            return
        }

        this.doSave();

    }
    doSave() {
        this._cloneModel = Object.assign({}, this.model, this.formSave.value) as LuthierProcedureModel;
        this.service.saveProcedure(this._cloneModel)
            .then(result => {
                result.id = this._cloneModel.id;
                result.bonds = this._cloneModel.bonds;
                result.previousName = result.name;
                if (UtilFunctions.isValidStringOrArray(this.model.historical) === true) {
                    result.historical.push(... this.model.historical);
                }
                this.model = result;
                this.refresh();
                const index = this._parent.tabsOpened.findIndex(x => x.id === this.model.id);
                this._parent.tabsOpened[index].name = this.model.name;
                //this._parent.selectedTab = this._parent.tabsOpened[index];
                this._changeDetectorRef.detectChanges();
                this.messageService.open(`Procedure salva com sucesso`, 'SUCESSO', 'success')
            })
    }

    canSave(): boolean {
        if (this.formSave) {
            if (this.formSave.invalid || UtilFunctions.isValidObject(this.model.invalidFields)) {
                return false;
            }
            return UtilFunctions.isValidStringOrArray(this.getBody(this.dadosViewBodyType).value['sql']) === true ||
                UtilFunctions.isValidStringOrArray(this.getBody(LuthierViewBodyEnum.GENERICO).value['sql']) === true ||
                UtilFunctions.isValidStringOrArray(this.getBody(LuthierViewBodyEnum.CUSTOM).value['sql']) === true;
        }

        return false;
    }

    revert() {
        this.model = this._model;
        this.refresh();
        this._changeDetectorRef.detectChanges();
    }

    addBodies() {
        const fa = (this.formSave.get('bodies') as FormArray);
        fa.clear();
        if (UtilFunctions.isValidStringOrArray(this.model.bodies) === true) {
            this.model.bodies.forEach(x => {
                fa.push(this.addBodyField());
            })
            const pipe = new EnumToArrayPipe();
            const keyPair = pipe.transform(LuthierViewBodyEnum);
            keyPair.forEach(x => {
                const index = this.model.bodies.findIndex(y => y.databaseType === x.key);
                if (index < 0) {
                    fa.push(this.addBodyField(x.key));
                }
            })
        }
    }
    addDependency(type: ProcedureType): FormGroup {
        const c = this.formBuilder.group({
                id: [crypto.randomUUID()],
                dependency: this.formBuilder.group({
                    code: [null, Validators.required],
                    name: [null, [Validators.required]]
                })

            }
        );
        return c;

    }

    addBodyField(bodyType?: LuthierViewBodyEnum): FormGroup {
        const c = this.formBuilder.group({
            databaseType: [bodyType],
            sql: [null]
        });
        return c;
    }

    getBody(bodyType: LuthierViewBodyEnum | any): FormGroup {
        const fa = (this.formSave.get('bodies') as FormArray);
        const index = fa.controls.findIndex(x => x.get('databaseType').value === bodyType);
        if (index >= 0) {
            return fa.at(index) as FormGroup;
        }
        const c = this.addBodyField(bodyType);
        fa.push(c);
        return c;
    }
    getRealIndex(model: LuthierBasicModel, type: ProcedureType): {index: number, dataSource: MatTableDataSource<any>} {
        const dataSource = this.getDatasourceFromType(type);
        if (!model) {
            return {index: -1, dataSource: dataSource};
        }
        return {index: dataSource.data.indexOf(model), dataSource: dataSource};
    }

    getDatasourceFromType(type: ProcedureType): MatTableDataSource<any> {

        if (type === 'dependencies') {
            return this.dependenciesDataSource;
        }
        else {
            return new MatTableDataSource<any>();
        }
    }

    getRowEditing(type: ProcedureType): {datasource:MatTableDataSource<any>, rows: LuthierBasicModel[]} {
        const dataSource = this.getDatasourceFromType(type);
        return {datasource: dataSource, rows: dataSource.data.filter(x => x['editing'] === true)};
    }
    editRow(model: LuthierProcedureDependencyModel, type: ProcedureType) {
        const fg = this.addDependency(type);
        fg.patchValue(model);
        UtilFunctions.forceValidations(fg);
        model.row = fg;
        model.editing = true;
    }

    saveRow(model: LuthierBasicModel, type: ProcedureType) {
        console.log(model, type);
        const realIndex = this.getRealIndex(model, type);
        const fg = model.row;
        UtilFunctions.forceValidations(fg);
        model.pending = false;
        model.editing = false;
        if (fg.invalid) {
            this.messageService.open("Existem campo inválidos!", "Error de Validação", "warning");
            fg.updateValueAndValidity();
            this._changeDetectorRef.detectChanges();
            //return;
        }
        model = Object.assign({}, model, fg.value);
        model.row = null;
        realIndex.dataSource.data[realIndex.index] = model;
        realIndex.dataSource._updateChangeSubscription();
        this._changeDetectorRef.detectChanges()
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

    filterDependencies(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dependenciesDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterBonds(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.bondsDataSource.filter = filterValue.trim().toLowerCase();
    }
    filterHistorical(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.historicalDataSource.filter = filterValue.trim().toLowerCase();
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
        const rows = this.getRowEditing(this.currentTab);
        if (UtilFunctions.isValidStringOrArray(rows)) {
            rows.rows.forEach(row =>  {
                row.row = null;
                row.editing = false;
                row.pending = false;
            });
            rows.datasource._updateChangeSubscription();
            this._changeDetectorRef.detectChanges();
        }
        this.currentTab = event.tab.ariaLabel as ProcedureType;
        const dataSource = this.getDatasourceFromType(this.currentTab);
        if (dataSource != null) {
            this.getDatasourceFromType(this.currentTab)._updateChangeSubscription();
        }
    }

    parseBody(bodyType: LuthierViewBodyEnum) {
        const fg = this.getBody(bodyType);
        const model = fg.value as LuthierViewModel;
        if (model && UtilFunctions.isValidStringOrArray(model.body) === true) {

        }
    }

    async readProcedureFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const model = JSON.parse(text) as LuthierProcedureModel;
            setTimeout(() => {
                this.importProcedure(model);
            })
        } catch (error) {
            this.messageService.open('Erro ao ler conteúdo da área de transferência '+ error, 'ERRO', 'error');
            console.error('Failed to read clipboard contents: ', error);
        }
    }

    readProcedureFromFile(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            // You can further process the selected file here
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                const model = JSON.parse(text) as LuthierProcedureModel;
                setTimeout(() => {
                    this.importProcedure(model);
                });

            };
            reader.onerror = (error) => {
                this.messageService.open('Erro ao ler arquivo '+ error, 'ERRO', 'error');
            };
            reader.readAsText(file);
        }
    }

    importProcedure(model: LuthierProcedureModel) {
        if (model) {
            Promise.all(
                [
                    this._parent.service.getActiveSubsystems(),
                    this._parent.service.getImagesResources()]
            )
                .then(async value => {
                    try {
                        const proceduresSearched = new Array<LuthierProcedureModel>();
                        const subsystems = value[0] as LuthierSubsystemModel[];
                        const resources = value[1] as LuthierResourceModel[];
                        if (UtilFunctions.isValidStringOrArray(model.code) === false) {
                            this.messageService.open('Erro ao ler procedure', 'ERRO', 'error');
                            return;
                        }
                        if (model.objectType != this.model.objectType) {
                            this.messageService.open('Erro ao ler procedure', 'ERRO', 'error');
                            return;
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.code) === false) {
                            this.model.name = model.name;
                        }
                        const importedCode = model.code;
                        model.name = this.model.name;
                        model.previousName = this.model.previousName;
                        model.code = this.model.code;
                        model.id = this.model.id;
                        model.bonds = this.model.bonds;
                        model.historical = this.model.historical;

                        // dependencies
                        if (UtilFunctions.isValidStringOrArray(model.dependencies) === false) {
                            model.dependencies = [];
                        }
                        if (UtilFunctions.isValidStringOrArray(this.model.dependencies) === false) {
                            this.model.dependencies = [];
                        }
                        for(let i = 0; i < this.model.dependencies.length; i++) {
                            let dependency = this.model.dependencies[i];
                            let index = model.dependencies.findIndex(x => x.dependency.name.toUpperCase() === dependency.dependency.name.toUpperCase());
                            if (index >= 0) {
                                model.dependencies[index].code = dependency.code;
                                model.dependencies[index].id = dependency.id;

                                const [item] = model.dependencies.splice(index, 1);
                                model.dependencies.splice(i, 0, item);
                            }
                            else {
                                model.dependencies.splice(i, 0, dependency);
                            }
                        }
                        for(let i = this.model.dependencies.length; i < model.dependencies.length; i++) {
                            let dependency = model.dependencies[i];
                            dependency.code = null;
                            dependency.id = crypto.randomUUID();
                        }
                        // end fields


                        this._cloneModel = model;
                        this.refresh();
                        this._changeDetectorRef.detectChanges();
                        this.messageService.open('Importação realizada com sucesso', 'SUCESSO', 'success');

                    } catch (e) {
                        this.messageService.open('Erro na importação : ' + e, 'ERRO', 'error');
                        console.error(e);
                    }
                });
        }
    }

    showValidationsError(): string {
        /*
        if (UtilFunctions.isValidStringOrArray(errors) === true) {
            errors.forEach(value => {
                if (value.startsWith('fields')) {
                    const path = value.split('.');
                    const model = this.fieldsDataSource.data[parseInt(path[1])][path[2]];
                    console.log(path, model);
                }

            })
        }
         */
        if (UtilFunctions.isValidObject(this.model.invalidFields)) {
            return JSON.stringify(this.model.invalidFields, null, 2);
        }
        else if (this.hasChanged === false) {
            return 'Nenhuma alteração feita';
        }
    }

    bodyChanged($event: Event) {
        this._cloneModel.bodies = this.formSave.get('bodies').value;
        this.model.currentProcedureBodyType = this.dadosViewBodyType;
        const ret = LuthierValidator.validateProcedure(this.model, this._model);
        this.hasChanged = !ret.isSame;
    }

    hasValidationProblem(type: ProcedureType): boolean {
        return UtilFunctions.isValidObject(this.model.invalidFields) && UtilFunctions.isValidStringOrArray(this.model.invalidFields[type]);
    }

    getAllRowsEditing(): Array<{datasource:MatTableDataSource<any>, rows: LuthierBasicModel[]}> {
        const editingGrids: Array<ProcedureType> = ['dependencies'];
        const allRows: Array<{datasource:MatTableDataSource<any>, rows: LuthierBasicModel[]}> = [];
        for (const editingGrid of editingGrids) {
            const rows = this.getRowEditing(editingGrid);
            if (UtilFunctions.isValidStringOrArray(rows) === true) {
                allRows.push(rows);
            }
        }
        return allRows;
    }

    getFieldGroup(model: LuthierBasicModel, type: ProcedureType): FormGroup {
        const fg = model.row;
        return fg;
    }

    getPossiblesDependencies(current: LuthierProcedureDependencyModel): LuthierProcedureModel[] {
        return this._parent.procedures.filter(x => x.code !== this.model.code &&
            this.dependenciesDataSource.data.findIndex(y =>
                y.dependency.code === x.code && x.code !== current.dependency.code) < 0)
            .map(x => {
                x.id = x.code.toString();
                return x;
            });
    }

    viewMetadataHistoryChange(model: LuthierMetadataHistoryChangeModel) {
        this.service.getMetadataHistoryChange(model.code).then(result => {
            const modal = this._matDialog.open(LuthierDictionaryMetadataChangesModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-metadata-changes-modal-container' });
            modal.componentInstance.title = "Alteração da tabela " + this.model.name;
            result.procedure = this.model;
            modal.componentInstance.model = result;
        })
    }
}
