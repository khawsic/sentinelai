package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type FirebaseVerifyResponse struct {
	Users []struct {
		LocalID      string `json:"localId"`
		Email        string `json:"email"`
		ValidSince   string `json:"validSince"`
	} `json:"users"`
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format — use Bearer <token>"})
			c.Abort()
			return
		}

		token := parts[1]

		userID, email, err := verifyFirebaseToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token — please login again"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("email", email)
		c.Set("token", token)
		c.Next()
	}
}

func verifyFirebaseToken(idToken string) (string, string, error) {
	apiKey := os.Getenv("FIREBASE_API_KEY")
	url := fmt.Sprintf(
		"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=%s",
		apiKey,
	)

	payload := map[string]string{"idToken": idToken}
	body, _ := json.Marshal(payload)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return "", "", fmt.Errorf("token verification failed")
	}

	var verifyResp FirebaseVerifyResponse
	if err := json.Unmarshal(respBody, &verifyResp); err != nil {
		return "", "", err
	}

	if len(verifyResp.Users) == 0 {
		return "", "", fmt.Errorf("user not found")
	}

	user := verifyResp.Users[0]
	return user.LocalID, user.Email, nil
}