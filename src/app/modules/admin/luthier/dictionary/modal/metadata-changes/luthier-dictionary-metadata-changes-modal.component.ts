import {ChangeDetectionStrategy, Component, ViewEncapsulation} from "@angular/core";
import {DatePipe, JsonPipe, NgClass, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Clipboard} from '@angular/cdk/clipboard';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {LuthierMetadataHistoryChangeModel} from '../../../../../../shared/models/luthier.model';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {LuthierDictionaryBeanChangesComponent} from '../bean-changes/luthier-dictionary-bean-changes.component';

@Component({
    selector       : 'luthier-dictionary-metadata-changes-modal',
    styleUrls      : ['/luthier-dictionary-metadata-changes-modal.component.scss'],
    templateUrl    : './luthier-dictionary-metadata-changes-modal.component.html',
    imports: [
        JsonPipe,
        DatePipe,
        NgIf,
        NgClass,
        CdkScrollable,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        SharedPipeModule,
        LuthierDictionaryBeanChangesComponent
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryMetadataChangesModalComponent
{
    model: LuthierMetadataHistoryChangeModel;
    title: string;
    constructor(public dialogRef: MatDialogRef<LuthierDictionaryMetadataChangesModalComponent>, public clipboard: Clipboard)
    {
    }

}
