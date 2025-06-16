import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {MatButtonToggleChange, MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LuthierManagerPatchesComponent} from '../luthier-manager-patches.component';
import {LuthierService} from '../../../luthier.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';
import {LuthierManagerPatchesLpxTablesComponent} from './tables/luthier-manager-patches-lpx-tables.component';
import {LuthierManagerPatchesLpxVisionsComponent} from './visions/luthier-manager-patches-lpx-visions.component';
import {
    LuthierManagerPatchesLpxProceduresComponent
} from './procedures/luthier-manager-patches-lpx-procedures.component';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {
    LedImportModel,
    LpxImportModel, LuthierProcedureModel,
    LuthierTableModel, LuthierVisionModel,
    PatchImportItemModel
} from '../../../../../../shared/models/luthier.model';
import {saveAs} from 'file-saver';
import {
    LuthierManagerPatchesLupProcessModalComponent
} from '../lup/modal/luthier-manager-patches-lup-process-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {
    LuthierManagerPatchesLpxProcessModalComponent
} from './modal/luthier-manager-patches-lpx-process-modal.component';

export type LpxType = 'TABLE' | 'VISION' | 'PROCEDURE';
@Component({
    selector: 'luthier-manager-patches-lpx',
    templateUrl: './luthier-manager-patches-lpx.component.html',
    styleUrls: ['/luthier-manager-patches-lpx.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonToggleModule,
        MatButtonModule,
        FormsModule,
        MatIconModule,
        MatTooltipModule,
        NgIf,
        LuthierManagerPatchesLpxTablesComponent,
        LuthierManagerPatchesLpxVisionsComponent,
        LuthierManagerPatchesLpxProceduresComponent,
        NgxFileDropModule
    ]
})
export class LuthierManagerPatchesLpxComponent implements OnInit, OnDestroy, AfterViewInit{

    @ViewChild("tables") tables: LuthierManagerPatchesLpxTablesComponent;
    @ViewChild("visions") visions: LuthierManagerPatchesLpxVisionsComponent;
    @ViewChild("procedures") procedures: LuthierManagerPatchesLpxProceduresComponent;

    lpxType: LpxType = null;
    fileLoaded: boolean = false;
    fileName: string;

    get service(): LuthierService {
        if (this.parent != null) {
            return this.parent.service;
        }
        return null;
    }

    get import(): boolean {
        if (this.parent != null) {
            return this.parent.import;
        }
        return false;
    }

    get messageService(): MessageDialogService {
        if (this.parent != null) {
            return this.parent.messageService;
        }
        return null;
    }

    get drawerMode(): 'over' | 'side' {
        if (this.parent != null) {
            return this.parent.drawerMode;
        }
        return 'side';
    }

    set drawerMode(value: 'over' | 'side') {
        if (this.parent != null) {
            this.parent.drawerMode = value;
        }
    }

    get drawerOpened(): boolean {
        if (this.parent != null) {
            return this.parent.drawerOpened;
        }
        return true;
    }

    set drawerOpened(value: boolean) {
        if (this.parent != null) {
            this.parent.drawerOpened = value;
        }
    }

    constructor(public parent: LuthierManagerPatchesComponent,
                public changeDetectorRef: ChangeDetectorRef,
                private _matDialog: MatDialog) {
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {

    }

    ngOnInit(): void {

    }

    save() {

        if (!this.import) {
            const filter: {[key: string]: Array<number>} = {};
            if (this.tables.canSave()) {
                filter['TABLE'] = this.tables.isAllSelected() ? [] : this.tables.selection.selected.map(item => item.code);
            }
            if (this.visions.canSave()) {
                filter['VISION'] = this.visions.isAllSelected() ? [] : this.visions.selection.selected.map(item => item.code);
            }
            if (this.procedures.canSave()) {
                filter['PROCEDURE'] = this.procedures.isAllSelected() ? [] : this.procedures.selection.selected.map(item => item.code);
            }

            // this.service.generateLpx(filter)
            //     .then(result => {
            //         this.service.download(result.link)
            //             .then(blob => {
            //                 saveAs(blob, result.fileName);// Handle successful download
            //             })
            //
            //     });
            const modal = this._matDialog.open(LuthierManagerPatchesLpxProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-lpx-process-modal-container' });
            modal.componentInstance.title = "Geração de Arquivo LPX";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = filter;
            modal.componentInstance.isImport = false;
        }
        else {
            const model = new LpxImportModel();
            model.fileName = this.fileName;
            model.tables = this.tables.selection.selected.map(item => {
                const table = new PatchImportItemModel<LuthierTableModel>();
                table.item = item;
                return table;
            });
            model.visions = this.visions.selection.selected.map(item => {
                const vision = new PatchImportItemModel<LuthierVisionModel>();
                vision.item = item;
                return vision;
            });
            model.procedures = this.procedures.selection.selected.map(item => {
                const procedure = new PatchImportItemModel<LuthierProcedureModel>()
                procedure.item = item;
                return procedure;
            });
            const modal = this._matDialog.open(LuthierManagerPatchesLpxProcessModalComponent, { disableClose: true, panelClass: 'luthier-manager-patches-lpx-process-modal-container' });
            modal.componentInstance.title = "Processamento de Arquivo LPX";
            modal.componentInstance.parent = this;
            modal.componentInstance.model = model;
        }
    }

    canSave() {
        return (this.tables && this.tables.canSave()) || (this.visions && this.visions.canSave()) || (this.procedures && this.procedures.canSave());
    }

    clearFile() {
        this.tables.datasource.data = [];
        this.visions.datasource.data = [];
        this.procedures.datasource.data = [];
        this.tables.selection.clear();
        this.visions.selection.clear();
        this.procedures.selection.clear();
        this.fileName = null;
        this.fileLoaded = false;
    }

    public dropped(files: NgxFileDropEntry[]) {
        const me = this;
        files.forEach(x => {
            if (x.fileEntry.isFile) {
                const ext = UtilFunctions.getFileExtension(x.relativePath);
                if (ext.toLowerCase() !== '.lpx') {
                    this.messageService.open('Extensão não permitida', 'ERRO', 'error');
                    return;
                }
                const fileEntry = x.fileEntry as FileSystemFileEntry;

                fileEntry.file((file: File) => {
                    const formData = new FormData();
                    formData.append('file', file, file.name);

                    me.service.uploadLpx(formData).then(result => {

                        me.tables.datasource.data = result.tables.map(item => {
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
                                me.tables.selection.select(item.item);
                            }

                            return item.item;
                        });

                        me.visions.datasource.data = result.visions.map(item => {
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
                                me.visions.selection.select(item.item);
                            }

                            return item.item;
                        });

                        me.procedures.datasource.data = result.procedures.map(item => {
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
                                me.procedures.selection.select(item.item);
                            }

                            return item.item;
                        });
                        me.fileLoaded = true;
                        me.fileName = result.fileName;
                        me.changeDetectorRef.markForCheck();
                    });

                });
            }
        })

    }

    onLpxTypeChange(event: MatButtonToggleChange) {
        // Força atualização do drawer quando o tipo muda
        setTimeout(() => {
            if (event.value === 'TABLE' && this.tables) {
                this.tables.forceDrawerUpdate();
            } else if (event.value === 'VISION' && this.visions) {
                this.visions.forceDrawerUpdate();
            } else if (event.value === 'PROCEDURE' && this.procedures) {
                this.procedures.forceDrawerUpdate();
            }

            this.changeDetectorRef.detectChanges();
        }, 100);
    }
}
