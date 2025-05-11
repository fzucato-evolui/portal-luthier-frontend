export enum LogLevelEnum {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    TRACE = 'TRACE'
}

export class LogModel {
    timeStamp: string;
    message: string;
    logLevel: LogLevelEnum | string;
    formattedMessage: string;
}

export class AsyncRequestModel<T> {
    finalized: boolean;
    progress: number;
    title: string;
    data: T;
    log: LogModel;
    jobName: string;
    delayedTime: number;
}
