import strawberry
import os
import typing
from enum import Enum


class Config:
    baseV0URL = os.environ.get("baseV0URL", "/api/v0")
    serverPort = int(os.environ.get("serverPort", 27321))
    serverAddress = os.environ.get("serverAddress", "0.0.0.0")
    mongoDBAddress = os.environ.get("mongoDBAddress", "mongodb://127.0.0.1:27017")
    dbName = os.environ.get("dbName", "charlie-demo")
    collectionName = os.environ.get("collectionName", "test-0000")


Date = strawberry.scalar(
    typing.NewType("Date", int),
    serialize=lambda v: v,
    parse_value=lambda v: v,
)


@strawberry.enum
class ReservationStatus(Enum):
    All = "All"
    Created = "Created"
    Completed = "Completed"
    Canceled = "Canceled"


@strawberry.type
class Reservation:
    id: str
    guestName: str
    guestPhone: str
    arrivalTime: Date
    tableSize: int
    status: ReservationStatus

    @staticmethod
    def fromDocument(document):
        return Reservation(
            id=str(document["_id"]),
            guestName=document["guestName"],
            guestPhone=document["guestPhone"],
            arrivalTime=document["arrivalTime"],
            tableSize=document["tableSize"],
            status=document["status"],
        )


@strawberry.input
class ReservationCreateInput:
    guestName: str
    guestPhone: str
    arrivalTime: Date
    tableSize: int

    def toInsertDocument(self):
        return {
            "guestName": self.guestName,
            "guestPhone": self.guestPhone,
            "arrivalTime": self.arrivalTime,
            "tableSize": self.tableSize,
            "status": ReservationStatus.Created.value,
        }


@strawberry.input
class ReservationUpdateInput:
    id: str
    guestName: str
    guestPhone: str
    arrivalTime: Date
    tableSize: int
    status: ReservationStatus

    def toUpdateFilters(self):
        query_filter = {"_id": self.id}
        update_operation = {
            "$set": {
                "guestName": self.guestName,
                "guestPhone": self.guestPhone,
                "arrivalTime": self.arrivalTime,
                "tableSize": self.tableSize,
                "status": self.status.value,
            }
        }
        return query_filter, update_operation

    def toReservation(self):
        return Reservation(
            id=self.id,
            guestName=self.guestName,
            guestPhone=self.guestPhone,
            arrivalTime=self.arrivalTime,
            tableSize=self.tableSize,
            status=self.status,
        )


@strawberry.enum
class UserType(Enum):
    Guest = "Guest"
    Employee = "Employee"


@strawberry.type
class User:
    id: str
    name: str
    phone: str | None
    userType: UserType
    password: str


@strawberry.type
class AuthenticationInfo:
    token: str
    name: str
    userType: UserType


users: typing.List[User] = [
    User(id="E62A51C2-8B3B-4458-900D-B7FDED379AC4", name="Guest1", phone="111-11111", userType=UserType.Guest, password="12345"),
    User(id="CFA2292E-DA77-4C0A-B16C-6DD181356778", name="Guest2", phone="222-22222", userType=UserType.Guest, password="12345"),
    User(id="CECC7067-84C1-4F8A-8410-9BCCABD4CE6C", name="Guest3", phone="333-33333", userType=UserType.Guest, password="12345"),
    User(id="EBE64507-5680-46F1-A901-E6C97E634ED9", name="Employee1", phone="444-44444", userType=UserType.Employee, password="12345"),
    User(id="62DF5E5C-9D55-493D-9FF0-491BFAB98D37", name="Employee2", phone="555-55555", userType=UserType.Employee, password="12345"),
]
