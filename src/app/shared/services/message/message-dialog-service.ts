import {Injectable} from "@angular/core";
import {Observable} from "rxjs/internal/Observable";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmationDialogComponent} from '../../../modules/admin/ui/confirmation-dialog/confirmation-dialog.component';
import {FuseConfirmationConfig, FuseConfirmationService} from '../../../../@fuse/services/confirmation';

@Injectable({providedIn: 'root'})
export class MessageDialogService {
  private _defaultConfig: DialogConfirmationConfig = {
    title      : 'Confirm action',
    message    : 'Are you sure you want to confirm this action?',
    icon       : {
      show : true,
      name : 'fa-exclamation-circle',
      color: 'warn'
    },
    actions    : {
      confirm: {
        show : true,
        label: 'Confirm',
        color: 'warn'
      },
      cancel : {
        show : true,
        label: 'Cancel'
      }
    },
    dismissible: false
  };
    constructor(private _matDialog: MatDialog, private _fuseConfirmationService: FuseConfirmationService) {

    }

    public open(message: string, title: string, mode: 'info' | 'warning' | 'success' | 'error' | 'confirm'): Observable<any> {
        let icon = 'heroicons_outline:information-circle';
        let color: any = mode;
        let buttonYes = "OK";
        if (mode === 'warning') {
          icon = 'fa-exclamation-circle';
        } else if (mode === 'info') {
            icon = 'fa-info-circle';
        } else if (mode === 'success') {
            icon = 'fa-thumbs-up';
        } else if (mode === 'error') {
            icon = 'fa-times';
        } else if (mode === 'confirm') {
            icon = 'fa-question-circle';
            color = 'accent';
            buttonYes = 'SIM';
        }
        const config: FuseConfirmationConfig = {
            title      : title,
            message    : message,
            icon       : {
                show : true,
                name : icon,
                color : color
            },
            actions    : {
                confirm: {
                    show : true,
                    color: "primary",
                    label: buttonYes
                },
                cancel : {
                    show : mode === 'confirm',
                    label: "NÃO"
                }
            },
            dismissible: false
        };

        const dialogRef = this._fuseConfirmationService.open(config);

        return dialogRef.afterClosed();
    }

  openDialog(config: DialogConfirmationConfig = {}): MatDialogRef<ConfirmationDialogComponent>
  {
    // Merge the user config with the default config
    const userConfig = {...this._defaultConfig, ...config};

    // Open the dialog
    return this._matDialog.open(ConfirmationDialogComponent, {
      autoFocus   : false,
      disableClose: !userConfig.dismissible,
      data        : userConfig,
      panelClass  : 'fuse-confirmation-dialog-panel'
    });
  }
}
export interface DialogConfirmationConfig
{
  title?: string;
  message?: string;
  icon?: {
    show?: boolean;
    font?: string;
    name?: string;
    color?: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';
  };
  actions?: {
    confirm?: {
      show?: boolean;
      label?: string;
      color?: 'primary' | 'accent' | 'warn';
    };
    cancel?: {
      show?: boolean;
      label?: string;
    };
  };
  dismissible?: boolean;
}

