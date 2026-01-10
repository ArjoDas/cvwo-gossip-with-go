package models

import "gorm.io/gorm"

type Topic struct {
	gorm.Model
	Slug        string `gorm:"uniqueIndex"` // e.g., "tech-news"
	Title       string
	Description string
	
	// Relationships
	Posts     []Post
	Moderators []User `gorm:"many2many:topic_moderators;"` // creates the Join Table automatically
}

// GORM will automatically create the "topic_moderators" table with topic_id and user_id columns