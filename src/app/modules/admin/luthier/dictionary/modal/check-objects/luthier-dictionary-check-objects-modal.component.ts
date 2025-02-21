import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injectable,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {debounceTime, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {
    LuthierChangesOfProcedureModel,
    LuthierChangesOfTableModel,
    LuthierCheckObjectsProcedureSummaryModel,
    LuthierCheckObjectsSummaryModel,
    LuthierCheckObjectsTableSummaryModel
} from '../../../../../../shared/models/luthier.model';
import {LuthierDictionaryComponent} from '../../luthier-dictionary.component';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {LuthierDictionaryChangesModalComponent} from '../changes/luthier-dictionary-changes-modal.component';
import {FormsModule} from '@angular/forms';
import {MatPaginator, MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

export type FilterCheckObjectsTableModel = {
    changed?: boolean
    changedFields?: boolean
    changedPKs?: boolean
    changedReferences?: boolean
    changedIndexes?: boolean
    changedViews?: boolean
    hasError?: boolean
    done?: boolean
    isNew?: boolean
    text?: string
}
export type FilterCheckObjectsProcedureModel = {
    changed?: boolean
    changedBodies?: boolean
    hasError?: boolean
    done?: boolean
    isNew?: boolean
    text?: string
}
@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
    changes = new Subject<void>();

    firstPageLabel = `Primeira Página`;
    itemsPerPageLabel = `Itens por página:`;
    lastPageLabel = `Última Página`;

    nextPageLabel = 'Próxima Página';
    previousPageLabel = 'Página Anterio';

    getRangeLabel(page: number, pageSize: number, length: number): string {
        if (length === 0) {
            return `Página 1 de 1`;
        }
        const amountPages = Math.ceil(length / pageSize);
        return `Página ${page + 1} de ${amountPages}`;
    }
}

@Component({
    selector       : 'luthier-dictionary-check-objects-modal',
    styleUrls      : ['/luthier-dictionary-check-objects-modal.component.scss'],
    templateUrl    : './luthier-dictionary-check-objects-modal.component.html',
    imports: [
        FormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        NgFor,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgIf,
        MatCheckboxModule,
        MatTooltipModule,
        AsyncPipe,
        MatButtonToggleModule,
        NgClass
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    providers: [{provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}]
})
export class LuthierDictionaryCheckObjectsModalComponent implements OnInit, OnDestroy, AfterViewInit
{
    model: LuthierCheckObjectsSummaryModel;

    @ViewChild("sortTables") sortTables: MatSort;
    @ViewChild("paginatorTables") paginatorTables: MatPaginator;
    resultsLengthTables = 0;
    summaryFooterTables: LuthierCheckObjectsTableSummaryModel = new LuthierCheckObjectsTableSummaryModel();
    displayedColumnsTables = [ 'buttons', 'table.code', 'table.name', 'table.objectType', 'isNew', 'changed', 'done', 'hasError', "changedFields", "changedPKs", "changedReferences", "changedIndexes", "changedViews" ];
    filterModelTables: FilterCheckObjectsTableModel = {
        changed: null,
        changedFields: null,
        changedPKs: null,
        changedReferences: null,
        changedIndexes: null,
        changedViews: null,
        hasError: null,
        done: null,
        isNew: null,
        text: null
    }
    $filterModelTables: ReplaySubject<FilterCheckObjectsTableModel> = new ReplaySubject<FilterCheckObjectsTableModel>(1);
    public dataSourceTables = new MatTableDataSource<LuthierChangesOfTableModel>();

    @ViewChild("sortProcedures") sortProcedures: MatSort;
    @ViewChild("paginatorProcedures") paginatorProcedures: MatPaginator;
    resultsLengthProcedures = 0;
    summaryFooterProcedures: LuthierCheckObjectsProcedureSummaryModel = new LuthierCheckObjectsProcedureSummaryModel();
    displayedColumnsProcedures = [ 'buttons', 'procedure.code', 'procedure.name', 'isNew', 'changed', 'done', 'hasError', "changedBodies" ];
    filterModelProcedures: FilterCheckObjectsProcedureModel = {
        changed: null,
        changedBodies: null,
        hasError: null,
        done: null,
        isNew: null,
        text: null
    }
    $filterModelProcedures: ReplaySubject<FilterCheckObjectsProcedureModel> = new ReplaySubject<FilterCheckObjectsProcedureModel>(1);
    public dataSourceProcedures = new MatTableDataSource<LuthierChangesOfProcedureModel>();

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    title: string;
    private _parent: LuthierDictionaryComponent;

    set parent(value: LuthierDictionaryComponent) {
        this._parent = value;
    }

    get parent(): LuthierDictionaryComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog,
                public dialogRef: MatDialogRef<LuthierDictionaryCheckObjectsModalComponent>)
    {
    }

    ngOnInit(): void {
        this.dataSourceTables.data = this.model.tables.changes;
        this.resultsLengthTables = this.dataSourceTables.data.length;
        this.summaryFooterTables = {
            totalTime: this.model.tables.totalTime,
            total: this.model.tables.total,
            totalChanges: this.model.tables.totalChanges,
            totalNew: this.model.tables.totalNew,
            totalChangesFields: this.model.tables.totalChangesFields,
            totalChangesPKs: this.model.tables.totalChangesPKs,
            totalChangesReferences: this.model.tables.totalChangesReferences,
            totalChangesIndexes: this.model.tables.totalChangesIndexes,
            totalChangesViews: this.model.tables.totalChangesViews,
            totalTables: this.model.tables.totalTables,
            totalViews: this.model.tables.totalViews,
            totalDone: this.model.tables.totalDone,
            totalErrors: this.model.tables.totalErrors

        }
        this.$filterModelTables.pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((value) =>
            {
                this.filterTables(value);
            });


        this.dataSourceProcedures.data = this.model.procedures.changes;
        this.resultsLengthProcedures = this.dataSourceProcedures.data.length;
        this.summaryFooterProcedures = {
            totalTime: this.model.procedures.totalTime,
            total: this.model.procedures.total,
            totalChanges: this.model.procedures.totalChanges,
            totalChangesBodies: this.model.procedures.totalChangesBodies,
            totalNew: this.model.procedures.totalNew,
            totalProcedures: this.model.procedures.totalProcedures,
            totalDone: this.model.procedures.totalDone,
            totalErrors: this.model.procedures.totalErrors

        }
        this.$filterModelProcedures.pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
            .subscribe((value) =>
            {
                this.filterProcedures(value);
            });
    }

    ngOnDestroy(): void {
        this.parent.service.checkObjectsDeleteChanges(this.model.id);
        this.dataSourceTables.data = [];
        this.dataSourceProcedures.data = [];
        this.model = null;
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.dataSourceTables.sort = this.sortTables;
        UtilFunctions.setSortingDataAccessor(this.dataSourceTables);
        this.dataSourceTables.paginator = this.paginatorTables;

        this.dataSourceProcedures.sort = this.sortProcedures;
        UtilFunctions.setSortingDataAccessor(this.dataSourceProcedures);
        this.dataSourceProcedures.paginator = this.paginatorProcedures;
    }

    filterTables(value: FilterCheckObjectsTableModel) {
        this.summaryFooterTables = new LuthierCheckObjectsTableSummaryModel();
        this.summaryFooterTables.totalTime = this.model.tables.totalTime;

        this.dataSourceTables.data = this.model.tables.changes.filter(x => {
            for (const key in value) {
                if (key !== 'text') {
                    if (value[key] !== null) {
                        if (x[key] !== value[key]) {
                            return false;
                        }
                    }
                }
            }
            let valid = true;
            if (UtilFunctions.isValidStringOrArray(value.text) === true) {
                valid = UtilFunctions.removeAccents(x.table.code.toString()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.name.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.table.objectType.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase()));
            }
            if (valid) {
                this.summaryFooterTables.total += 1;
                if (x.table.objectType === 'TABLE') {
                    this.summaryFooterTables.totalTables += 1;
                }
                else {
                    this.summaryFooterTables.totalViews += 1;
                }
                if (x.done) {
                    this.summaryFooterTables.totalDone += 1;
                }
                if (x.hasError) {
                    this.summaryFooterTables.totalErrors += 1;
                }
                if (x.isNew) {
                    this.summaryFooterTables.totalNew += 1;
                }
                if (x.changed) {
                    this.summaryFooterTables.totalChanges += 1;
                }
                if (x.changedFields) {
                    this.summaryFooterTables.totalChangesFields += 1;
                }
                if (x.changedPKs) {
                    this.summaryFooterTables.totalChangesPKs += 1;
                }
                if (x.changedReferences) {
                    this.summaryFooterTables.totalChangesReferences += 1;
                }
                if (x.changedIndexes) {
                    this.summaryFooterTables.totalChangesIndexes += 1;
                }
                if (x.changedViews) {
                    this.summaryFooterTables.totalChangesViews += 1;
                }

            }
            return valid;
        });

        this.dataSourceTables._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();

    }

    filterProcedures(value: FilterCheckObjectsProcedureModel) {
        this.summaryFooterProcedures = new LuthierCheckObjectsProcedureSummaryModel();
        this.summaryFooterProcedures.totalTime = this.model.procedures.totalTime;

        this.dataSourceProcedures.data = this.model.procedures.changes.filter(x => {
            for (const key in value) {
                if (key !== 'text') {
                    if (value[key] !== null) {
                        if (x[key] !== value[key]) {
                            return false;
                        }
                    }
                }
            }
            let valid = true;
            if (UtilFunctions.isValidStringOrArray(value.text) === true) {
                valid = UtilFunctions.removeAccents(x.procedure.code.toString()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.procedure.name.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase())) ||
                    UtilFunctions.removeAccents(x.procedure.objectType.toUpperCase()).includes(UtilFunctions.removeAccents(value.text.toUpperCase()));
            }
            if (valid) {
                this.summaryFooterProcedures.total += 1;
                this.summaryFooterProcedures.totalProcedures += 1;
                if (x.done) {
                    this.summaryFooterProcedures.totalDone += 1;
                }
                if (x.hasError) {
                    this.summaryFooterProcedures.totalErrors += 1;
                }
                if (x.isNew) {
                    this.summaryFooterProcedures.totalNew += 1;
                }
                if (x.changed) {
                    this.summaryFooterProcedures.totalChanges += 1;
                }

            }
            return valid;
        });

        this.dataSourceProcedures._updateChangeSubscription();
        this._changeDetectorRef.detectChanges();

    }

    filterTextTables() {
        this.$filterModelTables.next(this.filterModelTables);
    }

    filterTextProcedures() {
        this.$filterModelProcedures.next(this.filterModelProcedures);
    }

    changeBooleanTables(event: MatCheckboxChange, key: string) {
        if (this.filterModelTables[key] !== null) {
            if (UtilFunctions.parseBoolean(this.filterModelTables[key]) === false) {
                this.filterModelTables[key] = null;
            }
            else {
                this.filterModelTables[key] = false;
            }
        }
        else {
            this.filterModelTables[key] = true;
        }
        event.source.checked = this.filterModelTables[key];
        this.$filterModelTables.next(this.filterModelTables);
    }

    changeBooleanProcedures(event: MatCheckboxChange, key: string) {
        if (this.filterModelProcedures[key] !== null) {
            if (UtilFunctions.parseBoolean(this.filterModelProcedures[key]) === false) {
                this.filterModelProcedures[key] = null;
            }
            else {
                this.filterModelProcedures[key] = false;
            }
        }
        else {
            this.filterModelProcedures[key] = true;
        }
        event.source.checked = this.filterModelProcedures[key];
        this.$filterModelProcedures.next(this.filterModelProcedures);
    }

    download() {
        this.parent.service.checkObjectsAllChanges(this.model.id)
            .then(result => {
                const filteredResult = {
                    tables: {
                        filter: this.filterModelTables,
                        summary: this.summaryFooterTables,
                        changes: result.tables.changes.filter(x => this.dataSourceTables.data.findIndex(y => y.table.name === x.table.name) >= 0)
                    },
                    procedures: {
                        filter: this.filterModelProcedures,
                        summary: this.summaryFooterProcedures,
                        changes: result.procedures.changes.filter(x => this.dataSourceProcedures.data.findIndex(y => y.procedure.name === x.procedure.name) >= 0)
                    }
                };
                this.parent.downloadFile(filteredResult, 'changes.json');
            })

    }

    downloadTables() {
        this.parent.service.checkObjectsAllTableChanges(this.model.id)
            .then(result => {
                const filteredResult = {
                    tables: {
                        filter: this.filterModelTables,
                        summary: this.summaryFooterTables,
                        changes: result.changes.filter(x => this.dataSourceTables.data.findIndex(y => y.table.name === x.table.name) >= 0)
                    }
                };
                this.parent.downloadFile(filteredResult, 'tables_changes.json');
            })

    }

    downloadProcedures() {
        this.parent.service.checkObjectsAllProcedureChanges(this.model.id)
            .then(result => {
                const filteredResult = {
                    procedures: {
                        filter: this.filterModelProcedures,
                        summary: this.summaryFooterProcedures,
                        changes: result.changes.filter(x => this.dataSourceProcedures.data.findIndex(y => y.procedure.name === x.procedure.name) >= 0)
                    }
                };
                this.parent.downloadFile(filteredResult, 'procedures_changes.json');
            })

    }

    downloadChangeTable(model: LuthierChangesOfTableModel) {
        if (model['complete']) {
            this.parent.downloadFile(model, `changes${model.table.name}.json`);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    this.parent.downloadFile(result, `changes${result.table.name}.json`);
                });
        }
    }
    downloadChangeProcedure(model: LuthierChangesOfProcedureModel) {
        if (model['complete']) {
            this.parent.downloadFile(model, `changes${model.procedure.name}.json`);
        }
        else {
            this.parent.service.checkObjectsProcedureChanges(this.model.id, model.procedure.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceProcedures.data.findIndex(x => x.procedure.code === model.procedure.code);
                    this.dataSourceProcedures.data[index] = result;
                    this.dataSourceProcedures._updateChangeSubscription();
                    this.parent.downloadFile(result, `changes${result.procedure.name}.json`);
                });
        }
    }
    viewTable(model: LuthierChangesOfTableModel) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                luthierTable: model.table
            };
            this.openModal(`Dados do banco Luthier da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        luthierTable: result.table
                    };
                    this.openModal(`Dados do banco Luthier da ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewProcedure(model: LuthierChangesOfProcedureModel) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                luthierProcedure: model.procedure
            };
            this.openModal(`Dados do banco Luthier da procedure ${model.procedure.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsProcedureChanges(this.model.id, model.procedure.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceProcedures.data.findIndex(x => x.procedure.code === model.procedure.code);
                    this.dataSourceProcedures.data[index] = result;
                    this.dataSourceProcedures._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        luthierProcedure: result.procedure
                    };
                    this.openModal(`Dados do banco Luthier da procedure ${result.procedure.name}`, modalModel);
                });
        }

    }

    viewMetaTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                databaseMeta: model.meta
            };
            this.openModal(`Dados que estavam salvos no banco de dados da ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        databaseMeta: result.meta
                    };
                    this.openModal(`Dados que estavam salvos no banco de dados da ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewMetaProcedure(model: LuthierChangesOfProcedureModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                databaseMeta: model.meta
            };
            this.openModal(`Dados que estavam salvos no banco de dados da procedure ${model.procedure.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsProcedureChanges(this.model.id, model.procedure.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceProcedures.data.findIndex(x => x.procedure.code === model.procedure.code);
                    this.dataSourceProcedures.data[index] = result;
                    this.dataSourceProcedures._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        databaseMeta: result.meta
                    };
                    this.openModal(`Dados que estavam salvos no banco de dados da procedure ${result.procedure.name}`, modalModel);
                });
        }
    }

    viewErrorTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                error: model.error
            };
            this.openModal(`Stacktrace do erro ocorrido na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        error: result.error
                    };
                    this.openModal(`Stacktrace do erro ocorrido na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewErrorProcedure(model: LuthierChangesOfProcedureModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                error: model.error
            };
            this.openModal(`Stacktrace do erro ocorrido na procedure ${model.procedure.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsProcedureChanges(this.model.id, model.procedure.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceProcedures.data.findIndex(x => x.procedure.code === model.procedure.code);
                    this.dataSourceProcedures.data[index] = result;
                    this.dataSourceProcedures._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        error: result.error
                    };
                    this.openModal(`Stacktrace do erro ocorrido na procedure ${result.procedure.name}`, modalModel);
                });
        }
    }

    viewChangedFieldsTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedFields,
                inserted: model.insertedFields,
                deleted: model.deletedFields,
                metaFields: model.meta?.fields,
                luthierFields: model.table.fields,
            }
            this.openModal(`Alterações de Campos na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedFields,
                        inserted: result.insertedFields,
                        deleted: result.deletedFields,
                        metaFields: result.meta?.fields,
                        luthierFields: result.table.fields,
                    }
                    this.openModal(`Alterações de Campos na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewChangedPKsTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                wasNeeded: model.needPK,
                deleted: model.deletedPks,
                metaPKs: model.meta?.fields.filter(x => x.key === true),
                luthierPKs: model.table.fields.filter(x => x.key === true),
            }
            this.openModal(`Alterações de PKs na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        wasNeeded: result.needPK,
                        deleted: result.deletedPks,
                        metaPKs: result.meta?.fields.filter(x => x.key === true),
                        luthierPKs: result.table.fields.filter(x => x.key === true),
                    }
                    this.openModal(`Alterações de PKs na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewChangedReferencesTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedReferences,
                inserted: model.insertedReferences,
                deleted: model.deletedReferences,
                metaReferences: model.meta?.references,
                luthierReferences: model.table.references,
            }
            this.openModal(`Alterações de Referências na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);

        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedReferences,
                        inserted: result.insertedReferences,
                        deleted: result.deletedReferences,
                        metaReferences: result.meta?.references,
                        luthierReferences: result.table.references,
                    }
                    this.openModal(`Alterações de Referências na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }
    }

    viewChangedIndexesTable(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updated: model.updatedIndexes,
                inserted: model.insertedIndexes,
                deleted: model.deletedIndexes,
                metaReferences: model.meta?.indexes,
                luthierReferences: model.table.indexes,
            }
            this.openModal(`Alterações de Índices na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updated: result.updatedIndexes,
                        inserted: result.insertedIndexes,
                        deleted: result.deletedIndexes,
                        metaReferences: result.meta?.indexes,
                        luthierReferences: result.table.indexes,
                    }
                    this.openModal(`Alterações de Índices na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewChangedViews(model: LuthierChangesOfTableModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updatedValue: model.nativeViewBody,
                metaViews: model.meta?.views,
                luthierViews: model.table.views,
            }
            this.openModal(`Alterações de SQL na ${model.table.objectType === 'TABLE' ? 'tabela': 'view'} ${model.table.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsTableChanges(this.model.id, model.table.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceTables.data.findIndex(x => x.table.code === model.table.code);
                    this.dataSourceTables.data[index] = result;
                    this.dataSourceTables._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updatedValue: result.nativeViewBody,
                        metaViews: result.meta?.views,
                        luthierViews: result.table.views,
                    }
                    this.openModal(`Alterações de SQL na ${result.table.objectType === 'TABLE' ? 'tabela' : 'view'} ${result.table.name}`, modalModel);
                });
        }

    }

    viewChangedProcedureBodies(model: LuthierChangesOfProcedureModel, i) {
        if (model['complete']) {
            const modalModel = {
                isNew: model.isNew,
                updatedValue: model.nativeProcedureBody,
                metaBodies: model.meta?.bodies,
                luthierBodies: model.procedure.bodies,
            }
            this.openModal(`Alterações de SQL na procedure ${model.procedure.name}`, modalModel);
        }
        else {
            this.parent.service.checkObjectsProcedureChanges(this.model.id, model.procedure.name)
                .then(result => {
                    result['complete'] = true;
                    const index = this.dataSourceProcedures.data.findIndex(x => x.procedure.code === model.procedure.code);
                    this.dataSourceProcedures.data[index] = result;
                    this.dataSourceProcedures._updateChangeSubscription();
                    const modalModel = {
                        isNew: result.isNew,
                        updatedValue: result.nativeProcedureBody,
                        metaBodies: result.meta?.bodies,
                        luthierBodies: result.procedure.bodies,
                    }
                    this.openModal(`Alterações de SQL na procedure ${result.procedure.name}`, modalModel);
                });
        }

    }

    openModal(title: string, model: any) {
        const modal = this._matDialog.open(LuthierDictionaryChangesModalComponent, { disableClose: true, panelClass: 'luthier-dictionary-changes-modal-container' });
        modal.componentInstance.title = title;
        modal.componentInstance.model = model;
    }

    cleanFilterTables() {
        this.filterModelTables = {
            changed: null,
            changedFields: null,
            changedPKs: null,
            changedReferences: null,
            changedIndexes: null,
            changedViews: null,
            hasError: null,
            done: null,
            isNew: null,
            text: null
        }
        this.$filterModelTables.next(this.filterModelTables);
    }

    cleanFilterProcedures() {
        this.filterModelProcedures = {
            changed: null,
            changedBodies: null,
            hasError: null,
            done: null,
            isNew: null,
            text: null
        }
        this.$filterModelProcedures.next(this.filterModelProcedures);
    }
}
