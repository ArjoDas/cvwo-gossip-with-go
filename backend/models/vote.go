package models

type Vote struct {
	ID uint `gorm:"primaryKey"`
    
	// composite unique index: User cannot vote on the same target twice
	UserID     uint   `gorm:"uniqueIndex:idx_unique_vote"`
	TargetID   uint   `gorm:"uniqueIndex:idx_unique_vote"`
	TargetType string `gorm:"uniqueIndex:idx_unique_vote"` // "post" or "comment"
	
	Value int
}