import {Injectable} from '@angular/core';
import {Navigation} from 'app/core/navigation/navigation.types';
import {Observable, of, ReplaySubject} from 'rxjs';
import {FuseNavigationItem} from '../../../@fuse/components/navigation';
import {UserService} from '../../shared/services/user/user.service';
import {cloneDeep} from 'lodash-es';
import {UtilFunctions} from '../../shared/util/util-functions';

export const mainNavigation: FuseNavigationItem[] = [
    {
        id      : 'portal',
        title   : 'Portal',
        subtitle: '',
        type    : 'aside',
        awesomeIcon    : {fontSet: 'fas', fontIcon: 'fa-dungeon'},
        link    : '/portal',
        children: [
            {
                id   : 'poral.luthier-databases',
                title: 'Bases Luthier',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-database"},
                link : '/portal/luthier-database',
            },
            {
                id   : 'portal.config',
                title: 'Configurações',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-wrench"},
                link : '/portal/config',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'portal.user-storage-config',
                title: 'Configurações de Armazenamento',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-boxes-packing"},
                link : '/portal/user-storage-config',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'portal.storage',
                title: 'Armazenamento',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-box"},
                link : '/portal/storage',
                roles : ['ROLE_HYPER']
            },
            {
                id   : 'portal.users',
                title: 'Usuários',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-users"},
                link : '/portal/users',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'portal.history',
                title: 'Histórico',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-clock-rotate-left"},
                link : '/portal/historical',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id      : 'portal.luthier-context',
                title   : 'Contexto',
                type    : 'basic',
                awesomeIcon    : {fontSet: 'fas', fontIcon: 'fa-arrows-to-circle'},
                link    : '/portal/luthier-context',
                roles : ['ROLE_HYPER']
            },
            {
                id      : 'portal.license',
                title   : 'Licenças',
                subtitle: '',
                type    : 'basic',
                awesomeIcon    : {fontSet: 'fas', fontIcon: 'fa-key'},
                link    : '/portal/license',
                roles : ['ROLE_HYPER']
            },

        ]
    },
    {
        id      : 'luthier',
        title   : 'Luthier',
        subtitle: '',
        type    : 'aside',
        awesomeIcon    : {fontSet: 'fas', fontIcon: 'fa-guitar'},
        link    : '/luthier',
        children: [
            {
                id   : 'luthier.project',
                title: 'Projeto',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-cube"},
                link : '/luthier/project',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.connection',
                title: 'Conexão',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-link"},
                link : '/luthier/connection',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.users',
                title: 'Usuários',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-user"},
                link : '/luthier/users',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.dictionary',
                title: 'Dicionário',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-spell-check"},
                link : '/luthier/dictionary',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.manager',
                title: 'Utilitário',
                type : 'basic',
                //hidden  : item => {return true},
                awesomeIcon    : {fontSet: 'fab', fontIcon: 'fa-markdown'},
                link : '/luthier/manager',
            },
            {
                id   : 'luthier.resources',
                title: 'Recursos',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-paperclip"},
                link : '/luthier/resources',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.modules',
                title: 'Módulos',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-brain"},
                link : '/luthier/modules',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
            {
                id   : 'luthier.subsystems',
                title: 'Subsistemas',
                type : 'basic',
                awesomeIcon : {fontSet:"fas", fontIcon:"fa-circle-nodes"},
                link : '/luthier/subsystems',
                roles : ['ROLE_SUPER', 'ROLE_HYPER']
            },
        ]
    },



];
@Injectable({providedIn: 'root'})
export class NavigationService
{
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    /**
     * Constructor
     */
    constructor(private _userService: UserService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation>
    {
        return this._navigation.asObservable();
    }

    get(): Observable<any>
    {
        const items = cloneDeep(mainNavigation);
        items.forEach(item => {
            if(item.id === 'luthier' || item.id === 'portal') {
                item.children.sort((a,b) => a.title.localeCompare(b.title));
            }
            this.setRoles(item);
        });
        const navigation: Navigation = {
            compact: items,
            default   : null,
            futuristic: null,
            horizontal: null,
            secondary: null
        }
        this._navigation.next(navigation);
        return of(navigation);
    }

    setRoles(item: FuseNavigationItem) {
        if (UtilFunctions.isValidStringOrArray(item.roles) === true) {
            if (this._userService.hasAnyAuthority(item.roles) === false) {
                item.hidden = (item) => {
                    return true;
                }
            }
        }
        if (UtilFunctions.isValidStringOrArray(item.children) === true) {
            item.children.forEach(child => {
                this.setRoles(child);
            })
        }
    }
}
