import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {AsyncRequestModel, LogLevelEnum, LogModel} from '../../models/async_request.model';
import {FormsModule, NgModel} from '@angular/forms';
import {AsyncPipe, KeyValuePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {UtilFunctions} from '../../util/util-functions';
import {FuseMediaWatcherService} from '../../../../@fuse/services/media-watcher';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../pipes/shared-pipe.module';
import {CdkScrollable, ScrollingModule} from '@angular/cdk/scrolling';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';

export class FilterStatusModel {
    sTimeStampFrom: string = null;
    timeStampFrom: Date = null;
    sTimeStampTo: string = null;
    timeStampTo: Date = null;
    tempLevel: Array<LogLevelEnum> = [];
    level: Array<LogLevelEnum> = [];
    tempMessage: string = null;
    message: string = null;
}
export class JobModel {
    title?: string;
    delayedTime?: number;
    logs?: LogModel[];
    progress?: number;
}
@Component({
    selector: 'async-request-viewer',
    standalone: true,
    templateUrl: './async-request-viewer.component.html',
    styleUrls: ['./async-request-viewer.component.scss'],
    imports: [
        FormsModule,
        NgForOf,
        NgClass,
        NgIf,
        AsyncPipe,
        MatSidenavModule,
        MatButtonModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        NgxMaskDirective,
        SharedPipeModule,
        ScrollingModule,
        KeyValuePipe
    ],
    providers: [
        provideNgxMask(),
    ],

})
export class AsyncRequestViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('scrollableDiv') scrollableDivRef!: ElementRef<HTMLDivElement>;
    @ViewChild('matDrawerRight', {static: false}) sidenavRight: MatDrawer;
    private _model: AsyncRequestModel<any> = new AsyncRequestModel<any>();
    @Input()
    set model(model: AsyncRequestModel<any>) {
        if (model && model.log && model.log.logLevel) {
            this._model = model;
            if (!this.jobs) {
                this.jobs = {};
            }
            if (!this.jobs[model.jobName]) {
                this.jobs[model.jobName] = {};
                this.expandedJobs[model.jobName] = true;
            }
            if (!this.jobs[model.jobName].logs) {
                this.jobs[model.jobName].logs = [];
            }
            this.jobs[model.jobName].title = model.title;
            this.jobs[model.jobName].delayedTime = model.delayedTime;
            this.jobs[model.jobName].progress = model.progress;
            this.jobs[model.jobName].logs.push(model.log);

            if (this.filterData(model.log)) {
                let currentJobs = this.filteredJobs.getValue();
                if (currentJobs === null) {
                    currentJobs = {};
                }
                if (!currentJobs[model.jobName]) {
                    currentJobs[model.jobName] = {};
                }
                if (!currentJobs[model.jobName].logs) {
                    currentJobs[model.jobName].logs = [];
                }
                currentJobs[model.jobName].title = model.title;
                currentJobs[model.jobName].delayedTime = model.delayedTime;
                currentJobs[model.jobName].progress = model.progress;
                currentJobs[model.jobName].logs.push(model.log);
                this.filteredJobs.next(currentJobs);
                //this._changeDetectorRef.detectChanges();
                if (!this.userScrolled) {
                    setTimeout(() => this.scrollToBottom(), 0);
                }
            }
        }
    }
    get model(): AsyncRequestModel<any> {
        return this._model;
    }
    filter: FilterStatusModel = new FilterStatusModel();
    errorMessage: { from?: string; to?: string } = {};
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    LogLevelEnum = LogLevelEnum;
    private userScrolled = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    jobs: { [key: string]: JobModel };
    filteredJobs: BehaviorSubject<{ [key: string]: JobModel }> = new BehaviorSubject<{ [key: string]: JobModel }>(null);
    expandedJobs: Record<string, boolean> = {};
    compareJobKeys = () => 0;
    constructor(private _changeDetectorRef: ChangeDetectorRef,private _fuseMediaWatcherService: FuseMediaWatcherService,) {}

    ngOnInit() {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });
    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngAfterViewChecked() {
        if (!this.userScrolled) {
            setTimeout(() => this.scrollToBottom(), 300);
        }
    }

    filterData(data: LogModel): boolean {
        const timestamp = new Date(data.timeStamp);
        return (this.filter.level.length === 0 || this.filter.level.includes(data.logLevel as LogLevelEnum)) &&
            (this.filter.timeStampFrom === null || timestamp >= this.filter.timeStampFrom) &&
            (this.filter.timeStampTo === null || timestamp <= this.filter.timeStampTo) &&
            (this.filter.message === null || UtilFunctions.removeAccents(data.message).toLowerCase()
                .includes(UtilFunctions.removeAccents(this.filter.message).toLowerCase()));
    }

    filterLogs() {
        this.convertToDate('from', this.filter.sTimeStampFrom, null);
        this.convertToDate('to', this.filter.sTimeStampTo, null);
        this.filter.level = this.filter.tempLevel;
        this.filter.message = this.filter.tempMessage;

        const filteredJobs = Object.keys(this.jobs).reduce((acc, job) => {
            const jobLogs = this.jobs[job].logs.filter(log => {
                const timestamp = new Date(log.timeStamp);
                return (
                    (this.filter.level.length === 0 || this.filter.level.includes(log.logLevel as LogLevelEnum)) &&
                    (this.filter.timeStampFrom === null || timestamp >= this.filter.timeStampFrom) &&
                    (this.filter.timeStampTo === null || timestamp <= this.filter.timeStampTo) &&
                    (this.filter.message === null || UtilFunctions.removeAccents(log.message).toLowerCase()
                        .includes(UtilFunctions.removeAccents(this.filter.message).toLowerCase()))
                );
            });

            // Se o filtro retornar logs, adicione-os ao acumulador
            if (jobLogs.length > 0) {
                acc[job] = {
                    title: this.jobs[job].title,
                    delayedTime: this.jobs[job].delayedTime,
                    progress: this.jobs[job].progress,
                    logs: jobLogs
                };
            }

            return acc;
        }, {});
        this.filteredJobs.next(filteredJobs);
        this._changeDetectorRef.detectChanges();
    }

    convertToDate(field: 'from' | 'to', value: string, ngModelRef: NgModel) {
        if (UtilFunctions.isValidStringOrArray(value) === false) {

            if (ngModelRef) {
                this.errorMessage[field] = null;
                ngModelRef.control.setErrors(null);
            }
            else {
                this.filter[field === 'from' ? 'timeStampFrom' : 'timeStampTo'] = null;
            }
            return;
        }
        const dateParts = value.match(/(\d+)/g); // Extrai números
        if (dateParts && dateParts.length === 7) {
            const [day, month, year, hour, minute, second, millis] = dateParts.map(Number);
            // ✅ Validações de data
            if (
                month < 1 || month > 12 ||  // Mês inválido
                day < 1 || day > 31 ||      // Dia inválido
                hour < 0 || hour > 23 ||    // Hora inválida
                minute < 0 || minute > 59 ||// Minuto inválido
                second < 0 || second > 59 ||// Segundo inválido
                millis < 0 || millis > 999  // Milissegundo inválido
            ) {
                if (ngModelRef) {
                    this.errorMessage[field] = "Data/Hora inválida!";
                    ngModelRef.control.setErrors({invalidDate: true});
                }
                else {
                    this.setInvalidDate(field);
                }
                return;
            }

            // ✅ Criar data se válida
            const date = new Date(year, month - 1, day, hour, minute, second, millis);
            if (ngModelRef) {
                this.errorMessage[field] = ""; // Limpa erro
                ngModelRef.control.setErrors(null);
            }
            else {
                if (field === 'from') {
                    this.filter.timeStampFrom = date;
                } else {
                    this.filter.timeStampTo = date;
                }
            }

        } else {
            if (ngModelRef) {
                this.errorMessage[field] = "Formato inválido!";
                ngModelRef.control.setErrors({invalidDate: true});
            }
            else {
                this.setInvalidDate(field);
            }
        }
    }

    setInvalidDate(field: 'from' | 'to') {
        if (field === 'from') {
            this.filter.timeStampFrom = null;
        } else {
            this.filter.timeStampTo = null;
        }
    }

    scrollToBottom() {
        const element = this.scrollableDivRef?.nativeElement;
        if (element) {
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
        }
    }

    onUserScroll() {
        const element = this.scrollableDivRef?.nativeElement;
        const nearBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
        this.userScrolled = !nearBottom;
    }

    toggleMatRight() {
        this.sidenavRight.toggle();
    }

    limpar() {
        this.filter = new FilterStatusModel();
        this.errorMessage = {};
        this.filterLogs();
    }

    toggleJob(title: string): void {
        this.expandedJobs[title] = !this.expandedJobs[title];
    }
}
