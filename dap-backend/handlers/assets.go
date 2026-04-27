package handlers

import (
	"bytes"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/corona10/goimagehash"
	"dap-backend/config"
)

func UploadAsset(c *gin.Context) {
	owner := c.PostForm("owner")
	name := c.PostForm("name")
	territories := c.PostFormArray("territories")

	if owner == "" || name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "owner and name are required"})
		return
	}

	file, _, err := c.Request.FormFile("media")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "media file is required"})
		return
	}
	defer file.Close()

	buf := new(bytes.Buffer)
	buf.ReadFrom(file)

	img, _, err := image.Decode(bytes.NewReader(buf.Bytes()))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid image file"})
		return
	}

	phash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "fingerprinting failed"})
		return
	}

	ahash, _ := goimagehash.AverageHash(img)

	assetID := uuid.New().String()

	if len(territories) == 0 {
		territories = []string{"global"}
	}

	doc := map[string]interface{}{
		"id":          assetID,
		"name":        name,
		"owner":       owner,
		"phash":       phash.ToString(),
		"ahash":       ahash.ToString(),
		"status":      "active",
		"created_at":  time.Now().Format(time.RFC3339),
	}

	if err := config.FirestoreSet("assets", assetID, doc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save asset: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"asset_id": assetID,
		"phash":    phash.ToString(),
		"ahash":    ahash.ToString(),
		"message":  "Asset '" + name + "' registered and fingerprinted",
	})
}

func ListAssets(c *gin.Context) {
	assets, err := config.FirestoreList("assets")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"assets": assets, "count": len(assets)})
}

func GetAsset(c *gin.Context) {
	id := c.Param("id")
	asset, err := config.FirestoreGet("assets", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "asset not found"})
		return
	}
	c.JSON(http.StatusOK, asset)
}
func DeleteAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.FirestoreDelete("assets", id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "asset deleted", "id": id})
}