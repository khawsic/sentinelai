package models

import "time"



type Violation struct {
	ID           string    `json:"id" firestore:"id"`
	AssetID      string    `json:"asset_id" firestore:"asset_id"`
	AssetName    string    `json:"asset_name" firestore:"asset_name"`
	Platform     string    `json:"platform" firestore:"platform"`
	InfringingURL string   `json:"infringing_url" firestore:"infringing_url"`
	Similarity   float64   `json:"similarity" firestore:"similarity"`
	Severity     string    `json:"severity" firestore:"severity"` // critical, high, medium
	AIReport     string    `json:"ai_report" firestore:"ai_report"`
	RiskScore    int       `json:"risk_score" firestore:"risk_score"`
	DetectedAt   time.Time `json:"detected_at" firestore:"detected_at"`
	Status       string    `json:"status" firestore:"status"` // active, resolved
}

type UploadResponse struct {
	AssetID  string `json:"asset_id"`
	PHash    string `json:"phash"`
	Labels   []string `json:"labels"`
	Message  string `json:"message"`
}

type ScanResult struct {
	ViolationsFound int         `json:"violations_found"`
	Violations      []Violation `json:"violations"`
}

type Asset struct {
	ID          string    `json:"id" firestore:"id"`
	Name        string    `json:"name" firestore:"name"`
	Owner       string    `json:"owner" firestore:"owner"`
	MediaURL    string    `json:"media_url" firestore:"media_url"`
	PHash       string    `json:"phash" firestore:"phash"`
	AHash       string    `json:"ahash" firestore:"ahash"`
	Labels      []string  `json:"labels" firestore:"labels"`
	Territories []string  `json:"territories" firestore:"territories"`
	CreatedAt   time.Time `json:"created_at" firestore:"created_at"`
}