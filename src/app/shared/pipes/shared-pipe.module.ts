import {NgModule} from '@angular/core';
import {EnumToArrayPipe, FilterJsonPipe, IsValidStringOrArrayPipe} from './util-functions.pipe';

@NgModule({
    declarations : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        FilterJsonPipe
    ],
    exports : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        FilterJsonPipe
    ]
})
export class SharedPipeModule {

}
