package common

import (
	"context"
	"net/http"
	"slices"

	"go-server/authentication/authmodel"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct {
	name string
}

var phones []string = []string{"111-11111", "222-22222", "333-33333", "444-44444", "555-55555"}

var Users []*authmodel.User = []*authmodel.User{
	{
		ID:       "E62A51C2-8B3B-4458-900D-B7FDED379AC4",
		Name:     "Guest1",
		Phone:    &phones[0],
		UserType: authmodel.UserTypeGuest,
		Password: "12345",
	},
	{
		ID:       "CFA2292E-DA77-4C0A-B16C-6DD181356778",
		Name:     "Guest2",
		Phone:    &phones[1],
		UserType: authmodel.UserTypeGuest,
		Password: "12345",
	},
	{
		ID:       "CECC7067-84C1-4F8A-8410-9BCCABD4CE6C",
		Name:     "Guest3",
		Phone:    &phones[2],
		UserType: authmodel.UserTypeGuest,
		Password: "12345",
	},
	{
		ID:       "EBE64507-5680-46F1-A901-E6C97E634ED9",
		Name:     "Employee1",
		Phone:    &phones[3],
		UserType: authmodel.UserTypeEmployee,
		Password: "12345",
	},
	{
		ID:       "62DF5E5C-9D55-493D-9FF0-491BFAB98D37",
		Name:     "Employee2",
		Phone:    &phones[4],
		UserType: authmodel.UserTypeEmployee,
		Password: "12345",
	},
}

func Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("authorization")
			index := slices.IndexFunc(Users, func(user *authmodel.User) bool {
				return user.ID == authorization
			})
			if index >= 0 {
				ctx := context.WithValue(r.Context(), userCtxKey, Users[index])
				r = r.WithContext(ctx)
			}
			next.ServeHTTP(w, r)
		})
	}
}

func ForContext(ctx context.Context) *authmodel.User {
	if raw, ok := ctx.Value(userCtxKey).(*authmodel.User); ok {
		return raw
	}
	return nil
}
