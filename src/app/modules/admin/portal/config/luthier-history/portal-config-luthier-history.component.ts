import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {cloneDeep} from "lodash-es";
import {
    PortalLuthierHistoryConfigModel,
    SystemConfigModel,
    SystemConfigModelEnum
} from '../../../../../shared/models/system-config.model';
import {MessageDialogService} from '../../../../../shared/services/message/message-dialog-service';
import {PortalConfigComponent} from '../portal-config.component';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {NgxMaskDirective, provideNgxMask} from 'ngx-mask';
import {MatTooltipModule} from '@angular/material/tooltip';


@Component({
    selector: 'portal-config-luthier-history',
    templateUrl: './portal-config-luthier-history.component.html',
    styleUrls: ['./portal-config-luthier-history.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatSlideToggleModule,
        NgxMaskDirective,
    ],
    providers: [
        provideNgxMask(),
    ],
})
export class PortalConfigLuthierHistoryComponent implements OnInit{
  luthierHistoryForm: FormGroup;
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

  luthierHistoryModel: PortalLuthierHistoryConfigModel;

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
    if (!this.luthierHistoryForm) {
      this.luthierHistoryForm = this._formBuilder.group({
        enabled: [true, []],
        daysToKeep: ['', []]
      });
    }
    this.luthierHistoryModel = new PortalLuthierHistoryConfigModel();
    if (this.model && this.model.id > 0 && this.model.configType === SystemConfigModelEnum.LUTHIER_HISTORY) {
      this.luthierHistoryModel = this.model.config ? this.model.config as PortalLuthierHistoryConfigModel : new PortalLuthierHistoryConfigModel();
    }
    this.luthierHistoryForm.patchValue({
      enabled: this.luthierHistoryModel.enabled,
      daysToKeep: this.luthierHistoryModel.daysToKeep
    });
  }

  salvar() {
    this.model.configType = SystemConfigModelEnum.LUTHIER_HISTORY;
    this.luthierHistoryModel = this.luthierHistoryForm.value;
    this.model.config = this.luthierHistoryModel;
    this.parent.service.save(this.model)
      .then(value => {
        this.model = value;
        this._messageService.open('Configuração de Histórico do Luthier salva com sucesso', 'SUCESSO', 'success');
      });
  }

}
