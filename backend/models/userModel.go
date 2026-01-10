package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username     string `gorm:"uniqueIndex"`
	Email        string `gorm:"uniqueIndex"`
	PasswordHash string
	Role         string `gorm:"default:'user'"` // Enforced in logic as 'user' or 'sys_admin'
	
	// Relationships
	Posts    []Post
	Comments []Comment
	Votes    []Vote
    
    // Reverse relation for the Many-to-Many topic moderation
    ModeratedTopics []Topic `gorm:"many2many:topic_moderators;"`
}