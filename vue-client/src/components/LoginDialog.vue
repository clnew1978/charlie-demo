<script setup lang="ts">
import { ref } from 'vue';
import { mdiLogin } from '@mdi/js';
import { gql } from 'graphql-tag';
import { useAuthenticationStore, type AuthenticationInfo } from '../stores/authentication';
</script>

<script lang="ts">
export default {
    data() {
        return {
            store: useAuthenticationStore(),
            showDialog: false,
            name: '',
            password: '',
            users: [],
            showAlert: ref(false),
        }
    },
    methods: {
        onLeave() {
            this.name = '';
            this.password = '';
            this.showAlert = false;
        },
        quit() {
            this.showDialog = false
        },
        login() {
            this.$apollo.mutate({
                mutation: gql`
                    mutation login($name: String!, $password: String!){
                        login(name: $name, password: $password) {
                            token
                            name
                            userType
                        }
                    }`,
                variables: { name: this.name, password: this.password },
                update: (_store, { data: { login } }) => {
                    this.store.login(login as AuthenticationInfo);
                },
            }).then(() => this.quit()).catch(() => this.showAlert = true);
        },
        logout() {
            this.store.logout();
        },
        selectUser(user: any) {
            if (!user) {
                return;
            }
            if (typeof user !== 'object') {
                return;
            }
            if (typeof user.password === 'string') {
                this.name = user.name;
                this.password = user.password;
            }
        }
    },
    apollo: {
        $client: 'ssoApolloClient',
        users: {
            query: gql`
                query {
                    users{
                        id
                        name
                        phone
                        userType
                        password
                    }
                }`,
            update({ users }) {
                return users.map((u: any) => ({ ...u, title: u.name, value: u.name }));
            }
        },
    }
}
</script>

<template>
    <div class="text-center pa-4">
        <v-btn v-if="store.isLogin" @click="logout">Logout</v-btn>
        <v-btn v-else @click="showDialog = true">Login</v-btn>
        <v-dialog v-model="showDialog" max-width="450" @after-leave="onLeave">
            <v-card :prepend-icon="mdiLogin" title="Login">
                <v-alert v-if="showAlert" text="Please try again" title="Login Failed" type="error"></v-alert>
                <v-alert v-else text="" type="info">
                    <small>
                        Five inbuilt users<br>
                        Same password(12345)<br>
                        Just Select one
                    </small>
                </v-alert>
                <v-card-text>
                    <v-row>
                        <v-col>
                            <v-combobox label="Name*" :items="users" v-model="name" @update:model-value="selectUser"
                                clearable></v-combobox>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="password" label="Password*" type="password" required
                                clearable></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text="Login" variant="tonal" @click="login"></v-btn>
                    <v-btn text="Close" variant="plain" @click="quit"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
