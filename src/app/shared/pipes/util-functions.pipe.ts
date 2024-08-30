import {Pipe, PipeTransform} from '@angular/core';
import {UtilFunctions} from "../util/util-functions";

@Pipe({
    name: 'isValidStringOrArray'
})
export class IsValidStringOrArrayPipe implements PipeTransform{
    transform(value: string | any[]): boolean {
        return UtilFunctions.isValidStringOrArray(value);
    }

}

@Pipe({
    name: 'isValidObject'
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

