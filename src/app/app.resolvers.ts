import {inject} from '@angular/core';
import {NavigationService} from 'app/core/navigation/navigation.service';
import {forkJoin, of} from 'rxjs';
import {LuthierService} from './modules/admin/luthier/luthier.service';
import {PortalLuthierDatabaseService} from './modules/admin/portal/luthier-database/portal-luthier-database.service';
import {UtilFunctions} from './shared/util/util-functions';
import {UserService} from './shared/services/user/user.service';

export const initialDataResolver = () =>
{
    const userService = inject(UserService);
    const luthierService = inject(LuthierService);
    const databaseService = inject(PortalLuthierDatabaseService);
    const navigationService = inject(NavigationService);
    /*
    const messagesService = inject(MessagesService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

     */

    // Fork join multiple API endpoint calls to wait all of them to finish
    return forkJoin([
        databaseService.getAll(),
        UtilFunctions.isValidStringOrArray(userService.luthierDatabase) ? luthierService.getDatabases() : of(null),
        navigationService.get(),
        //messagesService.getAll(),
        //notificationsService.getAll(),
        //quickChatService.getChats(),
        //shortcutsService.getAll(),
    ]);
};
