import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReservationDocument } from './reservation.schema';
import {
  Reservation,
  ReservationCreateInput,
  ReservationStatus,
} from './graphql';

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(ReservationDocument.name)
    private reservationModel: Model<ReservationDocument>,
    // eslint-disable-next-line prettier/prettier
  ) { }

  async findReservations(filter: any): Promise<Reservation[]> {
    return (await this.reservationModel.find(filter).exec()).map((doc) => {
      return {
        id: doc._id.toString(),
        guestName: doc.guestName,
        guestPhone: doc.guestPhone,
        arrivalTime: doc.arrivalTime,
        tableSize: doc.tableSize,
        status: doc.status as ReservationStatus,
      };
    });
  }

  async addReservation(input: ReservationCreateInput): Promise<Reservation> {
    const createdReservation = new this.reservationModel({
      status: 'Created',
      ...input,
    });
    return createdReservation.save().then((result) => {
      return {
        id: result._id.toString(),
        guestName: result.guestName,
        guestPhone: result.guestPhone,
        arrivalTime: result.arrivalTime,
        tableSize: result.tableSize,
        status: ReservationStatus.Created,
      };
    });
  }

  async updateReservation(input: Reservation): Promise<Reservation> {
    await this.reservationModel.updateOne(
      { _id: new Types.ObjectId(input.id) },
      {
        $set: {
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          arrivalTime: input.arrivalTime,
          tableSize: input.tableSize,
          status: input.status,
        },
      },
    );
    return input;
  }
}
