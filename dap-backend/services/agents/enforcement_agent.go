package agents

import (
    "fmt"
    "log"
    "time"
    "dap-backend/config"
    "github.com/google/uuid"
)

type EnforcementAgent struct{}

type EnforcementResult struct {
    ViolationID   string
    AssetName     string
    Action        string
    Priority      string
    AutoEscalated bool
    SavedToDB     bool
    DMCATriggered bool
    AlertSent     bool
    Timestamp     string
    Error         string
    Decision      Decision
}

func NewEnforcementAgent() *EnforcementAgent { return &EnforcementAgent{} }

func (a *EnforcementAgent) Run(decisions []Decision) []EnforcementResult {
    log.Printf("[EnforcementAgent] Processing %d decisions", len(decisions))
    var results []EnforcementResult
    for _, decision := range decisions {
        if decision.Action == "ignore" { continue }
        result := EnforcementResult{
            ViolationID:   uuid.New().String(),
            AssetName:     decision.AnalysisResult.CrawlResult.MatchResult.AssetName,
            Action:        decision.Action,
            Priority:      decision.Priority,
            AutoEscalated: decision.AutoEscalate,
            Timestamp:     time.Now().Format(time.RFC3339),
            Decision:      decision,
        }
        crawl := decision.AnalysisResult.CrawlResult
        analysis := decision.AnalysisResult.Analysis
        doc := map[string]interface{}{
            "id": result.ViolationID,
            "asset_id": crawl.MatchResult.AssetID,
            "asset_name": crawl.MatchResult.AssetName,
            "owner": crawl.MatchResult.Owner,
            "platform": "YouTube",
            "infringing_url": crawl.Video.URL,
            "video_title": crawl.Video.Title,
            "channel_name": crawl.Video.ChannelName,
            "thumbnail_url": crawl.Video.ThumbnailURL,
            "published_at": crawl.Video.PublishedAt,
            "similarity": fmt.Sprintf("%.2f", crawl.MatchResult.Similarity),
            "distance": fmt.Sprintf("%d", crawl.MatchResult.Distance),
            "severity": analysis.Severity,
            "risk_score": analysis.RiskScore,
            "ai_report": analysis.Report,
            "recommended": analysis.Recommended,
            "explanation": analysis.Explanation,
            "repeat_offender": analysis.RepeatOffender,
            "views_impact": analysis.ViewsImpact,
            "action_taken": decision.Action,
            "priority": decision.Priority,
            "auto_escalated": decision.AutoEscalate,
            "decision_reason": decision.Reason,
            "agent_notes": decision.AnalysisResult.AgentNotes,
            "status": "active",
            "detected_at": result.Timestamp,
        }
        if err := config.FirestoreSet("violations", result.ViolationID, doc); err != nil {
            result.Error = err.Error()
            log.Printf("[EnforcementAgent] DB error: %s", err.Error())
        } else {
            result.SavedToDB = true
        }
        if decision.Action == "immediate_takedown" || decision.Action == "dmca_notice" {
            result.DMCATriggered = true
            dmcaDoc := map[string]interface{}{
                "id": uuid.New().String(), "violation_id": result.ViolationID,
                "asset_name": crawl.MatchResult.AssetName, "owner": crawl.MatchResult.Owner,
                "platform": "YouTube", "url": crawl.Video.URL,
                "action": decision.Action, "priority": decision.Priority,
                "status": "filed", "filed_at": result.Timestamp,
            }
            config.FirestoreSet("dmca_logs", dmcaDoc["id"].(string), dmcaDoc)
        }
        if decision.AutoEscalate {
            result.AlertSent = true
            alertDoc := map[string]interface{}{
                "id": uuid.New().String(), "violation_id": result.ViolationID,
                "asset_name": crawl.MatchResult.AssetName, "severity": analysis.Severity,
                "risk_score": analysis.RiskScore,
                "message": fmt.Sprintf("AUTO-ESCALATION: %s", decision.Reason),
                "action": decision.Action, "priority": decision.Priority,
                "read": false, "created_at": result.Timestamp,
            }
            config.FirestoreSet("alerts", alertDoc["id"].(string), alertDoc)
        }
        results = append(results, result)
    }
    log.Printf("[EnforcementAgent] Complete - %d processed", len(results))
    return results
}

func (a *EnforcementAgent) Status() string { return "EnforcementAgent: DMCA + alerts active" }

