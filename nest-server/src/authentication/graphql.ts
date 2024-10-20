/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum UserType {
    Guest = "Guest",
    Employee = "Employee"
}

export class User {
    id: string;
    name: string;
    phone?: Nullable<string>;
    userType: UserType;
    password: string;
}

export class AuthenticationInfo {
    token: string;
    name: string;
    userType: string;
}

export interface IQuery {
    users(): Nullable<User>[] | Promise<Nullable<User>[]>;
}

export interface IMutation {
    login(name: string, password: string): AuthenticationInfo | Promise<AuthenticationInfo>;
}

type Nullable<T> = T | null;
