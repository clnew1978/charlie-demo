package common

import (
	"encoding/json"
	"io"
	"strconv"
)

type Date int

func (d *Date) UnmarshalGQL(v interface{}) error {
	result, err := v.(json.Number).Int64()
	if err != nil {
		return err
	}
	*d = Date(result)
	return nil
}

// MarshalGQL implements the graphql.Marshaler interface
func (d Date) MarshalGQL(w io.Writer) {
	w.Write([]byte(strconv.Itoa(int(d))))
}
