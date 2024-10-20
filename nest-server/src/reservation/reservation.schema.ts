import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Reservation, ReservationStatus } from './graphql';

@Schema()
export class ReservationDocument extends Document {
  @Prop()
  guestName: string;

  @Prop()
  guestPhone: string;

  @Prop()
  arrivalTime: number;

  @Prop()
  tableSize: number;

  @Prop()
  status: string;

  toReservation(): Reservation {
    return {
      id: this.id.toString(),
      guestName: this.guestName,
      guestPhone: this.guestPhone,
      arrivalTime: this.arrivalTime,
      tableSize: this.tableSize,
      status: this.status as ReservationStatus,
    };
  }
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);
