package models

import (
	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title  string
	Body   string
  // Relationships
	UserID uint			// foreign key
	User   User			// virtual field, filled only when called with db.Preload("User").Find...
	TopicID uint
	Topic   Topic
  // Semantic Search (Vector)
	Embedding pgvector.Vector `gorm:"type:vector(1536)"`
}