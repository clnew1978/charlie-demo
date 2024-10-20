import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthenticationModule } from './authentication/authentication.module';
import { ReservationModule } from './reservation/reservation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GraphQLError } from 'graphql';
import { MongooseModule } from '@nestjs/mongoose';

import { users } from './authentication/authentication.service';
import { DateScalar } from './date.scalar';

@Module({
  imports: [
    AuthenticationModule,
    ReservationModule,
    MongooseModule.forRoot(process.env.MongoDBAddress),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: process.env.BaseV0URL + '/sso/graphql',
      driver: ApolloDriver,
      typePaths: ['../graphql/authentication.graphql'],
      debug: false,
      playground: false,
      include: [AuthenticationModule],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: process.env.BaseV0URL + '/graphql',
      driver: ApolloDriver,
      typePaths: ['../graphql/reservation.graphql'],
      debug: false,
      playground: false,
      include: [ReservationModule],
      context: ({ req }) => {
        const user = users.find((u) => u.id === req.headers.authorization);
        if (!user) {
          throw new GraphQLError('User is not authenticated', {
            extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
          });
        }
        return { user };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [],
  providers: [DateScalar],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
