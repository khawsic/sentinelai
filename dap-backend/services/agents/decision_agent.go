package agents

import (
	"fmt"
	"log"
)

// DecisionAgent applies rule-based + AI-based logic
// to automatically decide what action to take per violation.
type DecisionAgent struct{}

type Decision struct {
	AnalysisResult AnalysisResult
	Action         string
	Priority       string
	AutoEscalate   bool
	Reason         string
}

func NewDecisionAgent() *DecisionAgent {
	return &DecisionAgent{}
}

// Run evaluates every analysis result and decides action
func (a *DecisionAgent) Run(analysisResults []AnalysisResult) []Decision {
	log.Printf("[DecisionAgent] Evaluating %d violations", len(analysisResults))

	var decisions []Decision

	for _, result := range analysisResults {
		analysis := result.Analysis
		decision := Decision{
			AnalysisResult: result,
		}

		// ── Rule 1: Critical severity → immediate takedown + escalate
		if analysis.Severity == "critical" || analysis.RiskScore >= 85 {
			decision.Action = "immediate_takedown"
			decision.Priority = "P1"
			decision.AutoEscalate = true
			decision.Reason = fmt.Sprintf(
				"Risk score %d/100 exceeds critical threshold. Auto-escalating to enforcement.",
				analysis.RiskScore,
			)
		}

		// ── Rule 2: High severity → DMCA notice
		if analysis.Severity == "high" || (analysis.RiskScore >= 65 && analysis.RiskScore < 85) {
			decision.Action = "dmca_notice"
			decision.Priority = "P2"
			decision.AutoEscalate = false
			decision.Reason = fmt.Sprintf(
				"High severity violation detected. Risk score: %d/100. DMCA notice recommended.",
				analysis.RiskScore,
			)
		}

		// ── Rule 3: Repeat offender → always escalate regardless of score
		if analysis.RepeatOffender {
			decision.AutoEscalate = true
			decision.Priority = "P1"
			decision.Reason += " Repeat offender detected — automatic escalation triggered."
		}

		// ── Rule 4: High view impact → escalate
		if analysis.ViewsImpact == "high" {
			decision.AutoEscalate = true
			decision.Reason += " High audience reach detected — escalating priority."
		}

		// ── Rule 5: Medium severity → monitor
		if analysis.Severity == "medium" && !decision.AutoEscalate {
			decision.Action = "monitor"
			decision.Priority = "P3"
			decision.Reason = fmt.Sprintf(
				"Medium severity. Risk score: %d/100. Monitoring for escalation.",
				analysis.RiskScore,
			)
		}

		// ── Rule 6: Low severity → ignore
		if analysis.Severity == "low" && decision.Action == "" {
			decision.Action = "ignore"
			decision.Priority = "P4"
			decision.Reason = "Low severity — below action threshold."
		}

		log.Printf("[DecisionAgent] Asset '%s' → Action: %s, Priority: %s, AutoEscalate: %v",
			result.CrawlResult.MatchResult.AssetName,
			decision.Action,
			decision.Priority,
			decision.AutoEscalate,
		)

		decisions = append(decisions, decision)
	}

	log.Printf("[DecisionAgent] Decisions complete — %d actions assigned", len(decisions))
	return decisions
}

func (a *DecisionAgent) Status() string {
	return "DecisionAgent: Rule-based + AI decision engine active"
}
