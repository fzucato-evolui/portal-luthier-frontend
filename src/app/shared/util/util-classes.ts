import {UtilFunctions} from './util-functions';

export class FilterPredicateUtil {
    private columns: Array<string>;
    constructor(columns?: Array<string>) {
        this.columns = columns;
    }
    public static withColumns(columns: Array<string>): FilterPredicateUtil {
        return new FilterPredicateUtil(columns);
    }

    public instance (data: any, filter): boolean  {
        if (UtilFunctions.isValidStringOrArray(filter) === false) {
            return true;
        }
        if (UtilFunctions.isValidStringOrArray(this.columns) === false) {
            const dataStr = JSON.stringify(data).toLowerCase();
            if (UtilFunctions.isValidStringOrArray(dataStr) === false) {
                return false;
            }
            return UtilFunctions.removeAccents(dataStr).indexOf(UtilFunctions.removeAccents(filter.toLowerCase())) != -1;
        }
        else {

            for(const column of this.columns) {
                const value = UtilFunctions.pathDataAccessor(data,column);
                if (UtilFunctions.isValidStringOrArray(value) === true &&
                    UtilFunctions.removeAccents(value.toString().toLowerCase()).indexOf(UtilFunctions.removeAccents(filter.toLowerCase())) != -1) {
                    return true;
                }
            }
            return false;
        }
    }
}
