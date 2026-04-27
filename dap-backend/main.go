package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"dap-backend/config"
	"dap-backend/handlers"
	"dap-backend/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file, using system env")
	}

	config.InitFirebase()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://*.web.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")

	// ── Public routes — no token needed ──
	public := api.Group("/")
	{
		public.GET("/health", handlers.HealthCheck)
		public.POST("/auth/register", handlers.Register)
		public.POST("/auth/login", handlers.Login)
	}

	// ── Protected routes — token required ──
	protected := api.Group("/")
	protected.Use(middleware.AuthRequired())
	{
		protected.GET("/auth/me", handlers.GetMe)

		protected.GET("/stats", handlers.GetStats)

		protected.POST("/assets/upload", handlers.UploadAsset)
		protected.GET("/assets", handlers.ListAssets)
		protected.GET("/assets/:id", handlers.GetAsset)
		protected.DELETE("/assets/:id", handlers.DeleteAsset)

		protected.GET("/violations", handlers.ListViolations)
		protected.POST("/violations/:id/resolve", handlers.ResolveViolation)

		protected.POST("/scan", handlers.TriggerScan)
		protected.POST("/seed", handlers.SeedDemoData)

		protected.GET("/test-gemini", handlers.TestGemini)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("DAP Backend running on :%s", port)
	r.Run(":" + port)
}