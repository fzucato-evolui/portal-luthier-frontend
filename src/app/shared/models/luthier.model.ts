export class LuthierBasicModel {
    id?: string
    code?: number
    pending?: boolean = false
    editing?: boolean = false
    invalidFields?: {[key: string]: any}
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
export type TableType = 'fields' | 'indexes' | 'references' | 'searchs' | 'groupInfos' | 'customFields' | 'customizations' | 'views' | 'bonds' ;
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
    searchs?: LuthierTableSearchModel[]
    historical?: LuthierMetadataHistoryChangeModel[]

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
}
export class LuthierTableReferenceFieldModel extends LuthierBasicModel{
    id?: string
    code?: number
    status?: number
    referenceCod?: number
    fieldPKCode?: number
    fieldFKCode?: number
    fieldPK?: LuthierTableFieldModel
    fieldFK?: LuthierTableFieldModel
    reference?: LuthierTableReferenceModel
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
    searchs?: LuthierVisionDatasetSearchModel[]
    customizations?: LuthierCustomizationModel[]
    customFields?: LuthierVisionDatasetCustomFieldModel[]
    relatives?: LuthierVisionDatasetModel[]
    historical?: LuthierMetadataHistoryChangeModel[]
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
}
export type LuthierDictionaryObjectType = LuthierTableModel | LuthierVisionModel | LuthierVisionDatasetModel

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
}

export enum LuthierMetadataHistoryChangeTypeEnum {
    NONE = ("NONE"),
    DELETE = ("DELETE"),
    CREATE = ("CREATE"),
    UPDATE = ("UPDATE")
}

