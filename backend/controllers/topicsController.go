package controllers

import (
	"net/http"

	"github.com/arjodas/cvwo-gossip-with-go/backend/initializers"
	"github.com/arjodas/cvwo-gossip-with-go/backend/models"
	"github.com/gin-gonic/gin"
)

func GetTopics(c *gin.Context) {
	var topics []models.Topic
	initializers.DB.Find(&topics)
	c.JSON(http.StatusOK, gin.H{"topics": topics})
}

func CreateTopic(c *gin.Context) {
	var body struct {
		Title       string
		Slug        string
		Description string
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad Request"})
		return
	}

	topic := models.Topic{Title: body.Title, Slug: body.Slug, Description: body.Description}
	result := initializers.DB.Create(&topic)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Topic already exists?"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"topic": topic})
}

func UpdateTopic(c *gin.Context) {
    id := c.Param("id")
    var body struct { Title string; Description string }
    c.Bind(&body)

    var topic models.Topic
    if err := initializers.DB.First(&topic, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
        return
    }

    initializers.DB.Model(&topic).Updates(models.Topic{Title: body.Title, Description: body.Description})
    c.JSON(http.StatusOK, gin.H{"topic": topic})
}

func DeleteTopic(c *gin.Context) {
    id := c.Param("id")
    // Note: This might fail if you have constraints and posts attached. 
    // GORM Soft Delete usually handles it fine.
    initializers.DB.Delete(&models.Topic{}, id)
    c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func GetTopic(c *gin.Context) {
	id := c.Param("id")
	var topic models.Topic
	// Check if ID exists
	if result := initializers.DB.First(&topic, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"topic": topic})
}