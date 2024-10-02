import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { setContext } from '@apollo/client/link/context';

import { getAuthenticationInfo } from './objects/authentication';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);

      const basic = setContext((operation, context) => ({ headers: { Accept: 'charset=utf-8' } }));
      const auth = setContext((operation, context) => {
        const info = getAuthenticationInfo();
        if (info === null) {
          return {}
        } else {
          return { headers: { Authorization: info.token } }
        }
      });

      return {
        default: {
          link: ApolloLink.from([basic, auth, httpLink.create({ uri: 'http://127.0.0.1:27321/api/v0/graphql' })]),
          cache: new InMemoryCache(),
          defaultOptions: {
            watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'ignore' },
            query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
            mutate: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
          },
        },
        ssoGraphQL: {
          link: httpLink.create({ uri: 'http://127.0.0.1:27321/api/v0/sso/graphql' }),
          cache: new InMemoryCache(),
          defaultOptions: {
            watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'ignore' },
            query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
            mutate: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
          },
        },
      };
    }),
  ]
};
