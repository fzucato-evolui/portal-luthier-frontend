/* eslint-disable */

// Updated at: 20210425 - 1792 icons
import {DatabaseTypeEnum, PortalLuthierDatabaseModel} from '../../../../shared/models/portal-luthier-database.model';

export const databases: PortalLuthierDatabaseModel[] = [
    {
        id: 1,
        identifier: 'Tributos_Master',
        description: 'Base luthier master do tributos',
        database: 'TBT_LUTHIER',
        host: 'development-sqlserver-tributos.ce0e46qwxnjo.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'QKDquRTJBBdM2MvS',
        databaseType: DatabaseTypeEnum.MSSQL
    },
    {
        id: 2,
        identifier: 'Regente_Master',
        description: 'Base luthier master do regente',
        database: 'LUTHIER',
        host: 'development-sqlserver-new.ce0e46qwxnjo.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'QKDquRTJBBdM2MvS',
        databaseType: DatabaseTypeEnum.MSSQL
    },
    {
        id: 3,
        identifier: 'Localhost_Postgres',
        description: 'Base luthier postgres Fábio',
        database: 'portalLuthier',
        host: 'localhost',
        user: 'postgres',
        password: 'QKDquRTJBBdM2MvS',
        databaseType: DatabaseTypeEnum.POSTGRES
    },
    {
        id: 4,
        identifier: 'Localhost_H2',
        description: 'Base luthier h2 Fábio',
        database: 'LUTHIER',
        host: 'file:./h2db/db/regente;DB_CLOSE_DELAY=-1',
        user: 'admin',
        password: 'QKDquRTJBBdM2MvS',
        databaseType: DatabaseTypeEnum.H2
    }
];
