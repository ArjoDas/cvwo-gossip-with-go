package models

import "gorm.io/gorm"

type Comment struct {
	gorm.Model
	Body string
	
  // relationships
	UserID uint
	User   User		// virtual field
	
  // optimisation: PostID exists on every comment, know post without traversing adj list
  PostID uint 
	Post   Post		// virtual field
    
  // adjacency list: recursive relationship
	ParentID *uint // pointer allows null (top level comments have no parent)
	Children []Comment `gorm:"foreignKey:ParentID"`
}