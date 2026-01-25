package controllers

import (
	"context"
	"os"
	"net/http"

	"github.com/arjodas/cvwo-gossip-with-go/backend/initializers"
	"github.com/arjodas/cvwo-gossip-with-go/backend/models"
	"github.com/gin-gonic/gin"
	"github.com/pgvector/pgvector-go"
	"github.com/sashabaranov/go-openai"
)

// helper: calls OpenAI to turn text into a 1536-dimensional vector
func getEmbedding(text string) (pgvector.Vector, error) {
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	resp, err := client.CreateEmbeddings(
		context.Background(),
		openai.EmbeddingRequest{
			Input: []string{text},
			Model: openai.AdaEmbeddingV2,
		},
	)
	if err != nil {
		return pgvector.NewVector(nil), err
	}
	return pgvector.NewVector(resp.Data[0].Embedding), nil
}

func CreatePost(c *gin.Context) {
	// get title and body
	var body struct {
		Title string
		Body  string
		TopicID uint
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	// get logged in user (set by middleware)
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	// generate embedding (concatenate title + body)
	embedding, err := getEmbedding(body.Title + "\n" + body.Body)
	if err != nil {
		// if OpenAI fails, we log it but still allow the post (just without search powers)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI Engine Error: " + err.Error()})
		return
	}

	// ensure fallback TopicID to 1
	finalTopicID := body.TopicID
	if finalTopicID == 0 {
		finalTopicID = 1
	}

	// create post
	post := models.Post{
		Title:   body.Title,
		Body:    body.Body,
		UserID:  currentUser.ID,
		TopicID: finalTopicID,
		Embedding: embedding,
	}

	result := initializers.DB.Create(&post)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
}

func GetPosts(c *gin.Context) {
	var posts []models.Post
	
	// check URL for ?search=something
	searchQuery := c.Query("search")

	if searchQuery != "" {
		// --- SEMANTIC SEARCH ---
		// convert user's search query to a vector
		queryVector, err := getEmbedding(searchQuery)
		
		if err == nil {
			// SQL: sort by cosine distance (<=>)
			// this finds posts that are mathematically closest in meaning
			initializers.DB.Preload("User").Preload("Topic").
				Order(initializers.DB.Raw("embedding <=> ?", queryVector)).
				Limit(10).
				Find(&posts)
		} else {
            // if OpenAI fails, fallback to standard empty list or error
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Search unavailable"})
            return
        }
	} else {
		// normal feed (chronological)
		initializers.DB.Preload("User").Preload("Topic").Order("created_at desc").Find(&posts)
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

func GetPost(c *gin.Context) {
	// get ID from URL param (e.g. /posts/1)
	id := c.Param("id")

	var post models.Post
	// preload (virtual fields) User AND Comments (and who wrote the comments)
	initializers.DB.Preload("User").Preload("Topic").First(&post, id)

	c.JSON(http.StatusOK, gin.H{"post": post})
}

func UpdatePost(c *gin.Context) {
	// get ID from URL
	id := c.Param("id")

	// get Data from Body
	var body struct {
		Title string
		Body  string
	}
	c.Bind(&body)

	// find Post
	var post models.Post
	if err := initializers.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// check Authorization (Is this your post?)
	user, _ := c.Get("user")
	currentUser := user.(models.User)
	if post.UserID != currentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized to edit this post"})
		return
	}

	// update & Save
	// MVP Note: we don't update embedding for updates to reduce complexity 
	initializers.DB.Model(&post).Updates(models.Post{
		Title: body.Title,
		Body:  body.Body,
	})

	c.JSON(http.StatusOK, gin.H{"post": post})
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")

	var post models.Post
	if err := initializers.DB.First(&post, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	user, _ := c.Get("user")
	currentUser := user.(models.User)

	if post.UserID != currentUser.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized to delete this post"})
		return
	}

	initializers.DB.Delete(&post) // soft delete (sets deleted_at)

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}