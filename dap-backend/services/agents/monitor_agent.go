package agents

import (
    "fmt"
    "log"
    "time"
    "dap-backend/config"
    "github.com/google/uuid"
)

type MonitorAgent struct{}

type MonitorReport struct {
    TotalViolations   int
    AutoEscalated     int
    DMCAFiled         int
    RepeatOffenders   []string
    CriticalAssets    []string
    PlatformBreakdown map[string]int
    SummaryReport     string
    GeneratedAt       string
}

func NewMonitorAgent() *MonitorAgent { return &MonitorAgent{} }

func (a *MonitorAgent) Run(enforcementResults []EnforcementResult) MonitorReport {
    log.Printf("[MonitorAgent] Building report from %d results", len(enforcementResults))
    report := MonitorReport{PlatformBreakdown: make(map[string]int), GeneratedAt: time.Now().Format(time.RFC3339)}
    repeatOffenderSet := make(map[string]bool)
    criticalAssetSet := make(map[string]bool)
    for _, result := range enforcementResults {
        report.TotalViolations++
        if result.DMCATriggered { report.DMCAFiled++ }
        if result.AutoEscalated { report.AutoEscalated++ }
        analysis := result.Decision.AnalysisResult.Analysis
        crawl := result.Decision.AnalysisResult.CrawlResult
        if analysis != nil && analysis.RepeatOffender {
            channel := crawl.Video.ChannelName
            if !repeatOffenderSet[channel] {
                repeatOffenderSet[channel] = true
                report.RepeatOffenders = append(report.RepeatOffenders, channel)
            }
        }
        if result.Priority == "P1" {
            if !criticalAssetSet[result.AssetName] {
                criticalAssetSet[result.AssetName] = true
                report.CriticalAssets = append(report.CriticalAssets, result.AssetName)
            }
        }
        report.PlatformBreakdown["YouTube"]++
    }
    report.SummaryReport = fmt.Sprintf("SentinelAI Report - %s | Violations: %d | Escalated: %d | DMCA: %d", report.GeneratedAt, report.TotalViolations, report.AutoEscalated, report.DMCAFiled)
    reportDoc := map[string]interface{}{"id": uuid.New().String(), "total_violations": report.TotalViolations, "auto_escalated": report.AutoEscalated, "dmca_filed": report.DMCAFiled, "summary": report.SummaryReport, "generated_at": report.GeneratedAt}
    config.FirestoreSet("scan_reports", reportDoc["id"].(string), reportDoc)
    log.Printf("[MonitorAgent] Complete")
    return report
}

func (a *MonitorAgent) Status() string { return "MonitorAgent: Intelligence reporting active" }

