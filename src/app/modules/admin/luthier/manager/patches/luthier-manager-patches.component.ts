import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LuthierManagerComponent} from '../luthier-manager.component';
import {LuthierService} from '../../luthier.service';
import {LuthierManagerPatchesLedComponent} from './led/luthier-manager-patches-led.component';
import {LuthierManagerPatchesLpxComponent} from './lpx/luthier-manager-patches-lpx.component';
import {LuthierManagerPatchesLupComponent} from './lup/luthier-manager-patches-lup.component';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';

export type PatchType = 'LED' | 'LUP' | 'LPX';
@Component({
    selector: 'luthier-manager-patches',
    templateUrl: './luthier-manager-patches.component.html',
    styleUrls: ['/luthier-manager-patches.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonToggleModule,
        FormsModule,
        LuthierManagerPatchesLedComponent,
        LuthierManagerPatchesLpxComponent,
        LuthierManagerPatchesLupComponent
    ]
})
export class LuthierManagerPatchesComponent {
    patchType: PatchType = null;
    @Input('import')
    import: boolean = false;
    get service(): LuthierService {
        if (this._parent != null) {
            return this._parent.service;
        }
        return null;

    }
    get messageService(): MessageDialogService {
        if (this._parent != null) {
            return this._parent.messageService;
        }
        return null;
    }
    constructor(private _parent: LuthierManagerComponent) {
    }
}
