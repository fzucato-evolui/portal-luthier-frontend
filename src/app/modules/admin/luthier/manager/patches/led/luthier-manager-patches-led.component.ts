import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LedImportModel, LuthierTableModel, PatchImportItemModel} from '../../../../../../shared/models/luthier.model';
import {firstValueFrom, Subject, takeUntil} from 'rxjs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {LuthierManagerPatchesComponent} from '../luthier-manager-patches.component';
import {LuthierService} from '../../../luthier.service';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {FilterPredicateUtil} from '../../../../../../shared/util/util-classes';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {saveAs} from 'file-saver';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {NgClass, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {
    LuthierManagerPatchesLpxProcessModalComponent
} from '../lpx/modal/luthier-manager-patches-lpx-process-modal.component';
import {
    LuthierManagerPatchesLedProcessModalComponent
} from './modal/luthier-manager-patches-led-process-modal.component';

export type LedType = 'TABLE';
@Component({
    selector: 'luthier-manager-patches-led',
    templateUrl: './luthier-manager-patches-led.component.html',
    styleUrls: ['/luthier-manager-patches-led.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonToggleModule,
        MatButtonModule,
        FormsModule,
        MatInputModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatTooltipModule,
        NgxFileDropModule,
        NgIf,
        NgClass
    ]
})
export class LuthierManagerPatchesLedComponent implements OnInit, OnDestroy, AfterViewInit{

    @ViewChild(MatSort) sort: MatSort;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public datasource = new MatTableDataSource<LuthierTableModel>();
    displayedColumns: string[] = ['select', 'status', 'code', 'name', 'description'];
    selection = new SelectionModel<LuthierTableModel>(true, []);
    ledType: LedType = 'TABLE';
    fileLoaded: boolean = false;
    fileName: string;

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

    get messageService(): MessageDialogService {
        if (this._parent != null) {
            return this._parent.messageService;
        }
        return null;
    }

    constructor(private _parent: LuthierManagerPatchesComponent,
                private _changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog) {
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
        //             this.datasource.data = value.filter(item => item.objectType === 'TABLE' &&
        //                 item.export &&
        //                 UtilFunctions.parseBoolean(item.export) === true);
        //
        //         });
        // }

    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.datasource.data.filter(item => UtilFunctions.isValidStringOrArray(item['selectable'] === true)).length;
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
                if (UtilFunctions.isValidStringOrArray(row['selectable'] ) === true) {
                    row['status'] = '#selected';
                    this.selection.select(row);
                }
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
            this.service.getExportedTables()
                .then(result => {
                    this.datasource.data = result;
                    this.selection.clear();
                });
        }
    }

    save() {
        if (!this.import) {
            let filter = [];
            if (this.isAllSelected() === false) {
                filter = this.selection.selected.map(item => item.code);
            }
            this.service.generateLed(filter)
                .then(result => {
                    this.service.download(result.link)
                        .then(blob => {
                            saveAs(blob, result.fileName);// Handle successful download
                        })

                });
        }
        else {
            const model = new LedImportModel();
            model.fileName = this.fileName;
            model.tables = this.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierTableModel>();
                table.item = item;
                return table;
            });
            const modal = this._matDialog.open(LuthierManagerPatchesLedProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-led-process-modal-container' });
            modal.componentInstance.title = "Processamento de Arquivo LED";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = model;
        }
    }

    canSave() {
        return this.selection.selected.length > 0;
    }

    clearFile() {
        this.fileLoaded = false;
    }

    public dropped(files: NgxFileDropEntry[]) {
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (ext.toLowerCase() !== '.led') {
                    this.messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    const formData = new FormData();
                    formData.append('file', file, file.name);

                    me.service.uploadLed(formData).then(result => {
                        me.datasource.data = result.tables.map(item => {
                            item.item['message'] = item.message;
                            item.item['tag'] = item.status;
                            item.selectable = UtilFunctions.parseBoolean(item.selectable);
                            item.item['selectable'] = item.selectable;
                            if (item.selectable === false) {
                                if (UtilFunctions.isValidStringOrArray(item.status) === true) {
                                    item.item['status'] = '#' + item.status.toLowerCase();
                                }
                            }
                            else {
                                item.item['status'] = '#selected';
                                me.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.fileLoaded = true;
                        me.fileName = result.fileName;
                        me._changeDetectorRef.markForCheck();
                    });

                });
            }
        })

    }
}
