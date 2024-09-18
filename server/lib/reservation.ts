import { buildSchema, GraphQLError } from 'graphql';
import * as lodash from 'lodash';

import logger from './logger';
import { DemoContext, ReservationCreateInput, ReservationStatus, ReservationUpdateInput, User, UserType } from './common';
import { addReservation, listReservations, updateReservation } from './dal';


const typeDefs = buildSchema(`
    scalar Date
    enum ReservationStatus {
        Created
        Completed
        Canceled
    }
    input ReservationCreateInput {
        guestName: String!
        guestPhone: String!
        arrivalTime: Date!
        tableSize: Int!
    }
    input ReservationUpdateInput {
        id: String!
        guestName: String!
        guestPhone: String!
        arrivalTime: Date!
        tableSize: Int!
        status: ReservationStatus!
    }
    type Reservation {
        id: String!
        guestName: String!
        guestPhone: String!
        arrivalTime: Date!
        tableSize: Int!
        status: ReservationStatus!
    }
    type Query {
        reservations(begin: Date, end: Date): [Reservation]!
    }
    type Mutation {
        addReservation(input: ReservationCreateInput!): Reservation
        updateReservation(input: ReservationUpdateInput): Reservation
    }
`);
const resolvers = {
    Query: {
        reservations: async (_root: any, args: any, context: DemoContext) => {
            if (!context.user) {
                logger.error('addReservation: user not found in context.')
                throw new GraphQLError(
                    'user not found in context.',
                    { extensions: { code: 'Bad Request', http: { status: 400 } } }
                );
            }
            const selector: any = {};
            const user = context.user as User;
            if (user.userType === UserType.Guest) {
                lodash.set(selector, 'guestName.$eq', user.name);
            }
            if (args.begin) {
                lodash.set(selector, 'arrivalTime.$gt', (args.begin as Date).getTime());
            }
            if (args.end) {
                lodash.set(selector, 'arrivalTime.$lt', (args.end as Date).getTime());
            }
            lodash.set(selector, 'status.$in', [ReservationStatus.Created, ReservationStatus.Completed]);
            logger.debug('reservations: selector(%j)', selector);
            const retval = await listReservations(selector);
            logger.debug('reservations: done with result(%j)', retval);
            return retval;
        },
    },
    Mutation: {
        addReservation: async (_root: any, args: any, context: DemoContext) => {
            if (!context.user) {
                logger.error('addReservation: user not found in context.')
                throw new GraphQLError(
                    'user not found in context.',
                    { extensions: { code: 'Bad Request', http: { status: 400 } } }
                );
            }
            const input: ReservationCreateInput = args.input as ReservationCreateInput;
            const user = context.user as User;
            if ((user.userType === UserType.Guest) && (user.name != input.guestName)) {
                logger.error('addReservation: user name is not same with the guest name.')
                throw new GraphQLError(
                    'Wrong guest name',
                    { extensions: { code: 'Bad Request', http: { status: 400 } } }
                );
            }
            logger.debug('addReservation: create input(%j)', input);
            const retval = await addReservation(input);
            logger.debug('addReservation: done with result(%j)', retval);
            return retval;
        },
        updateReservation: async (root: any, args: any, context: DemoContext) => {
            if (!context.user) {
                logger.error('updateReservation: user not found in context.')
                throw new GraphQLError(
                    'user not found in context.',
                    { extensions: { code: 'Bad Request', http: { status: 400 } } }
                );
            }
            const input: ReservationUpdateInput = args.input as ReservationUpdateInput;
            const user = context.user as User;
            if ((user.userType === UserType.Guest) && (user.name != input.guestName)) {
                logger.error('updateReservation: user name is not same with the guest name.')
                throw new GraphQLError(
                    'Wrong guest name',
                    { extensions: { code: 'Bad Request', http: { status: 400 } } }
                );
            }
            logger.debug('updateReservation: create input(%j)', input);
            const retval = await updateReservation(input, user.userType);
            logger.debug('updateReservation: done with result(%j)', retval);
            return retval;
        },
    }
};

export { typeDefs, resolvers }
