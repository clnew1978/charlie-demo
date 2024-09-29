package common

import (
	"os"
)

var Config struct {
	BaseV0URL      string
	ServerPort     string
	MongoDBAddress string
	DBName         string
	CollectionName string
}

func init() {
	Config.BaseV0URL = os.Getenv("BaseV0URL")
	if Config.BaseV0URL == "" {
		Config.BaseV0URL = "/api/v0"
	}
	Config.ServerPort = os.Getenv("ServerPort")
	if Config.ServerPort == "" {
		Config.ServerPort = "27323"
	}
	Config.MongoDBAddress = os.Getenv("MongoDBAddress")
	if Config.MongoDBAddress == "" {
		Config.MongoDBAddress = "mongodb://127.0.0.1:27017"
	}
	Config.DBName = os.Getenv("DBName")
	if Config.DBName == "" {
		Config.DBName = "charlie-demo"
	}
	Config.CollectionName = os.Getenv("CollectionName")
	if Config.CollectionName == "" {
		Config.CollectionName = "test-0000"
	}
}
