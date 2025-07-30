import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {PortalStorageService} from '../portal-storage.service';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {AsyncRequestModel} from '../../../../../shared/models/async_request.model';
import {
    AsyncRequestViewerComponent
} from '../../../../../shared/components/async-request-viewer/async-request-viewer.component';
import {saveAs} from 'file-saver';

export interface StorageDownloadRootFilesModalData {
    rootId: number;
    rootIdentifier: string;
}

@Component({
    selector: 'portal-storage-download-root-files',
    styleUrls: ['./portal-storage-download-root-files.component.scss'],
    templateUrl: './portal-storage-download-root-files.component.html',
    imports: [
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        AsyncRequestViewerComponent
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
})
export class PortalStorageDownloadRootFilesComponent implements OnInit, OnDestroy {

    data: StorageDownloadRootFilesModalData;
    title: string = '';
    protected asyncModel: AsyncRequestModel<{ link: string, fileName: string } | any> = new AsyncRequestModel<{ link: string, fileName: string } | any>();

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private abortFn: () => void = () => {};

    constructor(
        private _storageService: PortalStorageService,
        private _messageService: MessageDialogService,
        private _changeDetectorRef: ChangeDetectorRef,
        public dialogRef: MatDialogRef<PortalStorageDownloadRootFilesComponent>
    ) {}

    ngOnInit(): void {
        this.title = `Download dos arquivos do armazenamento: ${this.data.rootIdentifier}`;

        this.abortFn = this._storageService.downloadRootFilesAsync(
            this.data.rootId,
            (data: AsyncRequestModel<{ token: string, fileName: string }>) => {
                this.asyncModel = data;
                if (data.finalized) {
                    if (data.data && data.data.token) {
                        const token = data.data.token;

                        this._storageService.downloadZipByToken(token)
                            .subscribe({
                                next: (blob) => {
                                    saveAs(blob, data.data.fileName);
                                    this._messageService.open(
                                        `Download concluído! O arquivo ${data.data.fileName} foi baixado.`,
                                        'SUCESSO',
                                        'success'
                                    );
                                },
                                error: (error) => {
                                    console.error('Error downloading file:', error);
                                    this._messageService.open('Erro ao baixar arquivo', 'ERRO', 'error');
                                }
                            });
                    } else {
                        this._messageService.open('Nenhum arquivo foi gerado!', 'ERRO', 'error');
                    }
                }
                this._changeDetectorRef.detectChanges();
            }
        );
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
        this.abortFn();
    }

    cancel(): void {
        if (!this.asyncModel.finalized) {
            this._messageService.open('Deseja realmente cancelar o processo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
                if (result === 'confirmed') {
                    this.abortFn();
                }
            });
        }
    }

    close(): void {
        if (!this.asyncModel.finalized) {
            this._messageService.open('Deseja realmente cancelar o processo?', 'CONFIRMAÇÃO', 'confirm').subscribe((result) => {
                if (result === 'confirmed') {
                    this.abortFn();
                    this.dialogRef.close(true);
                }
            });
        } else {
            this.dialogRef.close(true);
        }
    }
}
