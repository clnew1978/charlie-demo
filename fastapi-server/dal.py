import pymongo
import pymongo.collection
import pymongo.database
from common import Config
from strawberry.exceptions import StrawberryException

demoClient: pymongo.MongoClient | None = None
demoDatabase: pymongo.database.Database | None = None
demoCollection: pymongo.collection.Collection | None = None


def init():
    global demoClient
    global demoDatabase
    global demoCollection
    destroy()
    try:
        _demoClient = pymongo.MongoClient(Config.mongoDBAddress)
        demoClient = _demoClient
    except Exception as e:
        print("mongodb initialize failed with error: ", e)
        return

    try:
        demoDatabase = demoClient[Config.dbName]
        if Config.collectionName not in demoDatabase.list_collection_names():
            demoCollection = demoDatabase.create_collection(Config.collectionName)
        else:
            demoCollection = demoDatabase[Config.collectionName]
    except:
        print("mongodb initialize failed with error: ", e)
        return


def destroy():
    global demoClient
    global demoDatabase
    global demoCollection
    if demoCollection is not None:
        demoCollection = None
    if demoDatabase is not None:
        demoDatabase = None
    if demoClient is not None:
        demoClient.close()
        demoClient = None


def listReservations(selector):
    if demoCollection is None:
        raise StrawberryException("database error")
    results = demoCollection.find(selector)
    return results.to_list()


def addReservation(document) -> str:
    if demoCollection is None:
        raise StrawberryException("database error")
    result = demoCollection.insert_one(document)
    return result.inserted_id


def updateReservation(query_filter, update_operation):
    if demoCollection is None:
        raise StrawberryException("database error")
    demoCollection.update_one(query_filter, update_operation)
