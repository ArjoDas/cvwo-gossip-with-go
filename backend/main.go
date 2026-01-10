package main

import (
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/arjodas/cvwo-gossip-with-go/backend/initializers"
)

func init() {
    initializers.LoadEnvVariables()
    initializers.ConnectToDB()
}

func main() {
    r := gin.Default()
    r.Use(cors.Default())

    r.GET("/ping", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "pong",
        })
    })

    r.Run()
}