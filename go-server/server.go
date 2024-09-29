package main

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"go-server/authentication"
	"go-server/common"
	"go-server/reservation"
)

func main() {
	if err := reservation.DALInitialize(); err != nil {
		log.Printf("Error: call reservation.DALInitialize failed with error(%+v)", err)
	}
	defer reservation.DALDestroy()

	authenticationServer := handler.NewDefaultServer(
		authentication.NewExecutableSchema(authentication.Config{Resolvers: &authentication.Resolver{}}),
	)
	reservationServer := handler.NewDefaultServer(
		reservation.NewExecutableSchema(reservation.Config{Resolvers: &reservation.Resolver{}}),
	)
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(common.Middleware())

	router.Handle(common.Config.BaseV0URL+"/sso/graphql", authenticationServer)
	router.Handle(common.Config.BaseV0URL+"/graphql", reservationServer)
	fs := http.FileServer(http.Dir("./client"))
	router.Handle("/*", fs)

	log.Printf("connect to http://localhost:%s/ for Charlie Demo", common.Config.ServerPort)
	log.Fatal(http.ListenAndServe(":"+common.Config.ServerPort, router))
}
