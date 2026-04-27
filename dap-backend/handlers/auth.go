package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"dap-backend/config"
)

type AuthRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name"`
}

type FirebaseAuthResponse struct {
	IDToken   string `json:"idToken"`
	Email     string `json:"email"`
	LocalID   string `json:"localId"`
}

type FirebaseAuthError struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func firebaseAuthPost(endpoint, apiKey string, payload map[string]interface{}) ([]byte, int, error) {
	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:%s?key=%s", endpoint, apiKey)
	body, _ := json.Marshal(payload)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	return data, resp.StatusCode, nil
}

func friendlyAuthError(msg string) string {
	switch msg {
	case "EMAIL_EXISTS":
		return "an account with this email already exists"
	case "WEAK_PASSWORD : Password should be at least 6 characters":
		return "password must be at least 6 characters"
	case "INVALID_EMAIL":
		return "invalid email address"
	case "INVALID_PASSWORD", "INVALID_LOGIN_CREDENTIALS":
		return "invalid email or password"
	case "EMAIL_NOT_FOUND":
		return "no account found with this email"
	case "USER_DISABLED":
		return "this account has been disabled"
	default:
		return msg
	}
}

func Register(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password required"})
		return
	}

	data, status, err := firebaseAuthPost("signUp", os.Getenv("FIREBASE_API_KEY"), map[string]interface{}{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "auth service unavailable"})
		return
	}

	if status != 200 {
		var authErr FirebaseAuthError
		json.Unmarshal(data, &authErr)
		c.JSON(http.StatusBadRequest, gin.H{"error": friendlyAuthError(authErr.Error.Message)})
		return
	}

	var authResp FirebaseAuthResponse
	json.Unmarshal(data, &authResp)

	name := req.Name
	if name == "" {
		name = req.Email
	}

	config.FirestoreSet("users", authResp.LocalID, map[string]interface{}{
		"id":         authResp.LocalID,
		"email":      req.Email,
		"name":       name,
		"role":       "rights_holder",
		"created_at": time.Now().Format(time.RFC3339),
	})

	c.JSON(http.StatusCreated, gin.H{
		"token":   authResp.IDToken,
		"user_id": authResp.LocalID,
		"email":   authResp.Email,
		"name":    name,
		"message": "account created successfully",
	})
}

func Login(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password required"})
		return
	}

	data, status, err := firebaseAuthPost("signInWithPassword", os.Getenv("FIREBASE_API_KEY"), map[string]interface{}{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": true,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "auth service unavailable"})
		return
	}

	if status != 200 {
		var authErr FirebaseAuthError
		json.Unmarshal(data, &authErr)
		c.JSON(http.StatusUnauthorized, gin.H{"error": friendlyAuthError(authErr.Error.Message)})
		return
	}

	var authResp FirebaseAuthResponse
	json.Unmarshal(data, &authResp)

	c.JSON(http.StatusOK, gin.H{
		"token":   authResp.IDToken,
		"user_id": authResp.LocalID,
		"email":   authResp.Email,
		"message": "login successful",
	})
}

func GetMe(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"user_id": c.MustGet("user_id"),
		"email":   c.MustGet("email"),
	})
}