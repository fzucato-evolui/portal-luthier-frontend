import {Pipe, PipeTransform} from '@angular/core';
import {UtilFunctions} from "../util/util-functions";
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {TranslocoService} from '@ngneat/transloco';

@Pipe({
    name: 'isValidStringOrArray',
})
export class IsValidStringOrArrayPipe implements PipeTransform{
    transform(value: string | any[]): boolean {
        return UtilFunctions.isValidStringOrArray(value);
    }

}

@Pipe({
    name: 'isValidObject',
})
export class IsValidObjectPipe implements PipeTransform{
    transform(value: string | any[]): boolean {
        return UtilFunctions.isValidObject(value);
    }

}

@Pipe({
    name: 'enumArray'
})
export class EnumToArrayPipe implements PipeTransform {
    transform(data: Object) {
        //console.log(data);
        let keys = Object.keys(data);
        //console.log(keys);
        //keys = keys.slice(0, keys.length / 2);

        const keyPair = [];
        for (let i = 0; i < keys.length; i++) {
            const enumMember = keys[i];
            keyPair.push({key: enumMember, value: data[enumMember]});
        }
        return keyPair;
    }
}



@Pipe({
    name: 'filterJson'
})
export class FilterJsonPipe implements PipeTransform {

    transform(items: any[], filters:{[key: string]: string}): any[] {
        if(!items) return [];
        if(!filters) return items;
        if (!FilterJsonPipe.validate(filters)) return items;

        return items.filter((value) => {
            for(let field in filters) {
                if(FilterJsonPipe.isEquals(filters[field], FilterJsonPipe.pathDataAccessor(value, field))) {
                    return value;
                }
            }
        });
    }

    private static validate(filters:{[key: string]: string}) {
        let isValue = false;
        for (let field in filters) {
            if (filters[field] !== undefined && filters[field] !== '') {
                isValue = true;
            }
        }
        return isValue;
    }

    public static isEquals(filter: any, value) {
        value = UtilFunctions.removeAccents(value.toString()).toLowerCase();
        filter = UtilFunctions.removeAccents(filter.toString()).toLowerCase();
        return value.includes(filter);
    }

    public static pathDataAccessor(item: any, path: string): any {
        return path.split('.')
            .reduce((accumulator: any, key: string) => {
                return accumulator ? accumulator[key] : undefined;
            }, item);
    }
}

@Pipe({
    name: 'asFormControl',
})
export class AsFormControlPipe implements PipeTransform {
    transform(control: AbstractControl | null): FormControl | null {
        return control instanceof FormControl ? control : null;
    }
}

@Pipe({
    name: 'asFormGroup',
})
export class AsFormGroupPipe implements PipeTransform {
    transform(control: AbstractControl | null): FormGroup | null {
        return control instanceof FormGroup ? control : null;
    }
}

@Pipe({
    name: 'enumTranslate'
})
export class EnumTranslatePipe implements PipeTransform {
    constructor(private translocoService: TranslocoService) {}

    transform(value: string, enumName: string): string {
        if (UtilFunctions.isValidStringOrArray(value) === false) {
            return '';
        }
        // Tenta traduzir usando a chave específica do enum
        const translationKey = `enums.${enumName}.${value}`;
        const translation = this.translocoService.translate(translationKey);
        //console.log('tradução', translationKey, translation);

        // Se não encontrar tradução específica, retorna o valor original
        return translation !== translationKey ? translation.toUpperCase() : value;
    }
}

@Pipe({ name: 'simNao' })
export class SimNaoPipe implements PipeTransform {
  transform(value: any): string {
    if (value === true || (typeof value === 'string' && value.toLowerCase() === 'true')) {
      return 'SIM';
    }
    if (value === false || (typeof value === 'string' && value.toLowerCase() === 'false')) {
      return 'NÃO';
    }
    return '';
  }
}

