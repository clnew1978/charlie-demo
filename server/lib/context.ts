import { Request } from 'express';
import { config } from '../environment';
import { users, UserType, DemoContext } from './common';


export function getAuthorization(id: string): string {
    const user = users.find(u => u.id === id);
    if (!user) {
        return '';
    }
    if (user.userType == UserType.Employee) {
        return config.apiEmployeeAuthorization + '+' + id;
    } else {
        return config.apiGuestAuthorization + '+' + id;
    }
}

export async function getDemoContext(req: Request): Promise<DemoContext | null> {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return null;
    }
    const items = authorization.split('+');
    if (items.length !== 2) {
        return null;
    }
    const userType = (items[0] === config.apiEmployeeAuthorization) ? UserType.Employee : UserType.Guest;
    const user = users.find(u => (u.id === items[1]) && (u.userType === userType));
    if (!user) {
        return null;
    }
    return { user };
}
