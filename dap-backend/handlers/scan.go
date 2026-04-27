package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"dap-backend/config"
	"dap-backend/services"
)

func TriggerScan(c *gin.Context) {
	assets, err := config.FirestoreList("assets")
	if err != nil || len(assets) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":          "no assets registered yet",
			"violations_found": 0,
		})
		return
	}

	crawler := services.NewYouTubeCrawler()
	gemini := services.NewGeminiClient()

	totalViolations := 0
	var allViolations []map[string]interface{}

	for _, asset := range assets {
		results, err := crawler.ScanAsset(asset, assets, gemini)
		if err != nil {
			continue
		}

		for _, result := range results {
			violationID := uuid.New().String()

			doc := map[string]interface{}{
				"id":             violationID,
				"asset_id":       result.MatchResult.AssetID,
				"asset_name":     result.MatchResult.AssetName,
				"owner":          result.MatchResult.Owner,
				"platform":       "YouTube",
				"infringing_url": result.Video.URL,
				"video_title":    result.Video.Title,
				"channel_name":   result.Video.ChannelName,
				"thumbnail_url":  result.Video.ThumbnailURL,
				"similarity":     fmt.Sprintf("%.2f", result.MatchResult.Similarity),
				"distance":       fmt.Sprintf("%d", result.MatchResult.Distance),
				"severity":       result.Analysis.Severity,
				"risk_score":     fmt.Sprintf("%d", result.Analysis.RiskScore),
				"ai_report":      result.Analysis.Report,
				"recommended":    result.Analysis.Recommended,
				"status":         "active",
				"detected_at":    time.Now().Format(time.RFC3339),
				"firebase_api":   os.Getenv("FIREBASE_API_KEY"),
			}

			// Remove internal key before saving
			delete(doc, "firebase_api")

			if err := config.FirestoreSet("violations", violationID, doc); err == nil {
				totalViolations++
				allViolations = append(allViolations, doc)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "scan complete",
		"assets_scanned":   len(assets),
		"violations_found": totalViolations,
		"violations":       allViolations,
	})
}