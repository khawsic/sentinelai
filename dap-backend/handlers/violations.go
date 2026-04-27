package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"dap-backend/config"
	"dap-backend/services"
)

func ListViolations(c *gin.Context) {
	violations, err := config.FirestoreList("violations")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if violations == nil {
		violations = []map[string]interface{}{}
	}
	c.JSON(http.StatusOK, gin.H{
		"violations": violations,
		"count":      len(violations),
	})
}

func ResolveViolation(c *gin.Context) {
	id := c.Param("id")
	if err := config.FirestoreUpdate("violations", id, "status", "resolved"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "violation resolved", "id": id})
}

func TestGemini(c *gin.Context) {
	gemini := services.NewGeminiClient()
	analysis, err := gemini.AnalyzeViolation(
		"IPL Final 2024 Highlights",
		"YouTube",
		"https://youtube.com/watch?v=fake123",
		94.5,
		"BCCI",
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, analysis)
}

func GetStats(c *gin.Context) {
	assets, _ := config.FirestoreList("assets")
	violations, _ := config.FirestoreList("violations")

	critical, high, medium, resolved := 0, 0, 0, 0
	for _, v := range violations {
		switch v["severity"] {
		case "critical":
			critical++
		case "high":
			high++
		case "medium":
			medium++
		}
		if v["status"] == "resolved" {
			resolved++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_assets":     len(assets),
		"total_violations": len(violations),
		"critical":         critical,
		"high":             high,
		"medium":           medium,
		"resolved":         resolved,
		"active":           len(violations) - resolved,
	})
}