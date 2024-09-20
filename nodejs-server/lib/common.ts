import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';


export enum UserType {
    Guest = 'Guest',
    Employee = 'Employee',
}

export enum ReservationStatus {
    Created = 'Created',
    Completed = 'Completed',
    Canceled = 'Canceled',
}

export interface User {
    id: string;
    name: string;
    phone?: string;
    userType: UserType;
    password: string;
}

export interface DemoContext {
    user: User;
}

export interface Reservation {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
    status: ReservationStatus;
}

export interface ReservationCreateInput {
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
}

export interface ReservationUpdateInput {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: Date;
    tableSize: number;
    status: ReservationStatus;
}


const resolvers = {
    Date: new GraphQLScalarType<Date | null, number | null>({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(val) {
            if (typeof val === 'number') {
                return new Date(val);
            }
            return null;
        },
        serialize(val) {
            if (val instanceof Date) {
                return val.getTime();
            }
            return val as number;
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return new Date(parseInt(ast.value, 10));
            }
            return null;
        },
    })
};

// TODO use manager is not the region of this demon, so hard coded it
const users: User[] = [
    { id: 'E62A51C2-8B3B-4458-900D-B7FDED379AC4', name: 'Guest1', phone: '111-11111', userType: UserType.Guest, password: '12345' },
    { id: 'CFA2292E-DA77-4C0A-B16C-6DD181356778', name: 'Guest2', phone: '222-22222', userType: UserType.Guest, password: '12345' },
    { id: 'CECC7067-84C1-4F8A-8410-9BCCABD4CE6C', name: 'Guest3', phone: '333-33333', userType: UserType.Guest, password: '12345' },
    { id: 'EBE64507-5680-46F1-A901-E6C97E634ED9', name: 'Employee1', phone: '444-44444', userType: UserType.Employee, password: '12345' },
    { id: '62DF5E5C-9D55-493D-9FF0-491BFAB98D37', name: 'Employee2', userType: UserType.Employee, password: '12345' },
];

export { resolvers, users };

