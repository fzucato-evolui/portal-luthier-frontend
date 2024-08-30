import {NgModule} from '@angular/core';
import {EvoluiMatcellDirective} from './evolui-matcell-directive';

@NgModule({
    declarations : [
        EvoluiMatcellDirective
    ],
    exports : [
        EvoluiMatcellDirective
    ]
})
export class SharedDirectiveModule {

}
