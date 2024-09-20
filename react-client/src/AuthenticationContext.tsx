import { createContext } from 'react';


export interface AuthenticationInfo {
    token: string;
    name: string;
    userType: string;
}

export const AuthenticationContext = createContext<AuthenticationInfo>({ token: '', name: '', userType: '' });