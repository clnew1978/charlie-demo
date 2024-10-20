/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ReservationStatus {
    All = "All",
    Created = "Created",
    Completed = "Completed",
    Canceled = "Canceled"
}

export class ReservationCreateInput {
    guestName: string;
    guestPhone: string;
    arrivalTime: number;
    tableSize: number;
}

export class ReservationUpdateInput {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: number;
    tableSize: number;
    status: ReservationStatus;
}

export class Reservation {
    id: string;
    guestName: string;
    guestPhone: string;
    arrivalTime: number;
    tableSize: number;
    status: ReservationStatus;
}

export abstract class IQuery {
    abstract reservations(begin?: Nullable<number>, end?: Nullable<number>, status?: Nullable<ReservationStatus>): Nullable<Reservation>[] | Promise<Nullable<Reservation>[]>;
}

export abstract class IMutation {
    abstract addReservation(input: ReservationCreateInput): Nullable<Reservation> | Promise<Nullable<Reservation>>;

    abstract updateReservation(input: ReservationUpdateInput): Nullable<Reservation> | Promise<Nullable<Reservation>>;
}

type Nullable<T> = T | null;
