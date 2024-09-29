package reservation

import (
	"context"
	"fmt"
	"log"

	"go-server/authentication/authmodel"
	"go-server/common"
	"go-server/reservation/resemodel"

	"go.mongodb.org/mongo-driver/bson"
)

type Resolver struct{}

func (r *Resolver) AddReservation(ctx context.Context, input resemodel.ReservationCreateInput) (*resemodel.Reservation, error) {
	panic("error")
}

func (r *Resolver) UpdateReservation(ctx context.Context, input resemodel.ReservationUpdateInput) (*resemodel.Reservation, error) {
	panic("error")
}

func (r *Resolver) Reservations(ctx context.Context, begin *common.Date, end *common.Date, status *resemodel.ReservationStatus) ([]*resemodel.Reservation, error) {
	user := common.ForContext(ctx)
	if user == nil {
		log.Printf("Error: UNAUTHENTICATED")
		return nil, fmt.Errorf("UNAUTHENTICATED")
	}
	filters := []bson.M{}
	if begin != nil {
		filters = append(filters, bson.M{"arrivalTime": bson.M{"$gte": int(*begin)}})
	}
	if end != nil {
		filters = append(filters, bson.M{"arrivalTime": bson.M{"$lte": int(*end)}})
	}
	if status != nil {
		filters = append(filters, bson.M{"status": bson.M{"$eq": status.String()}})
	}
	if user.UserType == authmodel.UserTypeGuest {
		filters = append(filters, bson.M{"guestName": bson.M{"$eq": user.Name}})
	}
	if len(filters) > 0 {
		return ListReservations(bson.M{"$and": filters})
	} else {
		return ListReservations(bson.D{})
	}
}
