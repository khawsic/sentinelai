package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"dap-backend/config"
	"dap-backend/services"
	"dap-backend/services/agents"
)

// AgentScan runs the full multi-agent pipeline:
// Scanner → Analysis → Decision → Enforcement → Monitor
func AgentScan(c *gin.Context) {

	startTime := time.Now()
	log.Printf("[AgentPipeline] 🚀 Starting multi-agent scan")

	// ── Step 1: Load assets ───────────────────────────────────────────────────
	assets, err := config.FirestoreList("assets")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to load assets",
		})
		return
	}

	if len(assets) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":    "no assets registered — upload media first",
			"pipeline":   "idle",
			"agents_run": 0,
		})
		return
	}

	gemini := services.NewGeminiClient()

	// ── Agent 1: Scanner ──────────────────────────────────────────────────────
	log.Printf("[AgentPipeline] Agent 1: ScannerAgent starting")
	scannerAgent := agents.NewScannerAgent()
	scanResults := scannerAgent.Run(assets, gemini)
	log.Printf("[AgentPipeline] Agent 1: ScannerAgent complete")

	// ── Agent 2: Analysis ─────────────────────────────────────────────────────
	log.Printf("[AgentPipeline] Agent 2: AnalysisAgent starting")
	analysisAgent := agents.NewAnalysisAgent(gemini)
	analysisResults := analysisAgent.Run(scanResults)
	log.Printf("[AgentPipeline] Agent 2: AnalysisAgent complete")

	// ── Agent 3: Decision ─────────────────────────────────────────────────────
	log.Printf("[AgentPipeline] Agent 3: DecisionAgent starting")
	decisionAgent := agents.NewDecisionAgent()
	decisions := decisionAgent.Run(analysisResults)
	log.Printf("[AgentPipeline] Agent 3: DecisionAgent complete")

	// ── Agent 4: Enforcement ──────────────────────────────────────────────────
	log.Printf("[AgentPipeline] Agent 4: EnforcementAgent starting")
	enforcementAgent := agents.NewEnforcementAgent()
	enforcementResults := enforcementAgent.Run(decisions)
	log.Printf("[AgentPipeline] Agent 4: EnforcementAgent complete")

	// ── Agent 5: Monitor ──────────────────────────────────────────────────────
	log.Printf("[AgentPipeline] Agent 5: MonitorAgent starting")
	monitorAgent := agents.NewMonitorAgent()
	report := monitorAgent.Run(enforcementResults)
	log.Printf("[AgentPipeline] Agent 5: MonitorAgent complete")

	// ── Build response ────────────────────────────────────────────────────────
	duration := time.Since(startTime).Seconds()

	// Count actions
	autoEscalated := 0
	dmcaFiled := 0
	for _, r := range enforcementResults {
		if r.AutoEscalated {
			autoEscalated++
		}
		if r.DMCATriggered {
			dmcaFiled++
		}
	}

	log.Printf("[AgentPipeline] ✅ Pipeline complete in %.2fs — %d violations found",
		duration, report.TotalViolations)

	c.JSON(http.StatusOK, gin.H{
		"pipeline": "complete",
		"duration_seconds": duration,
		"agents_run": 5,
		"agent_statuses": []string{
			scannerAgent.Status(),
			analysisAgent.Status(),
			decisionAgent.Status(),
			enforcementAgent.Status(),
			monitorAgent.Status(),
		},
		"results": gin.H{
			"assets_scanned":    len(assets),
			"violations_found":  report.TotalViolations,
			"auto_escalated":    autoEscalated,
			"dmca_filed":        dmcaFiled,
			"repeat_offenders":  report.RepeatOffenders,
			"critical_assets":   report.CriticalAssets,
			"platform_breakdown": report.PlatformBreakdown,
		},
		"summary":      report.SummaryReport,
		"scanned_at":   report.GeneratedAt,
	})
}
