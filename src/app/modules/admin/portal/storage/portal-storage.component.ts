import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from '@angular/router';

@Component({
    selector: 'portal-storage',
    template: `
        <div class="flex flex-col w-full h-full overflow-hidden">
            <router-outlet></router-outlet>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterOutlet],
})
export class PortalStorageComponent {
    constructor() {}
}
