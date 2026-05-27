package agents

import (
	"fmt"
	"log"
	"dap-backend/services"
)

// AnalysisAgent uses Gemini AI to deeply analyze each violation
// and produce structured intelligence reports.
type AnalysisAgent struct {
	gemini *services.GeminiClient
}

type AnalysisResult struct {
	CrawlResult services.CrawlResult
	Analysis    *services.ViolationAnalysis
	AgentNotes  string
}

func NewAnalysisAgent(gemini *services.GeminiClient) *AnalysisAgent {
	return &AnalysisAgent{gemini: gemini}
}

// Run analyzes all crawler results using Gemini AI
func (a *AnalysisAgent) Run(scanResults []ScannerResult) []AnalysisResult {
	log.Printf("[AnalysisAgent] Starting deep analysis")

	var analysisResults []AnalysisResult

	for _, scanResult := range scanResults {
		if scanResult.Error != nil {
			continue
		}

		for _, crawlResult := range scanResult.Results {
			log.Printf("[AnalysisAgent] Analyzing violation: %s on %s",
				crawlResult.MatchResult.AssetName,
				crawlResult.Video.URL,
			)

			// Deep analysis with full context
			analysis, err := a.gemini.AnalyzeViolation(
				crawlResult.MatchResult.AssetName,
				"YouTube",
				crawlResult.Video.URL,
				crawlResult.MatchResult.Similarity,
				crawlResult.MatchResult.Owner,
			)

			notes := a.generateAgentNotes(crawlResult, analysis)

			if err != nil {
				log.Printf("[AnalysisAgent] Gemini error, using fallback: %s", err.Error())
				analysis = &services.ViolationAnalysis{
					RiskScore:   int(crawlResult.MatchResult.Similarity),
					Severity:    services.ScoreToSeverity(crawlResult.MatchResult.Similarity),
					Report:      fmt.Sprintf("Fingerprint match detected for '%s'. Similarity: %.1f%%", crawlResult.MatchResult.AssetName, crawlResult.MatchResult.Similarity),
					Recommended: "monitor",
					Explanation: "Automated fingerprint detection — AI analysis unavailable",
				}
			}

			analysisResults = append(analysisResults, AnalysisResult{
				CrawlResult: crawlResult,
				Analysis:    analysis,
				AgentNotes:  notes,
			})

			log.Printf("[AnalysisAgent] Risk score: %d, Severity: %s",
				analysis.RiskScore, analysis.Severity)
		}
	}

	log.Printf("[AnalysisAgent] Analysis complete — %d violations analyzed", len(analysisResults))
	return analysisResults
}

// generateAgentNotes creates context-aware notes for each violation
func (a *AnalysisAgent) generateAgentNotes(
	result services.CrawlResult,
	analysis *services.ViolationAnalysis,
) string {
	notes := fmt.Sprintf(
		"Asset '%s' matched with %.1f%% similarity. Channel: %s.",
		result.MatchResult.AssetName,
		result.MatchResult.Similarity,
		result.Video.ChannelName,
	)

	if analysis != nil {
		if analysis.RepeatOffender {
			notes += " ⚠️ REPEAT OFFENDER detected."
		}
		if analysis.ViewsImpact == "high" {
			notes += " 🔴 HIGH VIEW IMPACT — immediate action required."
		}
	}

	return notes
}

func (a *AnalysisAgent) Status() string {
	return "AnalysisAgent: Gemini AI deep reasoning active"
}
