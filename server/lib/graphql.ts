import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as reservationTypeDefs, resolvers as reservationReslovers } from './reservation';
import { resolvers as commonResolvers } from './common';

import logger from './logger';


export function getTypeDefs() {
    const typeDefsArray = [reservationTypeDefs];
    return mergeTypeDefs(typeDefsArray);
}

export function getResolvers() {
    return {
        ...reservationReslovers,
        ...commonResolvers,
    }
}
