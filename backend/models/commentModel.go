package models

import "gorm.io/gorm"

type Comment struct {
	gorm.Model
	Body string
	
    // Relationships
	UserID uint
	User   User
	
    // Optimization: PostID exists on every comment
    PostID uint 
	Post   Post
    
    // Adjacency List: Recursive relationship
	ParentID *uint // Pointer allows null (Top level comments have no parent)
	Children []Comment `gorm:"foreignKey:ParentID"`
}