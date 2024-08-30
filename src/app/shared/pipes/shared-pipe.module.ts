import {NgModule} from '@angular/core';
import {EnumToArrayPipe, FilterJsonPipe, IsValidObjectPipe, IsValidStringOrArrayPipe} from './util-functions.pipe';

@NgModule({
    declarations : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        IsValidObjectPipe,
        FilterJsonPipe
    ],
    exports : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        IsValidObjectPipe,
        FilterJsonPipe
    ]
})
export class SharedPipeModule {

}
