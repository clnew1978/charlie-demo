import { defineStore } from 'pinia'


export enum UserType {
    Guest = 'Guest',
    Employee = 'Employee',
}

export interface User {
    id: string;
    name: string;
    phone?: string;
    userType: UserType;
    password: string;
}

export interface AuthenticationInfo {
    token: string;
    name: string;
    userType: string;
}

export const useAuthenticationStore = defineStore(
    'authentication',
    {
        state: (): AuthenticationInfo => ({ token: '', name: '', userType: '' }),
        getters: {
            isLogin: (state) => state.token !== '',
            isEmployee: (state) => state.userType === UserType.Employee,
        },
        actions: {
            login(info: AuthenticationInfo) {
                this.token = info.token;
                this.name = info.name;
                this.userType = info.userType;
            },
            logout() {
                this.token = '';
                this.name = '';
                this.userType = '';
            },
        }
    }
);
