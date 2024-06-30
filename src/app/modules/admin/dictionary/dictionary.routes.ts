import {ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes} from '@angular/router';
import { CardedFullwidthContentScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/fullwidth/content-scroll/fullwidth.component';
import { CardedFullwidthNormalScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/fullwidth/normal-scroll/fullwidth.component';

import { CardedFullwidthPageScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/fullwidth/page-scroll/fullwidth.component';
import { CardedLeftSidebar1ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-1/content-scroll/left-sidebar-1.component';

import { CardedLeftSidebar1NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-1/normal-scroll/left-sidebar-1.component';
import { CardedLeftSidebar1PageScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-1/page-scroll/left-sidebar-1.component';

import { CardedLeftSidebar2ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-2/content-scroll/left-sidebar-2.component';
import { CardedLeftSidebar2NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-2/normal-scroll/left-sidebar-2.component';
import { CardedLeftSidebar2PageScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/left-sidebar-2/page-scroll/left-sidebar-2.component';
import { CardedRightSidebar1ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-1/content-scroll/right-sidebar-1.component';
import { CardedRightSidebar1NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-1/normal-scroll/right-sidebar-1.component';

import { CardedRightSidebar1PageScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-1/page-scroll/right-sidebar-1.component';
import { CardedRightSidebar2ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-2/content-scroll/right-sidebar-2.component';
import { CardedRightSidebar2NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-2/normal-scroll/right-sidebar-2.component';

import { CardedRightSidebar2PageScrollComponent } from 'app/modules/admin/ui/page-layouts/carded/right-sidebar-2/page-scroll/right-sidebar-2.component';
import { LayoutOverviewComponent } from 'app/modules/admin/ui/page-layouts/common/layout-overview/layout-overview.component';

import { EmptyNormalScrollComponent } from 'app/modules/admin/ui/page-layouts/empty/normal-scroll/empty.component';
import { EmptyPageScrollComponent } from 'app/modules/admin/ui/page-layouts/empty/page-scroll/empty.component';

import { OverviewComponent } from 'app/modules/admin/ui/page-layouts/overview/overview.component';
import { SimpleFullwidth1ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-1/content-scroll/fullwidth-1.component';

import { SimpleFullwidth1NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-1/normal-scroll/fullwidth-1.component';
import { SimpleFullwidth1PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-1/page-scroll/fullwidth-1.component';
import { SimpleFullwidth2ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-2/content-scroll/fullwidth-2.component';

import { SimpleFullwidth2NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-2/normal-scroll/fullwidth-2.component';
import { SimpleFullwidth2PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/fullwidth-2/page-scroll/fullwidth-2.component';
import { SimpleLeftSidebar1ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-1/content-scroll/left-sidebar-1.component';

import { SimpleLeftSidebar1NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-1/normal-scroll/left-sidebar-1.component';
import { SimpleLeftSidebar1PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-1/page-scroll/left-sidebar-1.component';
import { SimpleLeftSidebar2ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-2/content-scroll/left-sidebar-2.component';
import { SimpleLeftSidebar2InnerScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-2/inner-scroll/left-sidebar-2.component';

import { SimpleLeftSidebar2NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-2/normal-scroll/left-sidebar-2.component';
import { SimpleLeftSidebar2PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-2/page-scroll/left-sidebar-2.component';
import { SimpleLeftSidebar3ScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-3/content-scroll/left-sidebar-3.component';

import { SimpleLeftSidebar3NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-3/normal-scroll/left-sidebar-3.component';
import { SimpleLeftSidebar3PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/left-sidebar-3/page-scroll/left-sidebar-3.component';
import { SimpleRightSidebar1ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-1/content-scroll/right-sidebar-1.component';

import { SimpleRightSidebar1NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-1/normal-scroll/right-sidebar-1.component';
import { SimpleRightSidebar1PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-1/page-scroll/right-sidebar-1.component';
import { SimpleRightSidebar2ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-2/content-scroll/right-sidebar-2.component';
import { SimpleRightSidebar2InnerScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-2/inner-scroll/right-sidebar-2.component';

import { SimpleRightSidebar2NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-2/normal-scroll/right-sidebar-2.component';
import { SimpleRightSidebar2PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-2/page-scroll/right-sidebar-2.component';
import { SimpleRightSidebar3ContentScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-3/content-scroll/right-sidebar-3.component';

import { SimpleRightSidebar3NormalScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-3/normal-scroll/right-sidebar-3.component';
import { SimpleRightSidebar3PageScrollComponent } from 'app/modules/admin/ui/page-layouts/simple/right-sidebar-3/page-scroll/right-sidebar-3.component';
import {DictionaryComponent} from './dictionary.component';
import {inject} from '@angular/core';
import {ChatService} from '../apps/chat/chat.service';
import {catchError, forkJoin, throwError} from 'rxjs';
import {DictionaryService} from './dictionary.service';

const dictionaryResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const service = inject(DictionaryService);
    const router = inject(Router);

    return forkJoin([
        service.getDatabases(),
        service.getTables()
    ])
};

export default [

    // Simple
    {
        path     : ':id',
        component: DictionaryComponent,
        resolve  : {
            data: dictionaryResolver,
        }
    },
] as Routes;
