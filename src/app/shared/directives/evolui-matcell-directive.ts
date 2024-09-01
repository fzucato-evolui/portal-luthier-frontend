import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {MatColumnDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {LuthierBasicModel} from '../models/luthier.model';
import {UtilFunctions} from '../util/util-functions';
import {Subject, takeUntil} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';

@Directive({
    selector: '[evoluiMatCell]',
    providers: [MatTooltip]
})
export class EvoluiMatcellDirective implements OnInit, OnDestroy {
    @Input('evoluiMatCell') row: LuthierBasicModel;
    datasource: MatTableDataSource<LuthierBasicModel>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @HostListener('mouseover') mouseover() {
        if (this.tooltip && UtilFunctions.isValidStringOrArray(this.tooltip.message)) {
            this.tooltip.show();
        }
    }
    @HostListener('mouseleave') mouseleave() {
        this.tooltip.hide();
    }
    constructor(
        private matTable: MatTable<any>,
        private matColumnDef: MatColumnDef,
        private el: ElementRef,
        private tooltip: MatTooltip,
        private renderer: Renderer2
    ) {
        this.datasource = matTable.dataSource as MatTableDataSource<LuthierBasicModel>;
    }

    ngOnInit(): void {
        this.datasource.connect()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(data => {
                if (!this.row.pending && UtilFunctions.isValidStringOrArray(this.row.invalidFields) === true &&
                    UtilFunctions.isValidStringOrArray(this.row.invalidFields[this.matColumnDef.name])) {
                    this.renderer.addClass(this.el.nativeElement, 'invalid-cell-border');
                    if (this.tooltip) {
                        this.tooltip.message = JSON.stringify(this.row.invalidFields[this.matColumnDef.name]);
                    }
                    //this.renderer.setAttribute(this.el.nativeElement, 'matTooltip', JSON.stringify(this.row.invalidFields[this.matColumnDef.name]));
                } else {
                    this.renderer.removeClass(this.el.nativeElement, 'invalid-cell-border');
                    if (this.tooltip) {
                        this.tooltip.message = '';
                    }
                    //this.renderer.setAttribute(this.el.nativeElement, 'matTooltip', "");
                }
            });


    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
