import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse
from reservation import reservationApp
from authentication import authenticationApp
from common import Config
from contextlib import asynccontextmanager
import dal


@asynccontextmanager
async def appLifespan(app: FastAPI):
    dal.init()
    yield
    dal.destroy()


app = FastAPI(lifespan=appLifespan)


@app.get("/")
async def index():
    return FileResponse(media_type="text/html", path=Path(__file__).parent.joinpath("client", "index.html"))


app.include_router(reservationApp, prefix=Config.baseV0URL + "/graphql")
app.include_router(authenticationApp, prefix=Config.baseV0URL + "/sso/graphql")


app.mount("/", StaticFiles(directory=Path(__file__).parent.joinpath("client")), name="client")
