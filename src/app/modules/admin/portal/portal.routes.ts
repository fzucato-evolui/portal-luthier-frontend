import {Routes} from '@angular/router';
import {Error404Component} from '../pages/error/error-404/error-404.component';

export default [

    // Simple
    {
        path: "",
        children: [
            {path: "", component: Error404Component},
            {path: "luthier-database", loadChildren: () => import('app/modules/admin/portal/luthier-database/portal-luthier-database.routes')},
            {path: "config", loadChildren: () => import('app/modules/admin/portal/config/portal-config.routes')},
            {path: "historical", loadChildren: () => import('app/modules/admin/portal/luthier-history/portal-luthier-history.routes')},

        ]
    },
] as Routes;
