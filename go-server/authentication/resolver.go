package authentication

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.
import (
	"context"
	"errors"
	"slices"

	"go-server/authentication/authmodel"
	"go-server/common"
)

type Resolver struct{}

func (r *Resolver) Login(ctx context.Context, name string, password string) (*authmodel.AuthenticationInfo, error) {
	index := slices.IndexFunc(common.Users, func(user *authmodel.User) bool {
		return (user.Name == name) && (user.Password == password)
	})
	if index < 0 {
		return nil, errors.New("Unauthenticated")
	} else {
		return &authmodel.AuthenticationInfo{
			Token:    common.Users[index].ID,
			Name:     common.Users[index].Name,
			UserType: common.Users[index].UserType.String(),
		}, nil
	}
}

func (r *Resolver) Users(ctx context.Context) ([]*authmodel.User, error) {
	return common.Users, nil
}
