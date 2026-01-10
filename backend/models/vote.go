package models

type Vote struct {
	ID uint `gorm:"primaryKey"`
    
    // Composite Unique Index: User cannot vote on the same Target twice
	UserID     uint   `gorm:"uniqueIndex:idx_unique_vote"`
	TargetID   uint   `gorm:"uniqueIndex:idx_unique_vote"`
	TargetType string `gorm:"uniqueIndex:idx_unique_vote"` // "post" or "comment"
	
	Value int
}