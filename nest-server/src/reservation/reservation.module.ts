import { Module } from '@nestjs/common';
import { ReservationResolver } from './reservation.resolvers';
import { ReservationService } from './reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationDocument, ReservationSchema } from './reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ReservationDocument.name,
        schema: ReservationSchema,
        collection: process.env.CollectionName,
      },
    ]),
  ],
  controllers: [],
  providers: [ReservationService, ReservationResolver],
})
// eslint-disable-next-line prettier/prettier
export class ReservationModule { }
