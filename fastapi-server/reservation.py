import strawberry
import typing
import dal
from fastapi import Depends, Request
from strawberry.fastapi import GraphQLRouter
from common import Date, ReservationStatus, Reservation, ReservationCreateInput, ReservationUpdateInput, User, users, UserType
from strawberry.exceptions import StrawberryException


@strawberry.type
class Query:
    @strawberry.field
    async def reservations(
        self,
        info: strawberry.Info,
        begin: Date | None = None,
        end: Date | None = None,
        status: ReservationStatus | None = None,
    ) -> typing.List[Reservation]:
        user: User | None = info.context["user"]
        if user is None:
            raise StrawberryException("UNAUTHENTICATED")
        selector = {}
        if user.userType == UserType.Guest:
            selector["guestName"] = selector.get("guestName", {})
            selector["guestName"].update({"$eq": user.name})
        if begin is not None:
            selector["arrivalTime"] = selector.get("arrivalTime", {})
            selector["arrivalTime"].update({"$gte": begin})
        if end is not None:
            selector["arrivalTime"] = selector.get("arrivalTime", {})
            selector["arrivalTime"].update({"$lte": end})
        if status is not None:
            selector["status"] = selector.get("status", {})
            selector["status"].update({"$eq": status})
        documents = dal.listReservations(selector)
        retval = []
        for document in documents:
            retval.append(Reservation.fromDocument(document))
        return retval


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def addReservation(self, info: strawberry.Info, input: ReservationCreateInput) -> Reservation:
        user: User | None = info.context["user"]
        if user.userType == UserType.Guest:
            if user.name != input.guestName:
                raise StrawberryException("Wrong Name")
        document = input.toInsertDocument()
        document["_id"] = dal.addReservation(document)
        return Reservation.fromDocument(document)

    @strawberry.mutation
    async def updateReservation(input: ReservationUpdateInput) -> Reservation:
        query_filter, update_operation = input.toUpdateFilters()
        dal.updateReservation(query_filter, update_operation)
        return input.toReservation()


reservationSchema = strawberry.Schema(query=Query, mutation=Mutation)


def user_dependency(request: Request) -> User | None:
    results = list(filter(lambda u: u.id == request.headers["authorization"], users))
    if len(results) <= 0:
        return None
    return results[0]


async def get_context(user=Depends(user_dependency)):
    return {"user": user}


reservationApp = GraphQLRouter(reservationSchema, context_getter=get_context)
