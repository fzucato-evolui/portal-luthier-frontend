import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UtilFunctions} from "app/shared/util/util-functions";
import {cloneDeep} from "lodash-es";
import {
    GoogleConfigModel,
    GoogleServiceAccountModel,
    SystemConfigModel,
    SystemConfigModelEnum
} from '../../../../../shared/models/system-config.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {PortalConfigComponent} from '../portal-config.component';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {JsonPipe, NgClass, NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgxFileDropEntry, NgxFileDropModule} from 'ngx-file-drop';


@Component({
    selector: 'portal-config-google',
    templateUrl: './portal-config-google.component.html',
    styleUrls: ['./portal-config-google.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatInputModule,
        MatIconModule,
        NgxFileDropModule,
        JsonPipe,
        MatButtonModule,
        NgClass,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        NgIf
    ]
})
export class PortalConfigGoogleComponent implements OnInit{
  googleForm: FormGroup;
  _model: SystemConfigModel = new SystemConfigModel();
  @Input()
  set model(value: SystemConfigModel) {
    if (value && value.id !== this._model.id) {
      this._model = cloneDeep(value);
      this.init();
    }
  };

  get model(): SystemConfigModel {
    return this._model;
  }

  googleModel: GoogleConfigModel;

  constructor(
    private _formBuilder: FormBuilder,
    private _messageService: MessageDialogService,
    private _changeDetectorRef: ChangeDetectorRef,
    public parent: PortalConfigComponent
  )
  {
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    if (!this.googleForm) {
      this.googleForm = this._formBuilder.group({
        apiKey: ['', []],
        clientID: ['', []],
        secretKey: ['', []],
      });
    }
    this.googleModel = new GoogleConfigModel();
    if (this.model && this.model.id > 0 && this.model.configType === SystemConfigModelEnum.GOOGLE) {
      this.googleModel = this.model.config ? this.model.config as GoogleConfigModel : new GoogleConfigModel();
    }
    this.googleForm.patchValue({
      apiKey: this.googleModel.apiKey,
      clientID: this.googleModel.clientID,
      secretKey: this.googleModel.secretKey,
    });
  }

  salvar() {
    this.model.configType = SystemConfigModelEnum.GOOGLE;
    this.googleModel = {...this.googleForm.value, ... this.googleModel};
    this.model.config = this.googleModel;
    this.parent.service.save(this.model)
      .then(value => {
        this.model = value;
        this._messageService.open('Configuração de Sistema para autenticação Google salva com sucesso', 'SUCESSO', 'success');
      });
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.googleModel.serviceAccount = null;
    const me = this;
    files.forEach(x => {
      if (x.fileEntry.isFile) {
        const ext = UtilFunctions.getFileExtension(x.relativePath);
        if (ext !== '.json') {
          this._messageService.open('Extensão não permitida', 'ERRO', 'error');
          return;
        }
        const fileEntry = x.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          file.arrayBuffer().then( buffer=> {
            const googleServiceAccount: GoogleServiceAccountModel = JSON.parse(UtilFunctions.arrayBufferToString(buffer));
            if (!GoogleServiceAccountModel.validate(googleServiceAccount)) {
              throw Error("Arquivo inválido");
            }
            me.googleModel.serviceAccount = googleServiceAccount;
            me._changeDetectorRef.markForCheck();

            setTimeout(function () { //Para atualizar o vídeo
              me._changeDetectorRef.markForCheck();
            }, 200);

          }).catch(reason => {
            me._messageService.open(reason, 'ERRO', 'error');
          }).finally(() => {

          });

        });
      }
    })

  }

  isValidConfigJson () {
    if (this.googleModel && this.googleModel.serviceAccount) {
      GoogleServiceAccountModel.validate(this.googleModel.serviceAccount);
    }
    return true;
  }

}
