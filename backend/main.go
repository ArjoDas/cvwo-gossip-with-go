package main

import (
	"github.com/arjodas/cvwo-gossip-with-go/backend/controllers"
	"github.com/arjodas/cvwo-gossip-with-go/backend/initializers"
	"github.com/arjodas/cvwo-gossip-with-go/backend/middleware"
	"github.com/arjodas/cvwo-gossip-with-go/backend/models"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// init() always runs before main() 
func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
}

func main() {
	r := gin.Default()    // the web server
	r.Use(cors.Default()) // enables x origin communication

	// checks and synchronizes Go structs to loaded DB. structs are the source of truth
	initializers.DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Comment{},
		&models.Topic{},
		&models.Vote{},
	)

	// --- SEEDING ---
	// create default topics if they don't exist
	topics := []models.Topic{
		{Title: "General", Slug: "general", Description: "General Discussion"},
		{Title: "Technology", Slug: "tech", Description: "Tech News & Programming"},
		{Title: "Career", Slug: "career", Description: "Career Advice"},
		{Title: "Personal Finance", Slug: "personal_finance", Description: "Personal Finance"},
		{Title: "Random", Slug: "random", Description: "Off-topic chatter"},
	}

	for _, t := range topics {
		if initializers.DB.First(&models.Topic{}, "slug = ?", t.Slug).RowsAffected == 0 {
			initializers.DB.Create(&t)
		}
	}

	// ===========================
	//    USER & AUTH ROUTES
	// ===========================
	r.POST("/signup", controllers.Signup)
	r.POST("/login", controllers.Login)
	r.GET("/validate", middleware.RequireAuth, controllers.Validate) // check if cookie/token is valid

	// ===========================
	//       TOPIC ROUTES
	// ===========================
	// Public
	r.GET("/topics", controllers.GetTopics)      // view all topics
	r.GET("/topics/:id", controllers.GetTopic)   // view single topic details

	// Protected (Users can contribute to the Wiki)
	r.POST("/topics", middleware.RequireAuth, controllers.CreateTopic)
	r.PUT("/topics/:id", middleware.RequireAuth, controllers.UpdateTopic)
	r.DELETE("/topics/:id", middleware.RequireAuth, controllers.DeleteTopic)

	// ===========================
	//       POST ROUTES
	// ===========================
	// Public
	r.GET("/posts", controllers.GetPosts)    // view feed
	r.GET("/posts/:id", controllers.GetPost) // view single post

	// Protected
	r.POST("/posts", middleware.RequireAuth, controllers.CreatePost)       // only users can post
	r.PUT("/posts/:id", middleware.RequireAuth, controllers.UpdatePost)    // update own post
	r.DELETE("/posts/:id", middleware.RequireAuth, controllers.DeletePost) // delete own post

	// ===========================
	//      COMMENT ROUTES
	// ===========================
	// Public
	r.GET("/posts/:id/comments", controllers.GetComments) // read discussion

	// Protected
	r.POST("/posts/:id/comments", middleware.RequireAuth, controllers.CreateComment) // add to discussion
	r.PUT("/comments/:id", middleware.RequireAuth, controllers.UpdateComment)        // fix typo in comment
	r.DELETE("/comments/:id", middleware.RequireAuth, controllers.DeleteComment)     // delete regretful comment

	r.Run() // start server listening on port 8080
}