import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {NgClass, NgFor, NgIf} from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {BeanChangeModel} from '../../../../../../shared/models/luthier.model';

@Component({
    selector       : 'luthier-dictionary-bean-changes',
    templateUrl    : './luthier-dictionary-bean-changes.component.html',
    styleUrls      : ['./luthier-dictionary-bean-changes.component.scss'],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        MatExpansionModule,
        MatIconModule,
        MatTooltipModule,
        MatTabsModule
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierDictionaryBeanChangesComponent
{
    @Input() changes: BeanChangeModel[] = [];
    @Input() level: number = 0;

    getChangeTypeColor(changeType: string | undefined): string {
        switch (changeType) {
            case 'CREATE':
                return 'text-green-600';
            case 'UPDATE':
                return 'text-blue-600';
            case 'DELETE':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    }

    getChangeTypeIcon(changeType: string | undefined): string {
        switch (changeType) {
            case 'CREATE':
                return 'fa-plus-circle';
            case 'UPDATE':
                return 'fa-edit';
            case 'DELETE':
                return 'fa-trash';
            default:
                return 'fa-question-circle';
        }
    }

    hasNestedChanges(change: BeanChangeModel): boolean {
        return change.changes !== undefined && change.changes.length > 0;
    }
}
