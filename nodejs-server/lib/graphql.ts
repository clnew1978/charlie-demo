import { mergeTypeDefs } from '@graphql-tools/merge';

import { typeDefs as reservationTypeDefs, resolvers as reservationResolvers } from './reservation';
import { resolvers as commonResolvers } from './common';


export function getTypeDefs() {
    const typeDefsArray = [reservationTypeDefs];
    return mergeTypeDefs(typeDefsArray);
}

export function getResolvers() {
    return {
        ...reservationResolvers,
        ...commonResolvers,
    }
}
