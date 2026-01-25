package controllers

import (
	"net/http"

	"github.com/arjodas/cvwo-gossip-with-go/backend/initializers"
	"github.com/arjodas/cvwo-gossip-with-go/backend/models"
	"github.com/gin-gonic/gin"
)

func CreateComment(c *gin.Context) {
	// get body (comment text)
	var body struct {
		Body string
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	// get Post ID from URL (e.g., /posts/1/comments)
	postID := c.Param("id")

	// get User from context
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	// look up the Post (to ensure it exists)
	var post models.Post
	if result := initializers.DB.First(&post, postID); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// create Comment
	comment := models.Comment{
		Body:   body.Body,
		UserID: currentUser.ID,
		PostID: post.ID,
	}

	result := initializers.DB.Create(&comment)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comment": comment})
}

func GetComments(c *gin.Context) {
	postID := c.Param("id")

	var comments []models.Comment
	// get comments AND user who wrote them
	initializers.DB.Where("post_id = ?", postID).Preload("User").Find(&comments)

	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

func UpdateComment(c *gin.Context) {
	id := c.Param("id")
	var body struct { Body string }
	c.Bind(&body)

	var comment models.Comment
	if err := initializers.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	user, _ := c.Get("user")
	if comment.UserID != user.(models.User).ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not your comment"})
		return
	}

	initializers.DB.Model(&comment).Updates(models.Comment{Body: body.Body})
	c.JSON(http.StatusOK, gin.H{"comment": comment})
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")
	var comment models.Comment
	if err := initializers.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	user, _ := c.Get("user")
	if comment.UserID != user.(models.User).ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not your comment"})
		return
	}

	initializers.DB.Delete(&comment)
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}