import {UtilFunctions} from '../util/util-functions';
import {FormGroup} from '@angular/forms';
import {PortalHistoryPersistTypeEnum} from './portal_luthier_history.model';

export class LuthierBasicModel {
    id?: string
    code?: number
    pending?: boolean = false
    editing?: boolean = false
    row?: FormGroup
    invalidFields?: {[key: string]: any}
    persistType?: PortalHistoryPersistTypeEnum
}
export class LuthierDatabaseModel {
    code: number
    server: string
    database: string
    port: any
    user: string
    password: string
    dbType: string
    recrypt: number
    passwordhash: string
    plainPassword: string
}

export class LuthierProjectModel extends LuthierDatabaseModel{
    name?: string
    version?: string
    ident?: string
    protocol?: string
}
export type LuthierObjectType = 'UNKNOW' | 'TABLE' | 'VIEW' | 'VISION' | 'PROCEDURE' | 'JUST_RUNTIME' | 'VISION_DATASET';
export type TableType = 'fields' | 'indexes' | 'references' | 'searches' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
export class LuthierTableModel extends LuthierBasicModel {
    id?: string;
    code?: number
    name?: string
    previousName?: string
    description?: string
    customDescription?: LuthierCustomizationModel
    creationDate?: Date
    mainDatabaseCode?: number
    objectType?: LuthierObjectType | string
    technicalDescription?: string
    userDescription?: string
    className?: string
    namespace?: string
    export?: boolean
    logins?: boolean
    logup?: boolean
    logdel?: boolean
    uiConfiguration?: string
    visible?: boolean
    groupInfos?: LuthierGroupInfoModel[]
    fields?: LuthierTableFieldModel[]
    references?: LuthierTableReferenceModel[]
    indexes?: LuthierTableIndexModel[]
    views?: LuthierViewModel[]
    currentViewBodyType?: LuthierViewBodyEnum | string
    customFields?: LuthierCustomFieldModel[]
    customizations?: LuthierCustomizationModel[]
    bonds?: LuthierBondModel[]
    datasetBonds?: LuthierDatasetBondModel[]
    searches?: LuthierTableSearchModel[]
    historical?: LuthierMetadataHistoryChangeModel[]
    public static equals(model: LuthierTableModel, previousModel: LuthierTableModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.description, previousModel?.description, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customDescription, previousModel?.customDescription)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.technicalDescription, previousModel?.technicalDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.userDescription, previousModel?.userDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.className, previousModel?.className)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.namespace, previousModel?.namespace)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.export, previousModel?.export)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.logins, previousModel?.logins)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.logup, previousModel?.logup)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.logdel, previousModel?.logdel)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.visible, previousModel?.visible)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fields?.length, previousModel?.fields?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfos?.length, previousModel?.groupInfos?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.searches?.length, previousModel?.searches?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.customFields?.length, previousModel?.customFields?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.references?.length, previousModel?.references?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.indexes?.length, previousModel?.indexes?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model.fields) === true) {
            for (const child of model.fields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.fields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.fields[previousChildIndex];
                    if (LuthierTableFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.groupInfos) === true) {
            for (const child of model.groupInfos) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.groupInfos.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.groupInfos[previousChildIndex];
                    if (LuthierGroupInfoModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.searches) === true) {
            for (const child of model.searches) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.searches.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.searches[previousChildIndex];
                    if (LuthierTableSearchModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.customFields) === true) {
            for (const child of model.customFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.customFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.customFields[previousChildIndex];
                    if (LuthierCustomFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.references) === true) {
            for (const child of model.references) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.references.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.references[previousChildIndex];
                    if (LuthierTableReferenceModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.indexes) === true) {
            for (const child of model.indexes) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.indexes.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.indexes[previousChildIndex];
                    if (LuthierTableIndexModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.views) === true) {
            for (const child of model.views) {
                const previousChildIndex = previousModel?.views?.findIndex(previousChild => previousChild.databaseType === child.databaseType);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.views[previousChildIndex];
                    if (!UtilFunctions.equalsIgnoreCase(child.body, previousChild.body, false)) {
                        return false

                    }
                }
                else {
                    if (UtilFunctions.isValidStringOrArray(child.body)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

}
export enum LuthierGroupInfoTypeEnum {
    GROUP_OF_GROUP = ("GROUP_OF_GROUP"),
    HORIZONTAL_GRID = ("HORIZONTAL_GRID"),
    VERTICAL_GRID = ("VERTICAL_GRID"),
    GROUP_IN_VERTICAL_GRID = ("GROUP_IN_VERTICAL_GRID")
}
export class LuthierGroupInfoModel extends LuthierBasicModel{
    id?: string
    code?: number
    description?: string
    tableCode?: number
    groupInfoType?: number
    parentCode?: any
    order?: number
    parent?: LuthierGroupInfoModel

    public static equals(model: LuthierGroupInfoModel, previousModel: LuthierGroupInfoModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.description, previousModel?.description)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfoType, previousModel?.groupInfoType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.parent?.code, previousModel?.parent?.code)) {
            return false
        }
    }
}

export class LuthierBondModel {
    code?: number
    name?: string
    description?: string
}

export class LuthierDatasetBondModel {
    code?: number
    name?: string
    description?: string
    visionCode?: number
    visionName?: string
    visionDescription?: string
}

export enum LuthierFieldTypeEnum {
    STRING = "STRING",
    INTEIRO = "INTEIRO",
    FLOAT = "FLOAT",
    DATE = "DATE",
    DATETIME = "DATETIME",
    TEXTO = "TEXTO",
    MONEY = "MONEY",
    IMAGEM = "IMAGEM",
    BLOB = "BLOB",
    BOOLEAN = "BOOLEAN",
    INTEIRO_LARGO = "INTEIRO_LARGO"
}

export enum LuthierFieldModifierEnum {
    PUBLIC= "PUBLICO",
    PROTEGIDO = "PROTEGIDO",
    INTERNO = "INTERNO"
}

export enum LuthierFieldLayoutEnum {
    NAO_DEFINIDO = "NAO_DEFINIDO",
    METADE = "METADE",
    CHEIO = "CHEIO",
    L1 = "L1",
    L2 = "L2",
    L3 = "L3",
    L4 = "L4",
    L5 = "L5",
    L6 = "L6",
    L7 = "L7",
    L8 = "L8",
    L9 = "L9",
    L10 = "L10",
    L11 = "L11",
    L12 = "L12"
}
export enum LuthierFieldEditorEnum {
    AUTO= ("AUTO"),
    USUARIO_SISTEMA = ("USUARIO_SISTEMA"),
    GRUPOS_SISTEMA =("GRUPOS_SISTEMA"),
    BUTTON_EDIT = ("BUTTON_EDIT"),
    EDITOR_NUMERICO = ("EDITOR_NUMERICO"),
    EDITOR_MEMO = ("EDITOR_MEMO"),
    EDITOR_TIME = ("EDITOR_TIME"),
    EDITOR_AUTO_INCREMENTO = ("EDITOR_AUTO_INCREMENTO"),
    SUBSISTEMA = ("SUBSISTEMA")
}
export class LuthierFieldEditorEnumParser {
    public static fromValue(value: LuthierFieldEditorEnum | string): string {
        return Object.keys(LuthierFieldEditorEnum).indexOf(value).toString();
    }
    public static toValue(value: number | string): LuthierFieldEditorEnum {
        return Object.keys(LuthierFieldEditorEnum)[value];
    }
}
export  enum LuthierFieldCharcaseEnum {
    NORMAL = ("NORMAL"),
    UPPERCASE = ("UPPERCASE"),
    LOWERCASE = ("LOWERCASE")
}
export class LuthierFieldCharcaseEnumParser {
    public static fromValue(value: LuthierFieldCharcaseEnum | string): string {
        return Object.keys(LuthierFieldCharcaseEnum).indexOf(value).toString();
    }
    public static toValue(value: number | string): LuthierFieldCharcaseEnum {
        return Object.keys(LuthierFieldCharcaseEnum)[value];
    }
}
export class LuthierTableFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    name?: string
    previousName?: string
    fieldType?: LuthierFieldTypeEnum | string
    size?: number
    customSize?: LuthierCustomizationModel
    key?: boolean
    search?: boolean
    label?: string
    customLabel?: LuthierCustomizationModel
    notNull?: boolean
    customNotNull?: LuthierCustomizationModel
    defaultValue?: string
    customDefaultValue?: LuthierCustomizationModel
    tableCode?: number
    precision?: number
    customPrecision?: LuthierCustomizationModel
    minValue?: number
    customMinValue?: LuthierCustomizationModel
    maxValue?: number
    customMaxValue?: LuthierCustomizationModel
    mask?: string
    customMask?: LuthierCustomizationModel
    charCase?: LuthierFieldCharcaseEnum | string
    customCharCase?: LuthierCustomizationModel
    order?: number
    groupInfoCode?: any
    autoInc?: boolean
    editor?: LuthierFieldEditorEnum | string
    customEditor?: LuthierCustomizationModel
    modifyType?: LuthierFieldModifierEnum | string
    attributeName?: string
    technicalDescription?: string
    userDescription?: string
    layoutSize?: LuthierFieldLayoutEnum | string
    uiConfiguration?: string
    customUiConfiguration?: LuthierCustomizationModel
    groupInfo?: LuthierGroupInfoModel
    staticFields?: LuthierTableStaticFieldModel[]
    realName?: string
    table?: LuthierTableModel

    public static equals(model: LuthierTableFieldModel, previousModel: LuthierTableFieldModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldType, previousModel?.fieldType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.size, previousModel?.size)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customSize, previousModel?.customSize)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.key, previousModel?.key)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.search, previousModel?.search)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customLabel, previousModel?.customLabel)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.notNull, previousModel?.notNull)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customNotNull, previousModel?.customNotNull)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.defaultValue, previousModel?.defaultValue, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customDefaultValue, previousModel?.customDefaultValue)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.precision, previousModel?.precision)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customPrecision, previousModel?.customPrecision)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.minValue, previousModel?.minValue)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customMinValue, previousModel?.customMinValue)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.maxValue, previousModel?.maxValue)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customMaxValue, previousModel?.customMaxValue)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.mask, previousModel?.mask, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customMask, previousModel?.customMask)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.charCase, previousModel?.charCase)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customCharCase, previousModel?.customCharCase)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.autoInc, previousModel?.autoInc)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customEditor, previousModel?.customEditor)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.modifyType, previousModel?.modifyType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.attributeName, previousModel?.attributeName, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.technicalDescription, previousModel?.technicalDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.userDescription, previousModel?.userDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.layoutSize, previousModel?.layoutSize)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customUiConfiguration, previousModel?.customUiConfiguration)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfo?.code, previousModel?.groupInfo?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.staticFields?.length, previousModel?.staticFields?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model?.staticFields) === true) {
            for (const child of model.staticFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.staticFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.staticFields[previousChildIndex];
                    if (LuthierTableStaticFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
}
export enum LuthierPermissionTypeEnum {
    USER =  ("USER"),
    ONLY_SYSTEM =  ("ONLY_SYSTEM")
}
export class LuthierTableStaticFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    value?: string
    caption?: string
    customCaption?: LuthierCustomizationModel
    tableFieldCode?: number
    permissionType?: LuthierPermissionTypeEnum | string
    permissionMessage?: string
    resource?: LuthierResourceModel
    tableField?: LuthierTableFieldModel

    public static equals(model: LuthierTableStaticFieldModel, previousModel: LuthierTableStaticFieldModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.value, previousModel?.value, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.caption, previousModel?.caption, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customCaption, previousModel?.customCaption)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.permissionType, previousModel?.permissionType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.permissionMessage, previousModel?.permissionMessage, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.resource?.code, previousModel?.resource?.code)) {
            return false
        }
        return true;
    }
}
export enum LuthierReferenceActionEnum {
    NONE = ("NONE"),
    CASCADE = ("CASCADE"),
    SET_NULL = ("SET_NULL"),
    SET_DEFAULT = ("SET_DEFAULT"),
    RESTRICT = ("RESTRICT")
}
export enum LuthierReferenceStatusEnum {
    INACTIVE = ("INACTIVE"),
    ACTIVE = ("ACTIVE")
}
export class LuthierTableReferenceModel extends LuthierBasicModel{
    id?: string
    code?: number
    name?: string
    status?: LuthierReferenceStatusEnum | string
    tableFKCode?: number
    tablePKCode?: number
    onDelete?: LuthierReferenceActionEnum | string
    onUpdate?: LuthierReferenceActionEnum | string
    attributeName?: any
    updateMessage?: any
    deleteMessage?: any
    lookupFastFieldCode?: any
    lookupDescriptionFieldCode?: any
    tableFK?: LuthierTableModel
    tablePK?: LuthierTableModel
    fieldsReference?: LuthierTableReferenceFieldModel[]
    lookupFastField?: LuthierTableFieldModel
    lookupDescriptionField?: LuthierTableFieldModel

    public static equals(model: LuthierTableReferenceModel, previousModel: LuthierTableReferenceModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.status, previousModel?.status)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.onDelete, previousModel?.onDelete)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.onUpdate, previousModel?.onUpdate)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.attributeName, previousModel?.attributeName, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.updateMessage, previousModel?.updateMessage, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.deleteMessage, previousModel?.deleteMessage, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.tablePK?.code, previousModel?.tablePK?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.lookupFastField?.code, previousModel?.lookupFastField?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.lookupDescriptionField?.code, previousModel?.lookupDescriptionField?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldsReference?.length, previousModel?.fieldsReference?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model?.fieldsReference) === true) {
            for (const child of model.fieldsReference) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.fieldsReference.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.fieldsReference[previousChildIndex];
                    if (LuthierTableReferenceFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
}
export class LuthierTableReferenceFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    status?: number
    referenceCode?: number
    fieldPKCode?: number
    fieldFKCode?: number
    fieldPK?: LuthierTableFieldModel
    fieldFK?: LuthierTableFieldModel
    reference?: LuthierTableReferenceModel

    public static equals(model: LuthierTableReferenceFieldModel, previousModel: LuthierTableReferenceFieldModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.status, previousModel?.status)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldPK?.code, previousModel?.fieldPK?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldFK?.code, previousModel?.fieldFK?.code)) {
            return false
        }
        return true;
    }
}
export enum LuthierIndexSortEnum {
    ASC = ("ASC"),
    DESC = ("DESC")
}
export class LuthierTableIndexModel extends LuthierBasicModel{
    id?: string
    code?: number
    name?: string
    sortType?: LuthierIndexSortEnum | string
    tableCode?: number
    unique?: boolean
    creationOrder?: number
    validationMessage?: any
    indexFields?: LuthierTableIndexFieldModel[]
    table?: LuthierTableModel

    public static equals(model: LuthierTableIndexModel, previousModel: LuthierTableIndexModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.sortType, previousModel?.sortType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.unique, previousModel?.unique)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.creationOrder, previousModel?.creationOrder)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.validationMessage, previousModel?.validationMessage, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.indexFields?.length, previousModel?.indexFields?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model?.indexFields) === true) {
            for (const child of model.indexFields) {
                if (UtilFunctions.isValidStringOrArray(child.tableField?.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.indexFields.findIndex(previousChild => previousChild.tableField.code === child.tableField?.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.indexFields[previousChildIndex];
                    if (LuthierTableIndexFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
}
export enum LuthierViewBodyEnum {
    SQLSERVER = ("SQLSERVER"),
    ORACLE = ("ORACLE"),
    POSTGRES = ("POSTGRES"),
    H2 = ("H2"),
    GENERICO = ("GENERICO"),
    CUSTOM = ("CUSTOM")
}
export class LuthierViewModel {
    databaseType?: LuthierViewBodyEnum | string
    body?: string
}
export class LuthierTableIndexFieldModel extends LuthierBasicModel{
    tableFieldCode?: number
    indexCode?: number
    order?: number
    tableField?: LuthierTableFieldModel
    index?: LuthierTableIndexModel

    public static equals(model: LuthierTableIndexFieldModel, previousModel: LuthierTableIndexFieldModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.tableField?.code, previousModel?.tableField?.code)) {
            return false
        }
    }
}
export class LuthierCustomFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    tableName?: string
    name?: string
    previousName?: string
    size?: number
    notNull?: boolean
    defaultValue?: string
    precision?: number
    minValue?: number
    maxValue?: number
    mask?: string
    editor?: string
    charCase?: string
    description?: any
    fieldType?: string
    key?: boolean
    search?: boolean
    label?: string
    order?: number
    groupInfo?: string
    autoInc?: boolean
    technicalDescription?: string
    userDescription?: string
    modifyType?: string
    attributeName?: string
    layoutSize?: LuthierFieldLayoutEnum | string
    uiConfiguration?: string
    staticFields?: LuthierTableStaticCustomFieldModel[]
    realName?: string

    public static equals(model: LuthierCustomFieldModel, previousModel: LuthierCustomFieldModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.size, previousModel?.size)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.notNull, previousModel?.notNull)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.defaultValue, previousModel?.defaultValue, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.precision, previousModel?.precision)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.minValue, previousModel?.minValue)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.maxValue, previousModel?.maxValue)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.charCase, previousModel?.charCase)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.description, previousModel?.description, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldType, previousModel?.fieldType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.key, previousModel?.key)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.search, previousModel?.search)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfo, previousModel?.groupInfo)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.autoInc, previousModel?.autoInc)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.technicalDescription, previousModel?.technicalDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.userDescription, previousModel?.userDescription)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.modifyType, previousModel?.modifyType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.attributeName, previousModel?.attributeName)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.layoutSize, previousModel?.layoutSize)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.staticFields?.length, previousModel?.staticFields?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model?.staticFields) === true) {
            for (const child of model.staticFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.staticFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.staticFields[previousChildIndex];
                    if (LuthierTableStaticCustomFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
    }
}
export class LuthierTableStaticCustomFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    tableCustomFieldCode?: number
    value?: string
    caption?: string
    resource?: string
    permissionType?: number
    permissionMessage?: string

    public static equals(model: LuthierTableStaticCustomFieldModel, previousModel: LuthierTableStaticCustomFieldModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.value, previousModel?.value, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.caption, previousModel?.caption, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.permissionType, previousModel?.permissionType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.permissionMessage, previousModel?.permissionMessage, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.resource, previousModel?.resource)) {
            return false
        }
        return true;
    }
}
export type LuthierCustomizationType =
    'FIELD_TABLE' |
    'STATIC_VALUE' |
    'FIELD_VISION' |
    'SEARCH_TABLE' |
    'SEARCH_VISION' |
    'SEARCH_FIELD_TABLE' |
    'SEARCH_FIELD_VISION' |
    'TABLE_FIELD_SIZE' |
    'TABLE_FIELD_REQUIRED' |
    'TABLE_FIELD_DEFAULTVALUE' |
    'TABLE_FIELD_PRECISION' |
    'TABLE_FIELD_MAXVALUE' |
    'TABLE_FIELD_MINVALUE' |
    'TABLE_FIELD_MASK' |
    'TABLE_FIELD_CHARCASE' |
    'TABLE_FIELD_EDITORTYPE' |
    'VISION_FIELD_MASK' |
    'VISION_FIELD_READONLY' |
    'VISION_FIELD_VISIBLE' |
    'VISION_FIELD_REQUIRED' |
    'VISION_FIELD_CHARCASE' |
    'VISION_FIELD_EDITORTYPE' |
    'VISION_FIELD_LOOKUPFILTER' |
    'VISION_DATASET_DESCRIPTION' |
    'VISION_DATASET_FILTER' |
    'TABLE_DESCRIPTION' |
    'FIELD_UICONFIGURATION' |
    'VISION_FIELD_UICONFIGURATION';
export class LuthierCustomizationModel {
    id?: string
    code?: number
    date?: Date
    type?: LuthierCustomizationType
    value?: any
    name1?: string
    name2?: string
    name3?: string
    name4?: string
    name5?: string
    public static equals(model: LuthierCustomizationModel, previousModel: LuthierCustomizationModel): boolean {
        if (UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.type, previousModel?.type) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.value, previousModel?.value, false) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.name1, previousModel?.name1) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.name2, previousModel?.name2) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.name3, previousModel?.name3) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.name4, previousModel?.name4) === false) {
            return false;
        }
        if (UtilFunctions.equalsIgnoreCase(model?.name5, previousModel?.name5) === false) {
            return false;
        }
        return true;
    }
}
export enum LuthierSearchTypeEnum {
    SIMPLE = ("SIMPLE"),
    MULTIPLE = ("MULTIPLE"),
    SIMPLE_MULTIPLE = ("SIMPLE_MULTIPLE")
}
export enum LuthierSearchStatusEnum {
    INACTIVE = ("INACTIVE"),
    ACTIVE = ("ACTIVE")
}
export class LuthierTableSearchModel extends LuthierBasicModel{
    id?: string
    code?: number
    tableCode?: number
    name?: string
    customName?: LuthierCustomizationModel
    status?: LuthierSearchStatusEnum
    type?: LuthierSearchTypeEnum
    order?: number
    table?: LuthierTableModel
    searchFields?: LuthierTableSearchFieldModel[]
    subsystems?: LuthierTableSearchSubsystemModel[]

    public static equals(model: LuthierTableSearchModel, previousModel: LuthierTableSearchModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customName, previousModel?.customName)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.status, previousModel?.status)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.type, previousModel?.type)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.searchFields?.length, previousModel?.searchFields?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.subsystems?.length, previousModel?.subsystems?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model?.searchFields) === true) {
            for (const child of model.searchFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.searchFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.searchFields[previousChildIndex];
                    if (LuthierTableSearchFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model?.subsystems) === true) {
            for (const child of model.subsystems) {
                if (UtilFunctions.isValidStringOrArray(child.subsystem?.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.subsystems.findIndex(previousChild => previousChild.subsystem.code === child.subsystem.code);
                if (previousChildIndex < 0) {
                    return false;
                }
            }
        }
    }
}
export enum LuthierSearchFieldEditorEnum {
    DEFAULT = ("DEFAULT"),
    DATE = ("DATE"),
    NUMERIC = ("NUMERIC"),
    TIME = ("TIME")
}
export enum LuthierSearchFieldOperatorEnum {
    EQUAL = ("EQUAL"),
    LIKE = ("LIKE"),
    LIKE_LEFT = ("LIKE_LEFT"),
    LIKE_RIGHT = ("LIKE_RIGHT"),
    NOT_LIKE = ("NOT_LIKE"),
    NOT_LIKE_LEFT = ("NOT_LIKE_LEFT"),
    NOT_LIKE_RIGHT = ("NOT_LIKE_RIGHT"),
    GREATER_THAN = ("GREATER_THAN"),
    LESS_THAN = ("LESS_THAN"),
    GREATER_OR_EQUAL = ("GREATER_OR_EQUAL"),
    LESS_OR_EQUAL = ("LESS_OR_EQUAL"),
    DIFERENT = ("DIFERENT"),
    NULL = ("NULL"),
    NOT_NULL = ("NOT_NULL")
}
export class LuthierTableSearchFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    searchCode?: number
    tableFieldCode?: number
    notNull?: boolean
    label?: string
    customLabel?: LuthierCustomizationModel
    operator?: LuthierSearchFieldOperatorEnum
    order?: number
    editor?: LuthierSearchFieldEditorEnum
    search?: LuthierTableSearchModel
    tableField?: LuthierTableFieldModel

    public static equals(model: LuthierTableSearchFieldModel, previousModel: LuthierTableSearchFieldModel) {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.notNull, previousModel?.notNull)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customLabel, previousModel?.customLabel)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.operator, previousModel?.operator)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.search, previousModel?.search)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.tableField?.code, previousModel?.tableField?.code)) {
            return false
        }
    }
}
export class LuthierTableSearchSubsystemModel {
    searchCode?: number
    subsystemCode?: number
    search?: LuthierTableSearchModel
    subsystem?: LuthierSubsystemModel
}
export enum LuthierSubsystemStatusEnum {
    INACTIVE = ("INACTIVE"),
    ACTIVE = ("ACTIVE")
}
export enum LuthierPlataformEnum {
    DESKTOP = ("DESKTOP"),
    WEB = ("WEB"),
    BOTH = ("BOTH")
}
export class LuthierSubsystemModel {
    code?: number
    description?: string
    status?: LuthierSubsystemStatusEnum | string
    plataform?: LuthierPlataformEnum | string
    resource?: LuthierResourceModel
}
export enum LuthierResourceTypeEnum {
    NOT_FOUND = ('NOT_FOUND'),
    STRING = ('STRING'),
    IMAGE_BITMAP = ('IMAGE_BITMAP'),
    IMAGE_ICO = ('IMAGE_ICO'),
    IMAGE_PNG = ('IMAGE_PNG'),
    IMAGE_JPEG = ('IMAGE_JPEG'),
    IMAGE_WMF = ('IMAGE_WMF'),
    OLE_WORD = ('OLE_WORD'),
    OLE_EXCEL = ('OLE_EXCEL')
}
export class LuthierResourceTypeParser {
    public static parse(value: any): any {
        switch (value) {
            case 'NOT_FOUND':
                return -1;
            case 'STRING':
                return 0;
            case 'IMAGE_BITMAP':
                return 1;
            case 'IMAGE_ICO':
                return 2;
            case 'IMAGE_PNG':
                return 3;
            case 'IMAGE_JPEG':
                return 4;
            case 'IMAGE_WMF':
                return 5;
            case 'OLE_WORD':
                return 20;
            case 'OLE_EXCEL':
                return 21;
        }

    }
}
export class LuthierResourceModel {
    code?: number
    name?: string
    file?: string
    resourceType?: LuthierResourceTypeEnum
    description?: string
    height?: number
    width?: number
    identifier?: string
}

export class LuthierVisionModel {
    id?: string;
    code?: number
    name?: string
    previousName?: string
    description?: string
    children?: LuthierVisionDatasetModel[]
    objectType?: LuthierObjectType
    module?: LuthierModuleModel
    invalidFields?: {[key: string]: any}
    public static equals(model: LuthierVisionModel, previousModel: LuthierVisionModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.description, previousModel?.description, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.module?.code, previousModel?.module?.code)) {
            return false
        }
        return true;
    }

}

export class LuthierVisionDatasetModel extends LuthierBasicModel{
    id?: string
    code?: number
    name?: string
    previousName?: string
    description?: string
    customDescription?: LuthierCustomizationModel;
    filter?: string
    customFilter?: LuthierCustomizationModel;
    uiConfiguration?: string
    parent?: LuthierVisionDatasetModel
    children?: LuthierVisionDatasetModel[]
    table?: LuthierTableModel
    vision?: LuthierVisionModel
    objectType?: LuthierObjectType
    fields?: LuthierVisionDatasetFieldModel[]
    groupInfos?: LuthierVisionGroupInfoModel[]
    searches?: LuthierVisionDatasetSearchModel[]
    customizations?: LuthierCustomizationModel[]
    customFields?: LuthierVisionDatasetCustomFieldModel[]
    relatives?: LuthierVisionDatasetModel[]
    historical?: LuthierMetadataHistoryChangeModel[]

    public static equals(model: LuthierVisionDatasetModel, previousModel: LuthierVisionDatasetModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.description, previousModel?.description, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customDescription, previousModel?.customDescription)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.filter, previousModel?.filter, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customFilter, previousModel?.customFilter)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.parent?.code, previousModel?.parent?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.table?.code, previousModel?.table?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.vision?.code, previousModel?.vision?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fields?.length, previousModel?.fields?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfos?.length, previousModel?.groupInfos?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.searches?.length, previousModel?.searches?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.customFields?.length, previousModel?.customFields?.length)) {
            return false
        }

        if (UtilFunctions.isValidStringOrArray(model.fields) === true) {
            for (const child of model.fields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.fields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.fields[previousChildIndex];
                    if (LuthierVisionDatasetFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.groupInfos) === true) {
            for (const child of model.groupInfos) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.groupInfos.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.groupInfos[previousChildIndex];
                    if (LuthierGroupInfoModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.searches) === true) {
            for (const child of model.searches) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.searches.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.searches[previousChildIndex];
                    if (LuthierVisionDatasetSearchModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.customFields) === true) {
            for (const child of model.customFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.customFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.customFields[previousChildIndex];
                    if (LuthierVisionDatasetCustomFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
}
export enum LuthierVisionDatasetFieldTypeEnum {
    NORMAL = ("NORMAL"),
    CALCULATED = ("CALCULATED"),
    LOOKUP  = ("LOOKUP")
}
export class LuthierVisionGroupInfoModel extends LuthierGroupInfoModel {

}
export class LuthierVisionDatasetFieldModel extends LuthierBasicModel{
    code?: number
    name?: string
    fieldType?: LuthierVisionDatasetFieldTypeEnum
    size?: number
    search?: boolean
    label?: string
    customLabel: LuthierCustomizationModel;
    notNull?: boolean
    customNotNull: LuthierCustomizationModel;
    datasetCode?: number
    precision?: number
    mask?: string
    customMask: LuthierCustomizationModel;
    charCase?: LuthierFieldCharcaseEnum | string
    customCharCase: LuthierCustomizationModel;
    order?: number
    groupInfoCode?: number
    editor?: LuthierFieldEditorEnum | string
    customEditor: LuthierCustomizationModel;
    technicalDescription?: string
    userDescription?: string
    layoutSize?: LuthierFieldLayoutEnum | string
    uiConfiguration?: string
    customUiConfiguration: LuthierCustomizationModel;
    script?: string
    dataType?: LuthierFieldTypeEnum | string
    tableFieldCode?: number
    readOnly?: boolean
    customReadOnly: LuthierCustomizationModel;
    visible?: boolean
    customVisible: LuthierCustomizationModel;
    tabName?: string
    lookupFilter?: string
    customLookupFilter: LuthierCustomizationModel;
    referenceCode?: number
    dataset?: LuthierDatabaseModel
    groupInfo?: LuthierVisionGroupInfoModel
    tableField?: LuthierTableFieldModel
    reference?: LuthierTableReferenceModel
    id?: string

    public static equals(model: LuthierVisionDatasetFieldModel, previousModel: LuthierVisionDatasetFieldModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldType, previousModel?.fieldType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.size, previousModel?.size)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.search, previousModel?.search)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customLabel, previousModel?.customLabel)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.notNull, previousModel?.notNull)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customNotNull, previousModel?.customNotNull)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.precision, previousModel?.precision)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.mask, previousModel?.mask, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customMask, previousModel?.customMask)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.charCase, previousModel?.charCase)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customCharCase, previousModel?.customCharCase)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customEditor, previousModel?.customEditor)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.technicalDescription, previousModel?.technicalDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.userDescription, previousModel?.userDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.layoutSize, previousModel?.layoutSize)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customUiConfiguration, previousModel?.customUiConfiguration)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.dataType, previousModel?.dataType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.readOnly, previousModel?.readOnly)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customReadOnly, previousModel?.customReadOnly)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.visible, previousModel?.visible)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customVisible, previousModel?.customVisible)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.lookupFilter, previousModel?.lookupFilter)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customLookupFilter, previousModel?.customLookupFilter)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.dataset?.code, previousModel?.dataset?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfo?.code, previousModel?.groupInfo?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.tableField?.code, previousModel?.tableField?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.reference?.code, previousModel?.reference?.code)) {
            return false
        }
        return true;
    }
}

export class LuthierVisionDatasetSearchModel extends LuthierBasicModel{
    id?: string;
    code?: number
    datasetCode?: number
    name?: string
    customName: LuthierCustomizationModel;
    status?: LuthierSearchStatusEnum | string
    type?: LuthierSearchTypeEnum | string
    order?: number
    dataset?: LuthierDatabaseModel
    searchFields?: LuthierVisionDatasetSearchFieldModel[]
    subsystems: LuthierVisionDatasetSearchSubsystemModel[]

    public static equals(model: LuthierVisionDatasetSearchModel, previousModel: LuthierVisionDatasetSearchModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customName, previousModel?.customName)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.status, previousModel?.status)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.type, previousModel?.type)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        /*
        if (!UtilFunctions.equalsIgnoreCase(model?.dataset?.code, previousModel?.dataset?.code)) {
            return false
        }
         */
        if (!UtilFunctions.equalsIgnoreCase(model?.searchFields?.length, previousModel?.searchFields?.length)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.subsystems?.length, previousModel?.subsystems?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model.searchFields) === true) {
            for (const child of model.searchFields) {
                if (UtilFunctions.isValidStringOrArray(child.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.searchFields.findIndex(previousChild => previousChild.code === child.code);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.searchFields[previousChildIndex];
                    if (LuthierVisionDatasetSearchFieldModel.equals(child, previousChild) === false) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.subsystems) === true) {
            for (const child of model.subsystems) {
                if (UtilFunctions.isValidStringOrArray(child.subsystem?.code) === false) {
                    return false;
                }
                const previousChildIndex = previousModel.subsystems.findIndex(previousChild => previousChild.subsystem.code === child.subsystem.code);
                if (previousChildIndex >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }

}
export class LuthierVisionDatasetSearchFieldModel extends LuthierBasicModel {
    id?: string
    code?: number
    searchCode?: number
    datasetCode?: number
    fieldCode?: number
    label?: string
    customLabel: LuthierCustomizationModel;
    operator?: LuthierSearchFieldOperatorEnum | string
    order?: number
    editor?: LuthierSearchFieldEditorEnum | string
    search: LuthierVisionDatasetSearchModel
    dataset: LuthierVisionDatasetModel
    field?: LuthierVisionDatasetFieldModel

    public static equals(model: LuthierVisionDatasetSearchFieldModel, previousModel: LuthierVisionDatasetSearchFieldModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!LuthierCustomizationModel.equals(model?.customLabel, previousModel?.customLabel)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.operator, previousModel?.operator)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        /*
        if (!UtilFunctions.equalsIgnoreCase(model?.search?.code, previousModel?.search?.code)) {
            return false
        }
         */
        if (!UtilFunctions.equalsIgnoreCase(model?.dataset?.code, previousModel?.dataset?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.field?.code, previousModel?.field?.code)) {
            return false
        }
    }
}

export class LuthierVisionDatasetSearchSubsystemModel {
    searchCode?: number
    subsystemCode?: number
    search?: LuthierVisionDatasetSearchModel
    subsystem?: LuthierSubsystemModel
}

export class LuthierVisionDatasetCustomFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    visionName?: string
    datasetName?: string
    dataType?: LuthierFieldTypeEnum | string
    script?: string
    fieldDatasetName?: string
    mask?: string
    readOnly?: boolean
    visible?: boolean
    required?: boolean
    editor?: LuthierFieldEditorEnum | string
    charcase?: LuthierFieldCharcaseEnum | string
    lookupFilter?: string
    fieldType?: LuthierVisionDatasetFieldTypeEnum | string
    size?: number
    label?: string
    precision?: number
    order?: number
    groupInfo?: string
    search?: boolean
    technicalDescription?: string
    userDescription?: string
    lookupTable?: string
    layoutSize?: LuthierFieldLayoutEnum | string
    uiConfiguration: string
    reference?: string
    tableField?: LuthierTableFieldModel | LuthierCustomFieldModel;
    public static equals(model: LuthierVisionDatasetCustomFieldModel, previousModel: LuthierVisionDatasetCustomFieldModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.fieldType, previousModel?.fieldType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.size, previousModel?.size)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.search, previousModel?.search)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.label, previousModel?.label, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.precision, previousModel?.precision)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.mask, previousModel?.mask, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.order, previousModel?.order)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.editor, previousModel?.editor)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.technicalDescription, previousModel?.technicalDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.userDescription, previousModel?.userDescription, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.layoutSize, previousModel?.layoutSize)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.uiConfiguration, previousModel?.uiConfiguration, false)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.dataType, previousModel?.dataType)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.readOnly, previousModel?.readOnly)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.visible, previousModel?.visible)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.lookupFilter, previousModel?.lookupFilter)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.datasetName, previousModel?.datasetName)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.groupInfo, previousModel?.groupInfo)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.tableField?.code, previousModel?.tableField?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.reference, previousModel?.reference)) {
            return false
        }
        return true;
    }
}
export type LuthierDictionaryObjectType = LuthierTableModel | LuthierVisionModel | LuthierVisionDatasetModel | LuthierProcedureModel

export enum LuthierUserTypeEnum {
    SYSTEM = ("SYSTEM"),
    NORMAL = ("NORMAL"),
    DEVELOPER = ("DEVELOPER"),
    ENGENIEER = ("ENGENIEER"),
    SUPER = ("SUPER")
}
export enum LuthierUserStatusEnum {
    INACTIVE = ("INACTIVE"),
    ACTIVE = ("ACTIVE")
}
export enum LuthierUserGroupEnum {
    USER = ("USER"),
    GROUP = ("GROUP")
}
export enum LuthierUserActionEnum {
    NONE = ("NONE"),
    CHANGE_PASSWORD = ("CHANGE_PASSWORD")
}
export class LuthierUserModel {
    code?: number;
    name?: string;
    login?: string;
    userType?: LuthierUserTypeEnum;
    date?: Date;
    projectCode: number;
    status?: LuthierUserStatusEnum;
    group?: LuthierUserGroupEnum;
    email?: string;
    sms?: string;
    password?: string;
    action?: LuthierUserActionEnum;
    hash?: string;
    deadLine?: Date;
    multiAccess?: boolean;
    groups?: LuthierUserGroupModel[]
    users?: LuthierUserGroupModel[]
    subsystems?: LuthierUserSubsystemModel[]
}
export enum LuthierUserSubsystemAcessEnum {
    NO_ACCESS = ('NO_ACCESS'),
    NORMAL = ('NORMAL'),
    MANAGER = ('MANAGER')
}
export class LuthierUserSubsystemModel {
    userCode?: number
    subsystemCode?: number
    user?: LuthierUserModel
    subsystem?: LuthierSubsystemModel
    access?: LuthierUserSubsystemAcessEnum | string
}

export class LuthierUserGroupModel {
    userCode?: number
    groupCode?: number
    user?: LuthierUserModel
    group?: LuthierUserModel
}

export class LuthierCheckObjectsSummaryModel {
    id?: string
    tables?: LuthierCheckObjectsTableSummaryModel
    procedures?: LuthierCheckObjectsProcedureSummaryModel
}

export class LuthierCheckObjectsTableSummaryModel {
    totalTime?: number = 0
    total?: number = 0
    totalChanges?: number = 0
    totalNew?: number = 0
    totalChangesFields?: number = 0
    totalChangesPKs?: number = 0
    totalChangesReferences?: number = 0
    totalChangesIndexes?: number = 0
    totalChangesViews?: number = 0
    totalTables?: number = 0
    totalViews?: number = 0
    totalDone?: number = 0
    totalErrors?: number = 0
    changes?: LuthierChangesOfTableModel[]
}
export class LuthierCheckObjectsProcedureSummaryModel {
    totalTime?: number = 0
    total?: number = 0
    totalChanges?: number = 0
    totalChangesBodies?: number = 0
    totalNew?: number = 0
    totalProcedures?: number = 0
    totalDone?: number = 0
    totalErrors?: number = 0
    changes?: LuthierChangesOfProcedureModel[]
}
export class LuthierChangesOfTableModel {
    needPK?: boolean
    changed?: boolean
    changedFields?: boolean
    changedPKs?: boolean
    changedReferences?: boolean
    changedIndexes?: boolean
    changedViews?: boolean
    hasError?: boolean
    done?: boolean
    isNew?: boolean
    nativeViewBody?: string
    error?: string
    meta?: LuthierTableModel
    table?: LuthierTableModel
    deletedFields?: Array<LuthierTableFieldModel | LuthierCustomFieldModel>
    insertedFields?: Array<LuthierTableFieldModel | LuthierCustomFieldModel>
    updatedFields?: Array<LuthierTableFieldModel | LuthierCustomFieldModel>
    deletedPks?: string[]
    deletedReferences?: string[]
    insertedReferences?: LuthierTableReferenceModel[]
    updatedReferences?: LuthierTableReferenceModel[]
    deletedIndexes?: string[]
    insertedIndexes?: LuthierTableIndexModel[]
    updatedIndexes?: LuthierTableIndexModel[]
    views?: LuthierViewModel[]
}

export class LuthierChangesOfProcedureModel {
    changed?: boolean
    hasError?: boolean
    done?: boolean
    isNew?: boolean
    changedBodies?: boolean
    nativeProcedureBody?: string
    error?: string
    meta?: LuthierProcedureModel
    procedure?: LuthierProcedureModel
    bodies?: LuthierProcedureBodyModel[]
}

export class LuthierMetadataHistoryChangeModel extends LuthierBasicModel {
    code?: number
    userCode?: number
    date?: Date
    tableCode?: number
    datasetCode?: number
    type?: LuthierMetadataHistoryChangeTypeEnum
    changes?: string
    user?: LuthierUserModel
    table?: LuthierTableModel
    dataset?: LuthierVisionDatasetModel
    procedure?: LuthierProcedureModel
    detailedChanges?: BeanChangeModel[]

}

export enum LuthierMetadataHistoryChangeTypeEnum {
    NONE = ("NONE"),
    DELETE = ("DELETE"),
    CREATE = ("CREATE"),
    UPDATE = ("UPDATE")
}

export class LuthierModuleModel extends LuthierBasicModel {
    name?: string
    parentCode?: number
    description?: string
    parent?: LuthierModuleModel

}

export class LuthierParameterModel {
    name?: string
    previousName?: string
    value?: string
    user?: LuthierUserModel
    description?: string
    creationDate?: Date
    defaultValue?: string
    uiConfiguration?: string
}
export enum LuthierSemaphoreBehaviorEnum {
    LOCK = ("LOCK"),
    COMPLETE = ("COMPLETE")
}
export enum LuthierSemaphoreValueTypeEnum {
    NUMERIC = ("NUMERIC"),
    ALFANUMERIC = ("ALFANUMERIC")
}
export class LuthierSemaphoreModel {
    code?: number
    name?: string
    previousName?: string
    description?: string
    behavior?: LuthierSemaphoreBehaviorEnum
    currentValue?: string
    initialValue?: string
    valueType?: LuthierSemaphoreValueTypeEnum
    timeout?: number
    mask?: string
}
export enum LuthierMenuActionTypeEnum {
    SCRIPT = ("SCRIPT"),
    WINDOW_CALL = ("WINDOW_CALL")
}
export enum LuthierMenuCompTypeEnum {
    NORMAL = ("NORMAL")
}
export enum LuthierMenuTypeEnum {
    NONE = ("NONE")
}
export enum LuthierMenuVisibilityEnum {
    DESKTOP = ("DESKTOP"),
    WEB = ("WEB"),
    ALL = ("ALL")
}
export class LuthierMenuModel {
    code?: number
    compType?: LuthierMenuCompTypeEnum
    type?: LuthierMenuTypeEnum
    caption?: string
    actionType?: LuthierMenuActionTypeEnum
    action?: string
    visibility?: LuthierMenuVisibilityEnum
    key?: string
    custom?: boolean
    resource?: LuthierResourceModel
    lockBy?: LuthierUserModel
}
export class LuthierMenuDetailModel extends LuthierBasicModel {
    code?: number
    order?: number
    separator?: boolean
    key?: string
    subsystem?: LuthierSubsystemModel
    menu?: LuthierMenuModel
    parent?: LuthierMenuDetailModel
    children?: LuthierMenuDetailModel[]
}
export class LuthierCustomMenuTreeModel extends LuthierBasicModel {
    code?: number
    menuKey?: string
    key?: string
    after?: string
    menu?: LuthierMenuModel
    parent?: LuthierCustomMenuTreeModel
    subsystemCode?: number
    aboveMenuItem?: LuthierItemMenuTreeModel
}
export enum LuthierItemMenuTreeTypeEnum {
    SUBSYSTEM = ("SUBSYSTEM"),
    SYSTEM_MENU = ("SYSTEM_MENU"),
    CUSTOM_MENU =("CUSTOM_MENU")
}
export class LuthierItemMenuTreeModel {
    code?: number
    subsystemCode?: number
    id?: string
    menuKey?: string
    key?: string
    order?: number
    last?: boolean
    caption?: string
    type?: LuthierItemMenuTreeTypeEnum
    children?: Array<LuthierItemMenuTreeModel>
}
export class LuthierMenuTreeModel {
    subsystems?: Array<LuthierSubsystemModel>
    menus?: Array<LuthierMenuDetailModel>
    customMenus?: Array<LuthierCustomMenuTreeModel>
    tree?: Array<LuthierItemMenuTreeModel>
}
export class LuthierGenerateLoadXMLModel {
    tableCode?: number
    tableName?: string
    filter?: string
    generateReferences?: boolean
    generateBlob?: boolean
    generateChildren?: boolean
}
export class LuthierProcedureModel extends LuthierBasicModel {
    id?: string;
    code?: number
    name?: string
    previousName?: string
    date?: Date
    objectType?: LuthierObjectType | string = 'PROCEDURE'
    dependencies?: LuthierProcedureDependencyModel[]
    bodies?: LuthierProcedureBodyModel[]
    currentProcedureBodyType?: LuthierViewBodyEnum | string
    bonds?: LuthierBondModel[]
    historical?: LuthierMetadataHistoryChangeModel[]
    public static equals(model: LuthierProcedureModel, previousModel: LuthierProcedureModel): boolean {
        if (!UtilFunctions.equalsIgnoreCase(model?.code, previousModel?.code)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.name, previousModel?.name)) {
            return false
        }
        if (!UtilFunctions.equalsIgnoreCase(model?.dependencies?.length, previousModel?.dependencies?.length)) {
            return false
        }
        if (UtilFunctions.isValidStringOrArray(model.dependencies) === true) {
            for (const child of model.dependencies) {

                const previousChildIndex = previousModel.dependencies.findIndex(previousChild => previousChild.dependency.code === child.dependency.code);
                if (previousChildIndex < 0) {
                    return false;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(model.bodies) === true) {
            for (const child of model.bodies) {
                const previousChildIndex = previousModel?.bodies?.findIndex(previousChild => previousChild.databaseType === child.databaseType);
                if (previousChildIndex >= 0) {
                    const previousChild = previousModel.bodies[previousChildIndex];
                    if (!UtilFunctions.equalsIgnoreCase(UtilFunctions.normalizeBody(child.sql), UtilFunctions.normalizeBody(previousChild.sql), false)) {
                        return false

                    }
                }
                else {
                    if (UtilFunctions.isValidStringOrArray(child.sql)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

}

export class LuthierProcedureDependencyModel extends LuthierBasicModel {
    procedureCode?: number
    dependencyCode?: number
    procedure?: LuthierProcedureModel
    dependency?: LuthierProcedureModel
}

export class LuthierProcedureBodyModel {
    databaseType?: LuthierViewBodyEnum | string
    sql?: string
}

export class PatchImportItemModel<T> {
    message?: string;
    status?: string;
    selectable?: boolean;
    item: T;
}

export class LedImportModel {
    fileName?: string;
    tables: Array<PatchImportItemModel<LuthierTableModel>>
}

export class LpxImportModel {
    fileName?: string;
    tables: Array<PatchImportItemModel<LuthierTableModel>>;
    procedures: Array<PatchImportItemModel<LuthierProcedureModel>>;
    visions: Array<PatchImportItemModel<LuthierVisionModel>>;
}

export class LupImportModel {
    fileName?: string;
    projects: Array<PatchImportItemModel<LuthierProjectModel>>;
    files: Array<PatchImportItemModel<LuthierScriptTableModel>>;
    reports: Array<PatchImportItemModel<LuthierReportModel>>;
    resources: Array<PatchImportItemModel<LuthierResourceModel>>;
    menus: Array<PatchImportItemModel<LuthierSubsystemModel>>;
    parameters: Array<PatchImportItemModel<LuthierParameterModel>>;
    layoutControls: Array<PatchImportItemModel<LuthierLayoutControlModel>>;
    helps: Array<PatchImportItemModel<LuthierTableHelpModel>>;
    messages: Array<PatchImportItemModel<LuthierMessageTypeModel>>;
}

export class LuthierReportModel extends LuthierBasicModel {
    description?: string;
    name?: string;
    report?: Uint8Array;
    projectCode?: number;
    changedAt?: Date;
    userModifierCode?: number;
    detailedDescription?: string;
    subsystemCode?: number;
    userLockerCode?: number;
    lockedDate?: Date;
    creationDate?: Date;
    custom?: number;
    status?: number;
    typeManager?: number;
    lockedDescription?: string;
    version?: string;
    compiledReport?: Uint8Array;
    allowCache?: number;
    cacheLimit?: number;
    type?: number;
    update?: number;
    subsystem?: LuthierSubsystemModel;
    userModifier?: LuthierUserModel;
    userLocker?: LuthierUserModel;
    layoutControl?: LuthierLayoutControlModel
}

export class LuthierScriptTableModel extends LuthierBasicModel {
    fileName: string;
    execServer?: boolean;
    type?: number;
    computerName?: string;
    save?: boolean;
    moduleCode?: number;
    extension?: string;
    description?: string;
    projectCode?: number;
    script?: Uint8Array; // ou base64: string
    userCheckinCode?: number;
    userModifierCode?: number;
    changedAt?: string; // ou Date, se você parsear
    compunit?: Uint8Array; // ou base64: string
    module?: LuthierModuleModel;
    userCheckin?: LuthierUserModel;
    userModifier?: LuthierUserModel;
}

export enum LuthierLayoutControlTypeEnum {
    REPORT = "REPORT",
    WINDOW = "WINDOW"
}
export class LuthierLayoutControlModel {
    name?: string;
    type?: LuthierLayoutControlTypeEnum;
    projectCode?: number;
    script?: Uint8Array;
    changedAt?: Date;
    userModifierCode?: number;
    creationDate?: Date;
    userLockerCode?: number;
    lockDate?: Date;
    lockDescription?: string;
    plataform?: LuthierPlataformEnum;
    userModifier?: LuthierUserModel;
    userLocker?: LuthierUserModel;
}

export class LuthierTableHelpModel {
    code: number;
    form?: string;
    component?: string;
    value?: string;
    type: number;
    changedAt?: Date;
    userModifierCode?: number;
    patchDate?: Date;
    projectCode: number;
    parameter?: string;
    userModifier?: LuthierUserModel;
}

export class LuthierMessageTypeModel {
    code?: number;
    name?: string;
}

export interface BeanChangeModel {
    fieldName?: string;
    key?: string;
    changeType?: LuthierMetadataHistoryChangeTypeEnum;
    beforeValue?: string;
    afterValue?: string;
    changes?: BeanChangeModel[]; // Recursivo
}
