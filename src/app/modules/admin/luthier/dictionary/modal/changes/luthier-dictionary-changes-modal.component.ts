import {ChangeDetectionStrategy, Component, ViewEncapsulation} from "@angular/core";
import {JsonPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
    selector       : 'luthier-dictionary-changes-modal',
    styleUrls      : ['/luthier-dictionary-changes-modal.component.scss'],
    templateUrl    : './luthier-dictionary-changes-modal.component.html',
    imports: [
        JsonPipe,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule

    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryChangesModalComponent
{
    model: any;
    title: string;
    constructor(public dialogRef: MatDialogRef<LuthierDictionaryChangesModalComponent>, public clipboard: Clipboard)
    {
    }

    copy() {
        this.clipboard.copy(JSON.stringify(this.model));
    }
}
