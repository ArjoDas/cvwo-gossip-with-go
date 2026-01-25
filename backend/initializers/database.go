package initializers

import (
    "log"   // for printing errs to console
    "os"    // read env variables
    "gorm.io/driver/postgres"   // imports postgres driver for gorm
    "gorm.io/gorm"  // the ORM
)

var DB *gorm.DB // global singleton database pointer

func ConnectToDB() {
    var err error
    dsn := os.Getenv("DB_URL")
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database")
        // immediately kill program 
    }
    DB.Exec("CREATE EXTENSION IF NOT EXISTS vector")
    // manually enable pgvector extension
}