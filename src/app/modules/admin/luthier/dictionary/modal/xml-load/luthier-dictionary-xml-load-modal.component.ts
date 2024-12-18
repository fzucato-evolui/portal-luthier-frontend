import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {JsonPipe, NgIf} from '@angular/common';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {LuthierGenerateLoadXMLModel} from '../../../../../../shared/models/luthier.model';
import {LuthierService} from '../../../luthier.service';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {LuthierDictionaryComponent} from '../../luthier-dictionary.component';
import {saveAs} from 'file-saver';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@Component({
    selector       : 'luthier-dictionary-xml-load-modal',
    styleUrls      : ['/luthier-dictionary-xml-load-modal.component.scss'],
    templateUrl    : './luthier-dictionary-xml-load-modal.component.html',
    imports: [
        FormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatDialogModule,
        JsonPipe,
        NgIf,
        SharedPipeModule,
        MatSlideToggleModule
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryXmlLoadModalComponent implements OnInit, OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public model: LuthierGenerateLoadXMLModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierDictionaryComponent;

    set parent(value: LuthierDictionaryComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierDictionaryComponent {
        return  this._parent;
    }

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierDictionaryXmlLoadModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    generate() {
        this._service.generateXMLLoad(this.model).then(value => {
            const blob = new Blob([value.xml], {type: "text/plain;charset=utf-8"});
            saveAs(blob, value.fileName);
        });


    }

}
