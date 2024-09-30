package reservation

import (
	"context"
	"fmt"
	"go-server/common"
	"go-server/reservation/resemodel"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
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

func listReservations(ctx context.Context, filter interface{}) ([]*resemodel.Reservation, error) {
	if collection == nil {
		log.Println("Error: database not initailized correctly")
		return nil, fmt.Errorf("database not initailized correctly")
	}
	cur, err := collection.Find(ctx, filter)
	if err != nil {
		log.Printf("Error: call collection.Find failed with error(%+v)", err)
		return nil, fmt.Errorf("call collection.Find failed with error(%+v)", err)
	}
	defer cur.Close(ctx)
	retval := []*resemodel.Reservation{}
	for cur.Next(ctx) {
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

func addReservations(
	ctx context.Context,
	guestName string,
	guestPhone string,
	arrivalTime common.Date,
	tableSize int,
) (*resemodel.Reservation, error) {
	if collection == nil {
		log.Println("Error: database not initailized correctly")
		return nil, fmt.Errorf("database not initailized correctly")
	}
	var doc struct {
		GuestName   string `bson:"guestName"`
		GuestPhone  string `bson:"guestPhone"`
		ArrivalTime int    `bson:"arrivalTime"`
		TableSize   int    `bson:"tableSize"`
		Status      string `bson:"status"`
	}
	doc.GuestName = guestName
	doc.GuestPhone = guestPhone
	doc.ArrivalTime = int(arrivalTime)
	doc.TableSize = tableSize
	doc.Status = resemodel.ReservationStatusCreated.String()
	if result, err := collection.InsertOne(ctx, doc); err != nil {
		log.Printf("Error: call collection.InsertOne failed with error(%+v)\n", err)
		return nil, err
	} else {
		if id, ok := result.InsertedID.(primitive.ObjectID); !ok {
			log.Printf("Error: wrong type for InsertedID.\n")
			return nil, fmt.Errorf("insert failed")
		} else {
			retval := &resemodel.Reservation{
				ID:          id.Hex(),
				GuestName:   guestName,
				GuestPhone:  guestPhone,
				ArrivalTime: arrivalTime,
				TableSize:   tableSize,
				Status:      resemodel.ReservationStatusCreated,
			}
			return retval, nil
		}
	}
}

func updateReservations(
	ctx context.Context,
	id string,
	guestName string,
	guestPhone string,
	arrivalTime common.Date,
	tableSize int,
	status resemodel.ReservationStatus,
) (*resemodel.Reservation, error) {
	if collection == nil {
		log.Println("Error: database not initailized correctly")
		return nil, fmt.Errorf("database not initailized correctly")
	}
	objectID, fromError := primitive.ObjectIDFromHex(id)
	if fromError != nil {
		log.Println("Error: wrong format for id")
		return nil, fromError
	}
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{
		"guestName":   guestName,
		"guestPhone":  guestPhone,
		"arrivalTime": int(arrivalTime),
		"tableSize":   tableSize,
		"status":      status.String(),
	}}
	if _, err := collection.UpdateOne(ctx, filter, update); err != nil {
		log.Printf("Error: call collection.UpdateOne error(%+v)\n", err)
		return nil, err
	} else {
		return &resemodel.Reservation{
			ID:          id,
			GuestName:   guestName,
			GuestPhone:  guestName,
			ArrivalTime: arrivalTime,
			TableSize:   tableSize,
			Status:      status,
		}, nil
	}
}
