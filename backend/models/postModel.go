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
	UserID uint
	User   User
	TopicID uint
	Topic   Topic
    
    // Semantic Search (Vector)
	Embedding pgvector.Vector `gorm:"type:vector(1536)"`
    
    // Keyword Search (TsVector)
  // Note: GORM doesn't manage tsvector updates automatically. 
  // We usually set this to ignore (-) in struct and handle via a DB Trigger or SQL.
  // For now, we leave it out of the struct to prevent errors, 
  // as we will add the column via raw SQL migration later.
}