import {AbstractControl, FormArray, ValidationErrors, ValidatorFn} from '@angular/forms';
import {
    LuthierFieldTypeEnum,
    LuthierTableFieldModel,
    LuthierTableModel,
    LuthierViewBodyEnum,
    LuthierVisionDatasetFieldTypeEnum,
    LuthierVisionDatasetModel
} from '../models/luthier.model';
import {UtilFunctions} from '../util/util-functions';
import {MatTableDataSource} from '@angular/material/table';
import _ from 'lodash';

export class LuthierValidator {
    static validate(allFields?: FormArray): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const fieldType = formGroup.get('fieldType').value as LuthierFieldTypeEnum;
            const precisionControl = formGroup.get('precision');
            const sizeControl = formGroup.get('size');
            const nameControl = formGroup.get('name');
            const pkControl = formGroup.get('key');
            const notNullControl = formGroup.get('notNull');

            const errors = [];
            if (fieldType === LuthierFieldTypeEnum.FLOAT || fieldType === LuthierFieldTypeEnum.MONEY) {
                if (parseInt(precisionControl.value) <= 0) {
                    if ( precisionControl.hasError('precisionBiggerThan0') === false ) {
                        precisionControl.setErrors({
                            'precisionBiggerThan0': true
                        });
                        //precisionControl.updateValueAndValidity();
                    }
                    errors.push({ precisionBiggerThan0: true });
                }
                else {
                    if ( precisionControl.hasError('precisionBiggerThan0') === true ) {
                        delete precisionControl.errors.precisionBiggerThan0;
                        precisionControl.updateValueAndValidity();
                    }
                }
            }
            else if (fieldType === LuthierFieldTypeEnum.STRING) {
                if (parseInt(sizeControl.value) <= 0) {
                    if ( sizeControl.hasError('sizeBiggerThan0') === false ) {
                        sizeControl.setErrors({
                            'sizeBiggerThan0': true
                        });
                        errors.push({ sizeBiggerThan0: true });
                        //sizeControl.updateValueAndValidity();
                    }
                }
                else {
                    if ( sizeControl.hasError('sizeBiggerThan0') === true ) {
                        delete sizeControl.errors.sizeBiggerThan0;
                        sizeControl.updateValueAndValidity();
                    }
                }
            }
            if (pkControl && notNullControl) {
                if (UtilFunctions.parseBoolean(pkControl.value) && !UtilFunctions.parseBoolean(notNullControl.value)) {
                    notNullControl.setErrors({
                        'forbiddenValue': true
                    });
                    errors.push({forbiddenValue: true});
                } else {
                    if (notNullControl.hasError('forbiddenValue') === true) {
                        delete notNullControl.errors.forbiddenValue;
                        notNullControl.updateValueAndValidity();
                    }
                }
            }
            if (UtilFunctions.isValidStringOrArray(allFields) === true && UtilFunctions.isValidStringOrArray(nameControl.value) === true) {
                const totalSameName = allFields.controls.filter(x =>
                    UtilFunctions.isValidStringOrArray(x.get('name').value) &&
                    x.get('name').value.toString().toUpperCase() === nameControl.value.toString().toUpperCase()).length;
                if (totalSameName > 1 && nameControl.hasError('sameName') === false) {
                    nameControl.setErrors({
                        'sameName': true
                    });
                    errors.push({ sameName: true });
                }
                else if (nameControl.hasError('sameName') === true) {
                    delete nameControl.errors.sameName;
                    nameControl.updateValueAndValidity();
                }

            }
            else if (nameControl.hasError('sameName') === true) {
                delete nameControl.errors.sameName;
                nameControl.updateValueAndValidity();
            }

            if (UtilFunctions.isValidStringOrArray(errors) === true) {
                return errors;
            }
            return null;
        };
    }
    static validateDatasource(datasource?: MatTableDataSource<LuthierTableFieldModel>) : boolean {
        const allFields = datasource ? datasource.data : null;
        let needUpdate = false;
        if (UtilFunctions.isValidStringOrArray(allFields) === true) {
            allFields.forEach((field, index) => {

                const errors : {[key: string]: Array<string>} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo nome é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.fieldType) === false) {
                    errors['fieldType'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.size) === false) {
                    errors['size'] = ['Campo tamanho é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.key) === false) {
                    errors['key'] = ['Campo pk é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.search) === false) {
                    errors['search'] = ['Campo busca é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.label) === false) {
                    errors['label'] = ['Campo rótulo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.precision) === false) {
                    errors['precision'] = ['Campo precisão é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (field.fieldType === LuthierFieldTypeEnum.FLOAT || field.fieldType === LuthierFieldTypeEnum.MONEY) {
                    if (field.precision <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['precision']) === false) {
                            errors['precision'] = [];
                        }
                        errors['precision'].push('Precisão deve ser maior que 0');
                    }
                }
                else if (field.fieldType === LuthierFieldTypeEnum.STRING) {
                    if (field.size <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['size']) === false) {
                            errors['size'] = [];
                        }
                        errors['size'].push('Tamanho deve ser maior que 0');
                    }
                }
                if (UtilFunctions.parseBoolean(field.key) && !UtilFunctions.parseBoolean(field.notNull)) {
                    errors['notNull'] = ['Campos chave devem ser obrigatórios'];
                }
                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = allFields.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                console.log('validation');
                console.log(errors);
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }

            })
            return needUpdate;
        }

    }
    static validateTable(table: LuthierTableModel) : boolean {
        let needUpdate = false;
        table.invalidFields = {};

        if (UtilFunctions.isValidStringOrArray(table.fields) === true) {
            table.fields.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo nome é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.attributeName) === false) {
                    errors['attributeName'] = ['Campo nome do atributo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.fieldType) === false) {
                    errors['fieldType'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.size) === false) {
                    errors['size'] = ['Campo tamanho é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.key) === false) {
                    errors['key'] = ['Campo pk é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.search) === false) {
                    errors['search'] = ['Campo busca é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.label) === false) {
                    errors['label'] = ['Campo rótulo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.precision) === false) {
                    errors['precision'] = ['Campo precisão é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (field.fieldType === LuthierFieldTypeEnum.FLOAT || field.fieldType === LuthierFieldTypeEnum.MONEY) {
                    if (field.precision <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['precision']) === false) {
                            errors['precision'] = [];
                        }
                        errors['precision'].push('Precisão deve ser maior que 0');
                    }
                }
                else if (field.fieldType === LuthierFieldTypeEnum.STRING) {
                    if (field.size <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['size']) === false) {
                            errors['size'] = [];
                        }
                        errors['size'].push('Tamanho deve ser maior que 0');
                    }
                }
                if (UtilFunctions.parseBoolean(field.key) && !UtilFunctions.parseBoolean(field.notNull)) {
                    errors['notNull'] = ['Campos chave devem ser obrigatórios'];
                }
                if (UtilFunctions.isValidStringOrArray(field.staticFields)) {
                    field.staticFields.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: Array<any>} = {};
                        if (UtilFunctions.isValidStringOrArray(child.caption) === false) {
                            errorsChild['caption'] = ['Campo chave é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.value) === false) {
                            errorsChild['value'] = ['Campo valor é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.permissionType) === false) {
                            errorsChild['permissionType'] = ['Campo tipo de pemissão é obrigatório'];
                        }

                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['staticFields']) === false) {
                                errors['staticFields'] = {};
                            }
                            errors['staticFields'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }
                    });
                }
                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = table.fields.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['fields']) === false) {
                        table.invalidFields['fields'] = {};
                    }
                    table.invalidFields['fields'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(table.customFields) === true) {
            table.customFields.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo nome é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.attributeName) === false) {
                    errors['attributeName'] = ['Campo nome do atributo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.fieldType) === false) {
                    errors['fieldType'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.size) === false) {
                    errors['size'] = ['Campo tamanho é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.key) === false) {
                    errors['key'] = ['Campo pk é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.search) === false) {
                    errors['search'] = ['Campo busca é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.label) === false) {
                    errors['label'] = ['Campo rótulo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.precision) === false) {
                    errors['precision'] = ['Campo precisão é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (field.fieldType === LuthierFieldTypeEnum.FLOAT || field.fieldType === LuthierFieldTypeEnum.MONEY) {
                    if (field.precision <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['precision']) === false) {
                            errors['precision'] = [];
                        }
                        errors['precision'].push('Precisão deve ser maior que 0');
                    }
                }
                else if (field.fieldType === LuthierFieldTypeEnum.STRING) {
                    if (field.size <= 0) {
                        if (UtilFunctions.isValidStringOrArray(errors['size']) === false) {
                            errors['size'] = [];
                        }
                        errors['size'].push('Tamanho deve ser maior que 0');
                    }
                }
                if (UtilFunctions.parseBoolean(field.key) && !UtilFunctions.parseBoolean(field.notNull)) {
                    errors['notNull'] = ['Campos chave devem ser obrigatórios'];
                }
                if (UtilFunctions.isValidStringOrArray(field.staticFields)) {
                    field.staticFields.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: any} = {};
                        if (UtilFunctions.isValidStringOrArray(child.caption) === false) {
                            errorsChild['caption'] = ['Campo chave é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.value) === false) {
                            errorsChild['value'] = ['Campo valor é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.permissionType) === false) {
                            errorsChild['permissionType'] = ['Campo tipo de pemissão é obrigatório'];
                        }
                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['staticFields']) === false) {
                                errors['staticFields'] = {};
                            }
                            errors['staticFields'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }
                    });
                }
                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = table.customFields.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['customFields']) === false) {
                        table.invalidFields['customFields'] = {};
                    }
                    table.invalidFields['customFields'][index] = errors;
                }


            })
        }
        if (UtilFunctions.isValidStringOrArray(table.references) === true) {
            table.references.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo nome é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.status) === false) {
                    errors['status'] = ['Campo status é obrigatório'];
                }
                if (!field.tablePK || UtilFunctions.isValidStringOrArray(field.tablePK.name) === false) {
                    errors['tablePK.name'] = ['Campo tabela PK é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.onDelete) === false) {
                    errors['onDelete'] = ['Campo onDelete é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.onUpdate) === false) {
                    errors['onUpdate'] = ['Campo onUpdate é obrigatório'];
                }
                if (!field.lookupFastField || UtilFunctions.isValidStringOrArray(field.lookupFastField.name) === false) {
                    errors['lookupFastField'] = ['Campo lookup chave é obrigatório'];
                }
                if (!field.lookupDescriptionField || UtilFunctions.isValidStringOrArray(field.lookupDescriptionField.name) === false) {
                    errors['lookupDescriptionField'] = ['Campo lookup descrição é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.fieldsReference)) {
                    field.fieldsReference.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: any} = {};
                        if (!child.fieldPK || UtilFunctions.isValidStringOrArray(child.fieldPK.name) === false) {
                            errorsChild['fieldPK'] = ['Campo pk é obrigatório'];
                        }
                        if (!child.fieldFK || UtilFunctions.isValidStringOrArray(child.fieldFK.name) === false) {
                            errorsChild['fieldPK'] = ['Campo fk é obrigatório'];
                        }

                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['fieldsReference']) === false) {
                                errors['fieldsReference'] = {};
                            }
                            errors['fieldsReference'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }
                    });
                }
                else {
                    errors['fieldsReference'] = ['É obrigatório ter campos de referência']
                }
                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = table.references.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['references']) === false) {
                        table.invalidFields['references'] = {};
                    }
                    table.invalidFields['references'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(table.indexes) === true) {
            table.indexes.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo nome é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.creationOrder) === false) {
                    errors['creationOrder'] = ['Campo ordem de criação é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.sortType) === false) {
                    errors['sortType'] = ['Campo ordenação é obrigatório'];
                }

                if (UtilFunctions.isValidStringOrArray(field.indexFields)) {
                    field.indexFields.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: any} = {};
                        if (!child.tableField || UtilFunctions.isValidStringOrArray(child.tableField.name) === false) {
                            errorsChild['tableField'] = ['Campo da tabela é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.order) === false) {
                            errorsChild['order'] = ['Campo ordem é obrigatório'];
                        }

                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['indexFields']) === false) {
                                errors['indexFields'] = {};
                            }
                            errors['indexFields'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }
                    });
                }
                else {
                    errors['indexFields'] = ['É obrigatório ter campos de índice']
                }
                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = table.indexes.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['indexes']) === false) {
                        table.invalidFields['indexes'] = {};
                    }
                    table.invalidFields['indexes'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(table.searchs) === true) {
            table.searchs.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo descrição é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.type) === false) {
                    errors['type'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.subsystems) === false) {
                    errors['type'] = ['Campo subsistemas é obrigatório'];
                }

                if (UtilFunctions.isValidStringOrArray(field.searchFields)) {
                    field.searchFields.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: any} = {};
                        if (!child.tableField || UtilFunctions.isValidStringOrArray(child.tableField.name) === false) {
                            errorsChild['tableField'] = ['Campo da tabela é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.order) === false) {
                            errorsChild['order'] = ['Campo ordem é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.label) === false) {
                            errorsChild['label'] = ['Campo caption é obrigatório'];
                        }

                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['searchFields']) === false) {
                                errors['searchFields'] = {};
                            }
                            errors['searchFields'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }

                    });
                }

                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = table.searchs.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['searchs']) === false) {
                        table.invalidFields['searchs'] = {};
                    }
                    table.invalidFields['searchs'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(table.groupInfos) === true) {
            table.groupInfos.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.description) === false) {
                    errors['description'] = ['Campo descrição é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.groupInfoType) === false) {
                    errors['groupInfoType'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }

                if (UtilFunctions.isValidStringOrArray(field.description) === true) {
                    const totalSameName = table.groupInfos.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.description) &&
                        x.description.toUpperCase() === field.description.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['description']) === false) {
                            errors['description'] = [];
                        }
                        errors['description'].push('Descrições não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(table.invalidFields['groupInfos']) === false) {
                        table.invalidFields['groupInfos'] = {};
                    }
                    table.invalidFields['groupInfos'][index] = errors;
                }

            })
        }
        if (table.objectType === 'VIEW') {
            if (UtilFunctions.isValidStringOrArray(table.views)) {
                let invalid = true;
                table.views.forEach(field => {
                    if (field.databaseType === LuthierViewBodyEnum.GENERICO ||
                        field.databaseType === LuthierViewBodyEnum.CUSTOM ||
                        field.databaseType === table.currentViewBodyType) {
                        if (UtilFunctions.isValidStringOrArray(field.body) && invalid === true) {
                            invalid = false;
                        }
                    }
                })
                if (invalid) {
                    table.invalidFields['views'] = ['Ao menos um corpo de view válido para o banco atual deve ser definido'];
                }
            }
            else {
                table.invalidFields['views'] = ['Ao menos um corpo de view deve ser definido'];
            }
        }
        return needUpdate;

    }
    static validateDataset(dataset: LuthierVisionDatasetModel) : boolean {
        let needUpdate = false;
        dataset.invalidFields = {};

        if (UtilFunctions.isValidStringOrArray(dataset.fields) === true) {
            dataset.fields.forEach((field, index) => {

                const errors : {[key: string]: any} = {};

                if (UtilFunctions.isValidStringOrArray(field.fieldType) === false) {
                    errors['fieldType'] = ['Campo tipo de campo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.search) === false) {
                    errors['search'] = ['Campo busca é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.label) === false) {
                    errors['label'] = ['Campo rótulo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (!field.tableField || UtilFunctions.isValidStringOrArray(field.tableField.name) === false) {
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                    errors['tableField.name'] = ['Campo nome é obrigatório'];
                    errors['tableField.fieldType'] = ['Campo tipo é obrigatório'];
                    errors['tableField.size'] = ['Campo tamanho é obrigatório'];
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                }

                if (field.fieldType === LuthierVisionDatasetFieldTypeEnum.LOOKUP) {
                    if (!field.reference || !UtilFunctions.isValidStringOrArray(field.reference.name)) {
                        errors['reference.name'] = ['Campo chave é obrigatório'];
                    }
                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(dataset.invalidFields['fields']) === false) {
                        dataset.invalidFields['fields'] = {};
                    }
                    dataset.invalidFields['fields'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(dataset.customFields) === true) {
            dataset.fields.forEach((field, index) => {

                const errors : {[key: string]: any} = {};

                if (UtilFunctions.isValidStringOrArray(field.fieldType) === false) {
                    errors['fieldType'] = ['Campo tipo de campo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.search) === false) {
                    errors['search'] = ['Campo busca é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.label) === false) {
                    errors['label'] = ['Campo rótulo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (!field.tableField || UtilFunctions.isValidStringOrArray(field.tableField.name) === false) {
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                    errors['tableField.name'] = ['Campo nome é obrigatório'];
                    errors['tableField.fieldType'] = ['Campo tipo é obrigatório'];
                    errors['tableField.size'] = ['Campo tamanho é obrigatório'];
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                    errors['tableField.key'] = ['Campo chave é obrigatório'];
                }

                if (field.fieldType === LuthierVisionDatasetFieldTypeEnum.LOOKUP) {
                    if (!field.reference || !UtilFunctions.isValidStringOrArray(field.reference.name)) {
                        errors['reference.name'] = ['Campo chave é obrigatório'];
                    }
                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(dataset.invalidFields['customFields']) === false) {
                        dataset.invalidFields['customFields'] = {};
                    }
                    dataset.invalidFields['customFields'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(dataset.searchs) === true) {
            dataset.searchs.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.name) === false) {
                    errors['name'] = ['Campo descrição é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.type) === false) {
                    errors['type'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.subsystems) === false) {
                    errors['type'] = ['Campo subsistemas é obrigatório'];
                }

                if (UtilFunctions.isValidStringOrArray(field.searchFields)) {
                    field.searchFields.forEach((child, indexChild) => {
                        const errorsChild : {[key: string]: any} = {};
                        if (!child.field || UtilFunctions.isValidStringOrArray(child.field.name) === false) {
                            errorsChild['field'] = ['Campo da tabela é obrigatório'];
                        }
                        if (!child.dataset || UtilFunctions.isValidStringOrArray(child.dataset.name) === false) {
                            errorsChild['dataset'] = ['Campo dataset é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.order) === false) {
                            errorsChild['order'] = ['Campo ordem é obrigatório'];
                        }
                        if (UtilFunctions.isValidStringOrArray(child.label) === false) {
                            errorsChild['label'] = ['Campo caption é obrigatório'];
                        }

                        if (UtilFunctions.isValidObject(errorsChild) === true) {
                            child.invalidFields = errorsChild;
                            if (UtilFunctions.isValidObject(errors['searchFields']) === false) {
                                errors['searchFields'] = {};
                            }
                            errors['searchFields'][indexChild] = errorsChild;

                        }
                        else {
                            child.invalidFields = null;
                        }

                    });
                }

                if (UtilFunctions.isValidStringOrArray(field.name) === true) {
                    const totalSameName = dataset.searchs.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.name) &&
                        x.name.toUpperCase() === field.name.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['name']) === false) {
                            errors['name'] = [];
                        }
                        errors['name'].push('Nomes não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(dataset.invalidFields['searchs']) === false) {
                        dataset.invalidFields['searchs'] = {};
                    }
                    dataset.invalidFields['searchs'][index] = errors;
                }

            })
        }
        if (UtilFunctions.isValidStringOrArray(dataset.groupInfos) === true) {
            dataset.groupInfos.forEach((field, index) => {

                const errors : {[key: string]: any} = {};
                if (UtilFunctions.isValidStringOrArray(field.description) === false) {
                    errors['description'] = ['Campo descrição é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.groupInfoType) === false) {
                    errors['groupInfoType'] = ['Campo tipo é obrigatório'];
                }
                if (UtilFunctions.isValidStringOrArray(field.order) === false) {
                    errors['order'] = ['Campo ordem é obrigatório'];
                }

                if (UtilFunctions.isValidStringOrArray(field.description) === true) {
                    const totalSameName = dataset.groupInfos.filter(x =>
                        UtilFunctions.isValidStringOrArray(x.description) &&
                        x.description.toUpperCase() === field.description.toUpperCase()).length;
                    if (totalSameName > 1) {

                        if (UtilFunctions.isValidStringOrArray(errors['description']) === false) {
                            errors['description'] = [];
                        }
                        errors['description'].push('Descrições não podem ser repetidos');
                    }

                }
                if (_.isEqual(field.invalidFields, errors) === false ) {
                    field.invalidFields = errors;
                    //datasource[index] = field;
                    needUpdate = true;
                }
                if (UtilFunctions.isValidObject(errors) === true) {
                    if (UtilFunctions.isValidObject(dataset.invalidFields['groupInfos']) === false) {
                        dataset.invalidFields['groupInfos'] = {};
                    }
                    dataset.invalidFields['groupInfos'][index] = errors;
                }

            })
        }
        return needUpdate;

    }
}
