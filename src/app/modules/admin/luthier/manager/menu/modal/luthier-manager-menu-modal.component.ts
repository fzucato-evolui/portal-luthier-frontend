import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {LuthierManagerMenuComponent} from '../luthier-manager-menu.component';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NgFor, NgIf} from '@angular/common';
import {provideNgxMask} from 'ngx-mask';
import {SharedPipeModule} from '../../../../../../shared/pipes/shared-pipe.module';
import {LuthierService} from '../../../luthier.service';
import {MessageDialogService} from '../../../../../../shared/services/message/message-dialog-service';
import {UtilFunctions} from '../../../../../../shared/util/util-functions';
import {
    LuthierMenuActionTypeEnum,
    LuthierMenuCompTypeEnum,
    LuthierMenuModel,
    LuthierMenuTypeEnum,
    LuthierMenuVisibilityEnum,
    LuthierResourceModel,
    LuthierUserModel
} from '../../../../../../shared/models/luthier.model';
import {MatSlideToggleChange, MatSlideToggleModule} from '@angular/material/slide-toggle';
import {LuthierManagerMenutreeComponent} from '../../menutree/luthier-manager-menutree.component';
import {DOMParser, XMLSerializer} from '@xmldom/xmldom';
import {MatTabsModule} from '@angular/material/tabs';

type Dictionary = Record<string, string>;

const dictionary: Dictionary = {
    // XML e comandos
    'LUTHIER_UI_COMMAND': 'COMANDO_INTERFACE',
    'COMMAND': 'COMANDO',
    'PARAMS': 'PARAMETROS',
    'PARAM': 'PARAMETRO',
    'OPEN': 'ABRIR',
    'TABLE': 'TABELA',
    'CREATE': 'CRIAR',
    'EDIT': 'ALTERAR',
    'VISION': 'VISAO',
    'LIST': 'LISTAGEM',
    'REPORT': 'RELATORIO',
    'EXECUTE': 'EXECUTAR',
    'INTEROP': 'INTEROPERABILIDADE',
    'HELPDESK': 'SUPORTE',
    'QUERY': 'CONSULTA',
    'VIEW': 'VISUALIZAR',
    'TYPE': 'TIPO',
    'NAME': 'NOME',
    'VALUE': 'VALOR',

    // Comandos LuthierUICommandType
    'OPEN_WINDOW': 'ABRIR_JANELA',
    'OPEN_TABLE_CREATE': 'ABRIR_CRIACAO_TABELA',
    'OPEN_TABLE_EDIT': 'ABRIR_EDICAO_TABELA',
    'OPEN_VISION_CREATE': 'ABRIR_CRIACAO_VISAO',
    'OPEN_TABLE_LIST': 'ABRIR_LISTAGEM_TABELA',
    'OPEN_VISION_LIST': 'ABRIR_LISTAGEM_VISAO',
    'OPEN_VISION_EDIT': 'ABRIR_EDICAO_VISAO',
    'OPEN_REPORT': 'ABRIR_RELATORIO',
    'EXECUTE_REPORT': 'EXECUTAR_RELATORIO',
    'OPEN_INTEROP_WINDOW': 'ABRIR_JANELA_INTEROPERABILIDADE',
    'OPEN_HELPDESK': 'ABRIR_SUPORTE',
    'OPEN_QUERY': 'ABRIR_CONSULTA',
    'VIEW_REPORT': 'VISUALIZAR_RELATORIO',

    // LuthierWindowDockStyle
    'MODAL': 'MODAL',
    'WINDOW': 'JANELA',
    'TAB': 'ABA',
    'POPUP': 'POPUP',
    'FULLSCREEN': 'TELA_CHEIA',

    // metadata
    'metadata': 'metadados',
    'dataset': 'conjuntoDados',
    'child': 'detalhe',
    'children': 'detalhes',
    'name': 'nome',
    'names': 'nomes',
    'show': 'exibir',
    'fieldOrder': 'ordemCampos',
    'openAllData': 'abrirTodosDados',
    'editable': 'editaveis',

    // window e toolbar
    'window': 'janela',
    'toolbar': 'barraferramentas',
    'buttons': 'botoes',
    'visible': 'visivel',
    'new': 'novo',
    'add': 'inserir',
    'view': 'visualizar',
    'edit': 'alterar',
    'delete': 'excluir',
    'dockType': 'tipoExibicao',
    'controller': 'controle',
    'record': 'gravar',
    'initMethod': 'metodoInicial',
    'params': 'parametros',
    'save': 'salvar',
    'class': 'classe',
    'type': 'tipo',
    'returnMode': 'modoRetorno',
    'report': 'relatorio',
    'dock': 'tipoExibicao',
    'title': 'titulo',
    'background': 'segundoPlano',
    'layout': 'layout',
    'notification': 'notificacao',

    // outros
    'true': 'sim',
    'false': 'nao',
    'seachpanel': 'painelpesquisa',
    'doubleClickEdit': 'editarCliqueDuplo',
    'markselected': 'marcarSelecionado',
    'multipleselected': 'selecaoMultipla',

    //parametros de comando
    'metadata.name': 'metadados.nome',
    'metadata.dataset.name': 'metadados.conjuntoDados.nome',
    'metadata.dataset.child.show': 'metadados.conjuntoDados.detalhe.exibir',
    'metadata.dataset.child.names': 'metadados.conjuntoDados.detalhe.nomes',
    'metadata.dataset.child.fieldOrder': 'metadados.conjuntoDados.detalhe.ordemCampos',
    'metadata.openAllData': 'metadados.abrirTodosDados',
    'metadata.fieldOrder': 'metadados.ordemCampos',
    'metadata.children.edit': 'metadados.detalhes.alterar',
    'metadata.editable.children': 'metadados.detalhes.editaveis',

    // window e toolbar
    'window.toolbar.dataset.buttons.new.add.visible': 'janela.barraferramentas.conjuntoDados.botoes.novo.inserir.visivel',
    'window.toolbar.dataset.buttons.view.add.visible': 'janela.barraferramentas.conjuntoDados.botoes.visualizar.inserir.visivel',
    'window.toolbar.dataset.buttons.edit.add.visible': 'janela.barraferramentas.conjuntoDados.botoes.alterar.inserir.visivel',
    'window.toolbar.dataset.buttons.delete.add.visible': 'janela.barraferramentas.conjuntoDados.botoes.excluir.inserir.visivel',

    'window.dataset.multipleselected': 'janela.conjuntoDados.selecaoMultipla',
    'window.dataset.save': 'janela.conjuntoDados.salvar',
    'window.dataset.layout': 'janela.conjuntoDados.layout',
    'window.child.record.controller': 'janela.detalhe.gravar.controle',
    'window.edit.child.controller': 'janela.alterar.detalhe.controle',
    'window.dataset.markselected': 'janela.conjuntoDados.marcarSelecionado',
    'window.child.doubleClickEdit': 'janela.detalhe.editarCliqueDuplo',

    'window.dockType': 'janela.tipoExibicao',
    'window.toolbar.buttons.add.visible': 'janela.barraferramentas.botoes.inserir.visivel',
    'window.toolbar.buttons.view.visible': 'janela.barraferramentas.botoes.visualizar.visivel',
    'window.toolbar.buttons.edit.visible': 'janela.barraferramentas.botoes.alterar.visivel',
    'window.toolbar.buttons.delete.visible': 'janela.barraferramentas.botoes.excluir.visivel',
    'window.seachpanel.visible': 'janela.painelpesquisa.visivel',
    'window.controller.name': 'janela.controle.nome',
    'window.record.controller.name': 'janela.gravar.controle.nome',
    'window.record.dockType': 'janela.gravar.tipoExibicao',
    'window.closeAfterSave': 'janela.fecharAposSalvar',
    'window.insertNewAfterSave': 'janela.inserirNovoAposSalvar',
    'window.closeAfterCancel': 'janela.fecharAposCancelar',
    'window.title': 'janela.titulo',
    'window.singleWindow': 'janela.telaUnica',
    'window.record.returnMode': 'janela.gravar.modoRetorno',
    'window.doubleClickEdit': 'janela.editarCliqueDuplo',
    'window.record.window': 'janela.gravar.janela',
    'window.controller.initMethod.name': 'janela.controle.metodoInicial.nome',
    'window.controller.initMethod.params': 'janela.controle.metodoInicial.parametros',
    'window.delete.class': 'janela.excluir.classe',
    'window.delete.type': 'janela.excluir.tipo',
    'window.record.controller.initMethod.name': 'janela.gravar.controle.metodoInicial.nome',
    'window.record.controller.initMethod.params': 'janela.gravar.controle.metodoInicial.parametros',
    'window.record.save.class': 'janela.gravar.salvar.classe',
    'window.record.save.type': 'janela.gravar.salvar.tipo',
    'window.report.name': 'janela.relatorio.nome',
    'window.report.backgroud': 'janela.relatorio.segundoPlano',
    'window.report.notification': 'janela.relatorio.notificacao',
    'window.report.controller.name': 'janela.relatorio.controle.nome',
    'window.report.closeAfterGenerate': 'janela.relatorio.fecharAposGerar',
    'window.report.title': 'janela.relatorio.titulo',
    'window.report.dockType': 'janela.relatorio.tipoExibicao',
    'window.child.layout': 'janela.detalhe.layout',
};

const reverseDictionary: Dictionary = Object.fromEntries(
    Object.entries(dictionary).map(([k, v]) => [v, k])
);

@Component({
    selector       : 'luthier-manager-menu-modal',
    styleUrls      : ['/luthier-manager-menu-modal.component.scss'],
    templateUrl    : './luthier-manager-menu-modal.component.html',
    imports: [
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        NgFor,
        MatDialogModule,
        NgIf,
        SharedPipeModule,
        MatSlideToggleModule,
        MatTabsModule,
        FormsModule
    ],
    providers: [
        provideNgxMask(),
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
})
export class LuthierManagerMenuModalComponent implements OnInit, OnDestroy
{
    formSave: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    private _model: LuthierMenuModel;
    title: string;
    private _service: LuthierService;
    private _parent: LuthierManagerMenuComponent | LuthierManagerMenutreeComponent;
    myUser: LuthierUserModel;
    LuthierMenuCompTypeEnum = LuthierMenuCompTypeEnum;
    LuthierMenuTypeEnum = LuthierMenuTypeEnum;
    LuthierMenuActionTypeEnum = LuthierMenuActionTypeEnum;
    LuthierMenuVisibilityEnum = LuthierMenuVisibilityEnum;
    resources: Array<LuthierResourceModel>;
    public customPatterns = { 'I': { pattern: new RegExp('\[a-zA-Z0-9_\.\]')} };
    portugol = false;

    set parent(value: LuthierManagerMenuComponent | LuthierManagerMenutreeComponent) {
        this._parent = value;
        this._service = this.parent.service;
    }

    get parent(): LuthierManagerMenuComponent | LuthierManagerMenutreeComponent {
        return  this._parent;
    }

    set model(value: LuthierMenuModel) {
        this._model = value;
    }

    get model(): LuthierMenuModel {
        return  this._model;
    }

    constructor(private _formBuilder: FormBuilder,
                private _changeDetectorRef: ChangeDetectorRef,
                public dialogRef: MatDialogRef<LuthierManagerMenuModalComponent>,
                private _messageService: MessageDialogService)
    {
    }

    ngOnInit(): void {
        this.formSave = this._formBuilder.group({
            code: [null],
            caption: ['', [Validators.required]],
            compType: [null, [Validators.required]],
            type: [null, [Validators.required]],
            actionType: [null, [Validators.required]],
            action: [''],
            visibility: [null, [Validators.required]],
            resource: [null],
            lockBy: [null],
            custom: [false]
        });
        if (this.model.code && this.model.code > 0) {
            this.formSave.get('custom').disable();
        }
        // Precisa dessa porcaria pq o Luthier faz uma gambiarra pra criar o LUP. O text area salva com \n e o LUP espera \r\n
        this.formSave.get('action')?.valueChanges.subscribe(value => {
            if (value.includes('\n')) {
                const updatedValue = value.replace(/(?<!\r)\n/g, '\r\n');
                this.formSave.get('action')?.setValue(updatedValue, { emitEvent: false });
            }
        });
        this.formSave.patchValue(this.model);

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    doSaving() {
        if (this.portugol) {
            // estava no tab português, traduz para inglês
            const xmlPt = this.formSave.get('action')?.value || '';
            const xmlBackToEn = this.translateXml(xmlPt, true); // português -> inglês
            this.formSave.get('action')?.setValue(xmlBackToEn);
        }
        // getRawValue inclui valores de campos desabilitados
        this.model = this.formSave.getRawValue() as LuthierMenuModel;
        if (UtilFunctions.isValidStringOrArray(this.model.action)) {
            this.model.action = this.normalizeXmlDeclaration(this.model.action);
        }
        this._service.saveMenu(this.model).then(value => {
            this._messageService.open("Menu luthier salvo com sucesso!", "SUCESSO", "success")
            this.dialogRef.close();
        });
    }

    canSave(): boolean {
        if (this.formSave) {
            return !this.formSave.invalid;
        }
        return false;
    }

    compareCode(v1: any , v2: any): boolean {
        if (v1 && v2) {
            if (UtilFunctions.isValidStringOrArray(v1.code) === true) {
                return v1.code === v2.code || v1.code === v2;
            }
            else {
                return v1.id === v2.id || v1.id === v2;
            }
        }
        else {
            return v1 === v2;
        }
    }

    testMenuChanged(change: MatSlideToggleChange) {
        if (change.checked) {
            this.formSave.get('lockBy').patchValue(this.myUser);
        }
        else {
            this.formSave.get('lockBy').setValue(null);
        }
    }

    getSeletctedImage(value: any): string {
        if (UtilFunctions.isValidObject(value) === true) {
            const code = value.code;
            if (UtilFunctions.isValidStringOrArray(code) === true) {
                const index = this.resources.findIndex(x => x.code === code);
                if (index >= 0) {
                    return this.resources[index].file;
                }
            }
        }
        return null;

    }

    portugolChanged(event: boolean) {
        if (event === false) {
            const xmlPt = this.formSave.get('action')?.value || '';
            const xmlBackToEn = this.translateXml(xmlPt, true); // português -> inglês
            this.formSave.get('action')?.setValue(xmlBackToEn);
            //console.log('português -> inglês', xmlPt, xmlBackToEn);
        }
        else {
            const xmlEn = this.formSave.get('action')?.value || '';
            const xmlToPt = this.translateXml(xmlEn, false); // inglês -> português
            this.formSave.get('action')?.setValue(xmlToPt);
            //console.log('inglês -> português', xmlEn, xmlToPt);
        }
    }

    translateWord(word: string, reverse = false): string {
        const dict = reverse ? reverseDictionary : dictionary;
        return dict[word] || word; // se não existir, retorna a mesma palavra
    }

    translateValue(value: string, reverse = false): string {
        const dict = reverse ? reverseDictionary : dictionary;

        // tenta traduzir o valor inteiro primeiro (ex: OPEN_VISION_LIST)
        if (dict[value]) {
            return dict[value];
        }

        // se não encontrou, quebra por '.' ou '_' para casos como metadata.dataset.name
        return value
        .split(/([._])/)
        .map(part => this.translateWord(part, reverse))
        .join('');
    }

    traverse(node: Node, reverse = false) {
        if (node.nodeType === 1) { // Elemento
            const el = node as Element;

            // --- traduz nome da tag ---
            const newTagName = this.translateWord(el.tagName, reverse);
            let newEl = el;

            if (newTagName !== el.tagName) {
                // cria novo elemento com o nome traduzido
                newEl = el.ownerDocument!.createElement(newTagName);

                // copia atributos
                for (let i = 0; i < el.attributes.length; i++) {
                    const attr = el.attributes[i];
                    const newAttrName = this.translateValue(attr.name, reverse);
                    const newAttrValue = this.translateValue(attr.value, reverse);
                    newEl.setAttribute(newAttrName, newAttrValue);
                }

                // move filhos
                while (el.firstChild) {
                    newEl.appendChild(el.firstChild);
                }

                // substitui o elemento antigo pelo novo
                el.parentNode?.replaceChild(newEl, el);
            } else {
                // traduz atributos sem trocar a tag
                const attrs = Array.from(el.attributes);
                for (const attr of attrs) {
                    const newAttrName = this.translateValue(attr.name, reverse);
                    const newAttrValue = this.translateValue(attr.value, reverse);
                    if (newAttrName !== attr.name) {
                        el.removeAttribute(attr.name);
                        el.setAttribute(newAttrName, newAttrValue);
                    } else {
                        attr.value = newAttrValue;
                    }
                }
            }

            // --- percorre filhos ---
            for (let i = 0; i < newEl.childNodes.length; i++) {
                this.traverse(newEl.childNodes[i], reverse);
            }

        } else if (node.nodeType === 3) { // Texto
            node.nodeValue = this.translateValue(node.nodeValue || '', reverse);
        }
    }

    translateXml(xml: string, reverse = false): string {
        try {
            const parser = new DOMParser({
                errorHandler: { warning: () => {}, error: () => {}, fatalError: () => {} }
            });
            const serializer = new XMLSerializer();

            const doc = parser.parseFromString(xml, 'application/xml');
            this.traverse(doc.documentElement, reverse);

            return serializer.serializeToString(doc);
        } catch (e) {
            console.warn('Erro ao traduzir XML:', e);
            return xml; // retorna original se não conseguir parsear
        }
    }

    normalizeXmlDeclaration(xmlText: string): string {
        const expectedDecl = '<?xml version="1.0" encoding="UTF-8"?>';

        // remove espaços no início
        let raw = xmlText.trimStart();

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(raw, "application/xml");

            // verifica se ocorreu erro de parse
            if (doc.documentElement.nodeName === "parsererror") {
                return xmlText; // não é XML válido → retorna original
            }

            // regex para capturar declaração XML existente
            const declRegex = /^<\?xml\s+([^?>]+)\?>/i;
            const match = raw.match(declRegex);

            if (match) {
                // já tem declaração → força version/encoding
                raw = raw.replace(declRegex, expectedDecl);
            } else {
                // não tem declaração → adiciona
                raw = expectedDecl + "\n" + raw;
            }

            return raw;
        } catch (e) {
            // parsing falhou → devolve original
            return xmlText;
        }
    }
}
