import {NgModule} from '@angular/core';
import {
    AsFormControlPipe,
    AsFormGroupPipe,
    EnumToArrayPipe,
    EnumTranslatePipe,
    FilterJsonPipe,
    IsValidObjectPipe,
    IsValidStringOrArrayPipe,
    SimNaoPipe
} from './util-functions.pipe';

@NgModule({
    declarations : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        IsValidObjectPipe,
        FilterJsonPipe,
        AsFormGroupPipe,
        AsFormControlPipe,
        EnumTranslatePipe,
        SimNaoPipe
    ],
    exports : [
        EnumToArrayPipe,
        IsValidStringOrArrayPipe,
        IsValidObjectPipe,
        FilterJsonPipe,
        AsFormGroupPipe,
        AsFormControlPipe,
        EnumTranslatePipe,
        SimNaoPipe
    ]
})
export class SharedPipeModule {

}
