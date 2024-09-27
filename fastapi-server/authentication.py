import strawberry
import typing
from strawberry.exceptions import StrawberryException
from strawberry.fastapi import GraphQLRouter
from common import User, AuthenticationInfo, users


@strawberry.type
class Query:
    @strawberry.field
    async def users() -> typing.List[User]:
        return users


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def login(name: str, password: str) -> AuthenticationInfo:
        results = list(filter(lambda u: (u.name == name) and (u.password == password), users))
        if len(results) <= 0:
            raise StrawberryException("database error")
        return AuthenticationInfo(token=results[0].id, name=results[0].name, userType=results[0].userType)


authenticationSchema = strawberry.Schema(query=Query, mutation=Mutation)
authenticationApp = GraphQLRouter(authenticationSchema)
