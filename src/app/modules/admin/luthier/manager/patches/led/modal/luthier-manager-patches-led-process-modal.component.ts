import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgFor, NgIf} from '@angular/common';
import {LedImportModel} from '../../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../../luthier.service';
import {LuthierManagerPatchesLedComponent} from '../luthier-manager-patches-led.component';
import {
    AsyncRequestViewerComponent
} from '../../../../../../../shared/components/async-request-viewer/async-request-viewer.component';
import {AsyncRequestModel} from '../../../../../../../shared/models/async_request.model';
import {UtilFunctions} from '../../../../../../../shared/util/util-functions';
import {saveAs} from 'file-saver';


@Component({
    selector       : 'luthier-manager-patches-led-process-modal',
    styleUrls      : ['/luthier-manager-patches-led-process-modal.component.scss'],
    templateUrl    : './luthier-manager-patches-led-process-modal.component.html',
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        NgFor,
        MatDialogModule,
        AsyncRequestViewerComponent,
        NgIf
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierManagerPatchesLedProcessModalComponent implements OnInit, OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public isImport: boolean = true;
    public model: LedImportModel | Array<number>;
    protected asyncModel : AsyncRequestModel<LedImportModel | {link: string, fileName: string} | any> = new AsyncRequestModel<LedImportModel | {link: string, fileName: string} | any>();
    title: string;
    private _service: LuthierService;
    private _parent: LuthierManagerPatchesLedComponent;
    private abortFn: () => void = () => {};


    set parent(value: LuthierManagerPatchesLedComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierManagerPatchesLedComponent {
        return  this._parent;
    }

    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierManagerPatchesLedProcessModalComponent>)
    {
    }

    ngOnInit(): void {
        if (this.isImport === true) {
            this.abortFn = this._service.processLed(this.model as LedImportModel, (data: AsyncRequestModel<LedImportModel>) => {
                this.asyncModel = data;
                if (data.finalized) {
                    this.parent.messageService.open('Processo finalizado!', 'SUCESSO', 'success');
                }
                this._changeDetectorRef.detectChanges();
            });
        }
        else {
            this.abortFn = this._service.generateLedAsync(this.model as Array<number>, (data: AsyncRequestModel<{link: string, fileName: string}>) => {
                this.asyncModel = data;
                if (data.finalized) {
                    if (UtilFunctions.isValidStringOrArray(this.asyncModel?.data.link) === true) {
                        this._service.download(data.data.link)
                            .then(blob => {
                                saveAs(blob, data.data.fileName);// Handle successful download
                                this.parent.messageService.open(`Processo finalizado! Verifique nos downloads do navegador. O arquivo se chama ${data.data.fileName}`, 'SUCESSO', 'success');
                            })

                    }
                    else {
                        this.parent.messageService.open('Nenhum arquivo foi gerado!', 'ERRO', 'error');
                    }
                }
                this._changeDetectorRef.detectChanges();
            });
        }

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this.abortFn();
    }

    cancel() {
        if (!this.asyncModel.finalized) {
            this.parent.messageService.open('Deseja realmente cancelar o processo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
                    if (result === 'confirmed') {
                        this.abortFn();
                    }
                }
            );
        }

    }

    close() {
        if (!this.asyncModel.finalized) {
            this.parent.messageService.open('Deseja realmente cancelar o processo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
                    if (result === 'confirmed') {
                        this.abortFn();
                        this.dialogRef.close(true);
                    }
                }
            );
        }
        else {
            this.dialogRef.close(true);
        }
    }
}
