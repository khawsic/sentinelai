package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"dap-backend/config"
)

func SeedDemoData(c *gin.Context) {
	assets := []map[string]interface{}{
		{
			"id":         uuid.New().String(),
			"name":       "IPL 2024 Final Highlights",
			"owner":      "BCCI",
			"phash":      "p:a1b2c3d4e5f60718",
			"ahash":      "a:1234567890abcdef",
			"status":     "active",
			"territories": "IN,GB,AU",
			"created_at": time.Now().Format(time.RFC3339),
		},
		{
			"id":         uuid.New().String(),
			"name":       "Champions League Final 2024",
			"owner":      "UEFA",
			"phash":      "p:f1e2d3c4b5a69870",
			"ahash":      "a:fedcba9876543210",
			"status":     "active",
			"territories": "GB,DE,FR,ES",
			"created_at": time.Now().Format(time.RFC3339),
		},
		{
			"id":         uuid.New().String(),
			"name":       "FIFA World Cup 2026 Promo",
			"owner":      "FIFA",
			"phash":      "p:deadbeef12345678",
			"ahash":      "a:cafebabe87654321",
			"status":     "active",
			"territories": "global",
			"created_at": time.Now().Format(time.RFC3339),
		},
	}

	violations := []map[string]interface{}{
		{
			"id":             uuid.New().String(),
			"asset_id":       "demo-asset-1",
			"asset_name":     "IPL 2024 Final Highlights",
			"owner":          "BCCI",
			"platform":       "YouTube",
			"infringing_url": "https://youtube.com/watch?v=demo1",
			"video_title":    "IPL Final Full Match Leaked HD",
			"channel_name":   "CricketFreeHD",
			"thumbnail_url":  "https://i.ytimg.com/vi/demo1/hqdefault.jpg",
			"similarity":     "94.50",
			"distance":       "3",
			"severity":       "critical",
			"risk_score":     "96",
			"ai_report":      "Content shows 94.5% visual similarity to BCCI's official IPL Final footage. Unauthorized redistribution on YouTube without license constitutes direct copyright infringement. Channel has 2.3M subscribers amplifying the reach significantly.",
			"recommended":    "immediate_takedown",
			"status":         "active",
			"detected_at":    time.Now().Format(time.RFC3339),
		},
		{
			"id":             uuid.New().String(),
			"asset_id":       "demo-asset-2",
			"asset_name":     "Champions League Final 2024",
			"owner":          "UEFA",
			"platform":       "YouTube",
			"infringing_url": "https://youtube.com/watch?v=demo2",
			"video_title":    "Champions League Final Goals Compilation",
			"channel_name":   "FootballLeaksTV",
			"thumbnail_url":  "https://i.ytimg.com/vi/demo2/hqdefault.jpg",
			"similarity":     "87.30",
			"distance":       "8",
			"severity":       "high",
			"risk_score":     "82",
			"ai_report":      "Video contains UEFA Champions League Final footage with 87.3% match confidence. Goal compilation format is commonly used to circumvent automated detection. Rights violation across multiple EU territories where UEFA holds exclusive broadcast rights.",
			"recommended":    "dmca_notice",
			"status":         "active",
			"detected_at":    time.Now().Add(-30 * time.Minute).Format(time.RFC3339),
		},
		{
			"id":             uuid.New().String(),
			"asset_id":       "demo-asset-3",
			"asset_name":     "FIFA World Cup 2026 Promo",
			"owner":          "FIFA",
			"platform":       "YouTube",
			"infringing_url": "https://youtube.com/watch?v=demo3",
			"video_title":    "FIFA WC 2026 Official Promo Leaked",
			"channel_name":   "SportLeaksDaily",
			"thumbnail_url":  "https://i.ytimg.com/vi/demo3/hqdefault.jpg",
			"similarity":     "78.10",
			"distance":       "14",
			"severity":       "high",
			"risk_score":     "74",
			"ai_report":      "FIFA promotional material redistributed without authorization. 78.1% visual match detected against registered asset. Content includes FIFA branding and official tournament graphics which are trademark protected.",
			"recommended":    "dmca_notice",
			"status":         "active",
			"detected_at":    time.Now().Add(-2 * time.Hour).Format(time.RFC3339),
		},
		{
			"id":             uuid.New().String(),
			"asset_id":       "demo-asset-1",
			"asset_name":     "IPL 2024 Final Highlights",
			"owner":          "BCCI",
			"platform":       "YouTube",
			"infringing_url": "https://youtube.com/watch?v=demo4",
			"video_title":    "IPL 2024 Best Moments Unofficial",
			"channel_name":   "CricketFanatics",
			"thumbnail_url":  "https://i.ytimg.com/vi/demo4/hqdefault.jpg",
			"similarity":     "61.20",
			"distance":       "24",
			"severity":       "medium",
			"risk_score":     "58",
			"ai_report":      "Partial match of 61.2% detected against BCCI IPL footage. Content appears to be a fan-edited compilation using official broadcast clips. While potentially fair use, the commercial monetization of this channel warrants a formal DMCA notice.",
			"recommended":    "monitor",
			"status":         "resolved",
			"detected_at":    time.Now().Add(-5 * time.Hour).Format(time.RFC3339),
		},
	}

	seeded := 0
	for _, asset := range assets {
		id := fmt.Sprintf("%v", asset["id"])
		if err := config.FirestoreSet("assets", id, asset); err == nil {
			seeded++
		}
	}
	for _, violation := range violations {
		id := fmt.Sprintf("%v", violation["id"])
		if err := config.FirestoreSet("violations", id, violation); err == nil {
			seeded++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "demo data seeded successfully",
		"assets_seeded":  len(assets),
		"violations_seeded": len(violations),
		"total_seeded":   seeded,
	})
}