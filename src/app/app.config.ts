import {provideHttpClient} from '@angular/common/http';
import {ApplicationConfig} from '@angular/core';
import {LuxonDateAdapter} from '@angular/material-luxon-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading} from '@angular/router';
import {provideFuse} from '@fuse';
import {appRoutes} from 'app/app.routes';
import {provideAuth} from 'app/core/auth/auth.provider';
import {provideIcons} from 'app/core/icons/icons.provider';
import {provideTransloco} from 'app/core/transloco/transloco.provider';
import {mockApiServices} from 'app/mock-api';
import {provideRoot} from './shared/services/root/root.provider';
import {HIGHLIGHT_OPTIONS} from 'ngx-highlightjs';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideRouter(appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({scrollPositionRestoration: 'enabled'}),
        ),

        // Material Date Adapter
        {
            provide : DateAdapter,
            useClass: LuxonDateAdapter,
        },
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
        {
            provide : MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'dd/MM/yyyy',
                },
                display: {
                    dateInput: 'dd/MM/yyyy',
                    monthYearLabel: 'MMMM yyyy',
                    dateA11yLabel: 'dd/MM/yyyy',
                    monthYearA11yLabel: 'MMMM yyyy',
                }
            },
        },

        // Transloco Config
        provideTransloco(),
        provideRoot(),
        // Fuse
        provideAuth(),
        provideIcons(),

        // Highlight.js Global Configuration
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
                languages: {
                    typescript: () => import('highlight.js/lib/languages/typescript'),
                    javascript: () => import('highlight.js/lib/languages/javascript'),
                    css: () => import('highlight.js/lib/languages/css'),
                    xml: () => import('highlight.js/lib/languages/xml'),
                    json: () => import('highlight.js/lib/languages/json'),
                    java: () => import('highlight.js/lib/languages/java'),
                    python: () => import('highlight.js/lib/languages/python'),
                    php: () => import('highlight.js/lib/languages/php'),
                    sql: () => import('highlight.js/lib/languages/sql'),
                    bash: () => import('highlight.js/lib/languages/bash'),
                    markdown: () => import('highlight.js/lib/languages/markdown'),
                    yaml: () => import('highlight.js/lib/languages/yaml'),
                    dockerfile: () => import('highlight.js/lib/languages/dockerfile'),
                    plaintext: () => import('highlight.js/lib/languages/plaintext')
                }
            }
        },

        provideFuse({
            mockApi: {
                delay   : 0,
                services: mockApiServices,
            },
            fuse   : {
                layout : 'compact',
                scheme : 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme  : 'theme-default',
                themes : [
                    {
                        id  : 'theme-default',
                        name: 'Default',
                    },
                    {
                        id  : 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id  : 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id  : 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id  : 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id  : 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
    ],
};
