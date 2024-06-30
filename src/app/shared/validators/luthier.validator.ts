import {AbstractControl, FormArray, ValidationErrors, ValidatorFn} from '@angular/forms';
import {LuthierFieldTypeEnum} from '../models/luthier.model';
import {UtilFunctions} from '../util/util-functions';

export class LuthierFieldValidator {
    static validate(allFields?: FormArray): ValidatorFn {
        return (formGroup: AbstractControl): ValidationErrors | null => {
            const fieldType = formGroup.get('fieldType').value as LuthierFieldTypeEnum;
            const precisionControl = formGroup.get('precision');
            const sizeControl = formGroup.get('size');
            const nameControl = formGroup.get('name');

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
}
