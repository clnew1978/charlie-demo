import './assets/main.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { createApolloProvider } from '@vue/apollo-option';
import { useAuthenticationStore } from './stores/authentication';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';

const app = createApp(App);

app.use(createPinia());

app.use(createVuetify({ components, directives, icons: { defaultSet: 'mdi', aliases, sets: { mdi } } }));

const basic = setContext(() => ({ headers: { Accept: '*/*' } }));
const auth = setContext(() => {
    const info = useAuthenticationStore();
    if (info.isLogin) {
        return { headers: { Authorization: info.token } };
    } else {
        return {};
    }
});

const httpLink = new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_ENDPOINT });
const defaultApolloClient = new ApolloClient({
    link: ApolloLink.from([basic, auth, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'ignore' },
        query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
        mutate: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
    },
});

const ssoApolloClient = new ApolloClient({
    uri: import.meta.env.VITE_SSO_GRAPHQL_ENDPOINT,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: { fetchPolicy: 'no-cache', errorPolicy: 'ignore' },
        query: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
        mutate: { fetchPolicy: 'no-cache', errorPolicy: 'all' },
    },
});

const apolloProvider = createApolloProvider({
    clients: { defaultApolloClient, ssoApolloClient },
    defaultClient: defaultApolloClient,
});
app.use(apolloProvider);

app.mount('#app');

