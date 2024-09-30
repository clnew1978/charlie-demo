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
	user := common.ForContext(ctx)
	if user == nil {
		log.Printf("Error: cannot get user from context.")
		return nil, fmt.Errorf("UNAUTHENTICATED")
	}
	if user.UserType == authmodel.UserTypeGuest {
		if user.Name != input.GuestName {
			log.Printf("Error: wrong guest name.")
			return nil, fmt.Errorf("WRONG NAME")
		}
	}
	return addReservations(ctx, input.GuestName, input.GuestPhone, input.ArrivalTime, input.TableSize)
}

func (r *Resolver) UpdateReservation(ctx context.Context, input resemodel.ReservationUpdateInput) (*resemodel.Reservation, error) {
	user := common.ForContext(ctx)
	if user == nil {
		log.Printf("Error: cannot get user from context.")
		return nil, fmt.Errorf("UNAUTHENTICATED")
	}
	return updateReservations(ctx, input.ID, input.GuestName, input.GuestPhone, input.ArrivalTime, input.TableSize, input.Status)
}

func (r *Resolver) Reservations(ctx context.Context, begin *common.Date, end *common.Date, status *resemodel.ReservationStatus) ([]*resemodel.Reservation, error) {
	user := common.ForContext(ctx)
	if user == nil {
		log.Printf("Error: cannot get user from context.")
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
		return listReservations(ctx, bson.M{"$and": filters})
	} else {
		return listReservations(ctx, bson.D{})
	}
}
