import { BehaviorSubject } from "rxjs";

const authenticationKey = 'demo-authentication-info';

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

const authenticationChanged$ = new BehaviorSubject<AuthenticationInfo>({ token: '', name: '', userType: '' });
export { authenticationChanged$ };

export function getAuthenticationInfo(): AuthenticationInfo {
  const authItem = sessionStorage.getItem(authenticationKey);
  if (!authItem) {
    return { token: '', name: '', userType: '' };
  }
  return JSON.parse(authItem) as AuthenticationInfo;
}

export function cleanAuthenticationInfo(): void {
  sessionStorage.removeItem(authenticationKey);
  authenticationChanged$.next({ token: '', name: '', userType: '' });
}

export function setAuthenticationInfo(info: AuthenticationInfo): void {
  sessionStorage.setItem(authenticationKey, JSON.stringify(info));
  authenticationChanged$.next(info);
}
