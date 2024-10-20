import { ReservationService } from './reservation.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Reservation,
  ReservationStatus,
  ReservationCreateInput,
  ReservationUpdateInput,
} from './graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User as AuthUser, UserType } from 'src/authentication/graphql';

const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  return GqlExecutionContext.create(ctx).getContext().user;
});

@Resolver('Reservation')
export class ReservationResolver {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly reservationService: ReservationService) { }


  @Query('reservations')
  async reservations(
    @User() user: AuthUser,
    @Args('begin') begin?: number | null,
    @Args('end') end?: number | null,
    @Args('status') status?: ReservationStatus | null,
  ): Promise<Reservation[]> {
    const filter = {};
    if (user.userType === UserType.Guest) {
      filter['guestName'] = { $eq: user.name };
    }
    if (begin) {
      filter['arrivalTime'] = { $gte: begin };
    }
    if (end) {
      filter['arrivalTime'] = { $lte: end };
    }
    if (status) {
      filter['status'] = { $eq: status };
    } else {
      filter['status'] = { $ne: 'Canceled' };
    }
    return this.reservationService.findReservations(filter);
  }

  @Mutation('addReservation')
  async addReservation(
    @Args('input')
    input: ReservationCreateInput,
  ): Promise<Reservation | null> {
    return this.reservationService.addReservation(input);
  }

  @Mutation('updateReservation')
  async updateReservation(
    @Args('input')
    input: ReservationUpdateInput,
  ): Promise<Reservation | null> {
    return this.reservationService.updateReservation({ ...input });
  }
}
