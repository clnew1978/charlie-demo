package reservation

import (
	"context"
	"fmt"
	"go-server/common"
	"go-server/reservation/resemodel"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client = nil
var collection *mongo.Collection = nil

func DALInitialize() error {
	DALDestroy()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	opts := options.Client().ApplyURI(common.Config.MongoDBAddress)
	_client, err := mongo.Connect(ctx, opts)
	if err != nil {
		log.Printf("Error: database initialize failed with error(%+v)\n", err)
		return fmt.Errorf("database initialize failed with error(%+v)", err)
	}
	client = _client
	collection = client.Database(common.Config.DBName).Collection(common.Config.CollectionName)
	return nil
}

func DALDestroy() {
	if collection != nil {
		collection = nil
	}
	if client == nil {
		return
	}
	client.Disconnect(context.Background())
	client = nil
}

func ListReservations(filter interface{}) ([]*resemodel.Reservation, error) {
	if collection == nil {
		log.Println("Error: database not initailized correctly")
		return nil, fmt.Errorf("database not initailized correctly")
	}
	cur, err := collection.Find(context.Background(), filter)
	if err != nil {
		log.Printf("Error: call collection.Find failed with error(%+v)", err)
		return nil, fmt.Errorf("call collection.Find failed with error(%+v)", err)
	}
	defer cur.Close(context.Background())
	retval := []*resemodel.Reservation{}
	for cur.Next(context.Background()) {
		result := struct {
			ID          primitive.ObjectID `bson:"_id"`
			GuestName   string
			GuestPhone  string
			ArrivalTime int
			TableSize   int
			Status      string
		}{}
		if err := cur.Decode(&result); err != nil {
			return nil, err
		}
		retval = append(retval, &resemodel.Reservation{
			ID:          result.ID.Hex(),
			GuestName:   result.GuestName,
			GuestPhone:  result.GuestPhone,
			ArrivalTime: common.Date(result.ArrivalTime),
			TableSize:   result.TableSize,
			Status:      resemodel.ReservationStatus(result.Status),
		})
	}
	return retval, nil
}
