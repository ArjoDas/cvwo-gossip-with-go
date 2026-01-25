package models

import "gorm.io/gorm"

type User struct {
	gorm.Model 	// predefined struct, allows auto inheritance of ID, CreatedAt, UpdatedAt, DeletedAt
	// note GORM enables soft delete, if user is deleted, they become invisible to normal queries but remain in the DB
	Username     string `gorm:"uniqueIndex"`
	Email        string `gorm:"uniqueIndex"`
	PasswordHash string
	Role         string `gorm:"default:'user'"` // enforced in logic as 'user' or 'sys_admin'
	
	// relationships
	Posts    []Post
	Comments []Comment
	Votes    []Vote
    
	// reverse relation for the Many-to-Many topic moderation
	// create a join table, necessary for many2many
	ModeratedTopics []Topic `gorm:"many2many:topic_moderators;"`
}