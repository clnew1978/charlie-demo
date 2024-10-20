import { Injectable } from '@nestjs/common';
import { AuthenticationInfo, User, UserType } from './graphql';
import { GraphQLError } from 'graphql';

export const users: User[] = [
  {
    id: 'E62A51C2-8B3B-4458-900D-B7FDED379AC4',
    name: 'Guest1',
    phone: '111-11111',
    userType: UserType.Guest,
    password: '12345',
  },
  {
    id: 'CFA2292E-DA77-4C0A-B16C-6DD181356778',
    name: 'Guest2',
    phone: '222-22222',
    userType: UserType.Guest,
    password: '12345',
  },
  {
    id: 'CECC7067-84C1-4F8A-8410-9BCCABD4CE6C',
    name: 'Guest3',
    phone: '333-33333',
    userType: UserType.Guest,
    password: '12345',
  },
  {
    id: 'EBE64507-5680-46F1-A901-E6C97E634ED9',
    name: 'Employee1',
    phone: '444-44444',
    userType: UserType.Employee,
    password: '12345',
  },
  {
    id: '62DF5E5C-9D55-493D-9FF0-491BFAB98D37',
    name: 'Employee2',
    userType: UserType.Employee,
    password: '12345',
  },
];

@Injectable()
export class AuthenticationService {
  async login(name: string, password: string): Promise<AuthenticationInfo> {
    const user = users.find((u) => u.name === name && u.password === password);
    if (!user) {
      throw new GraphQLError('invalid name or password.', {
        extensions: { code: 'Bad Request', http: { status: 400 } },
      });
    }
    return { token: user.id, name: user.name, userType: user.userType };
  }

  async users(): Promise<User[]> {
    return users;
  }
}
