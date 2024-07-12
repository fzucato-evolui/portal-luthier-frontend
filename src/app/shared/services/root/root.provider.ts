import {APP_INITIALIZER, EnvironmentProviders, inject, Provider} from '@angular/core';
import {RootService} from "./root.service";
import {provideHttpClient} from '@angular/common/http';


export const provideRoot = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        provideHttpClient(),
        {
            provide: APP_INITIALIZER,
            useFactory: () =>
            {
                const service = inject(RootService);
                return () => service.get();
            },
            multi:  true
        }
    ];
};
