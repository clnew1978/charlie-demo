import { buildSchema, GraphQLError } from 'graphql';

import logger from './logger';
import { User, users as mockUsers } from './common';


const typeDefs = buildSchema(`
    enum UserType {
        Guest
        Employee
    }
    type User {
        id: String!
        name: String!
        phone: String
        userType: UserType!
        password: String!
    }
    type AuthenticationInfo {
        token: String!
        name: String!
        userType: String!
    }
    type Query {
        users: [User]!
    }
    type Mutation {
        login(name: String!, password: String!): AuthenticationInfo!
    }
`);

const resolvers = {
    Query: {
        users: async () => {
            return mockUsers;
        },
    },
    Mutation: {
        // simple login with hard coded token
        login: async (_root: any, args: any) => {
            if ((!args.name) || (!args.password)) {
                logger.error('login: invalid name or password.')
                throw new GraphQLError('invalid name or password.', { extensions: { code: 'Bad Request', http: { status: 400 } } });
            }
            const user = mockUsers.find((u) => (u.name === args.name) && (u.password === args.password));
            if (!user) {
                logger.error('login: user is not authenticated.')
                throw new GraphQLError('user is not authenticated', { extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } } });
            }
            return { token: user.id, name: user.name, userType: user.userType };
        },
    }
};

export function findUser(userID: string | undefined): User | null {
    if (!userID) {
        return null;
    }
    const user = mockUsers.find(u => u.id === userID);
    if (!user) {
        return null;
    }
    return user;

}


export { typeDefs, resolvers }
