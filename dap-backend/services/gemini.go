package services

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "time"
)

type GeminiClient struct {
    APIKey     string
    HTTPClient *http.Client
}

type ViolationAnalysis struct {
    RiskScore      int    `json:"risk_score"`
    Severity       string `json:"severity"`
    Report         string `json:"ai_report"`
    Recommended    string `json:"recommended_action"`
    Explanation    string `json:"explanation"`
    RepeatOffender bool   `json:"repeat_offender"`
    ViewsImpact    string `json:"views_impact"`
}

func NewGeminiClient() *GeminiClient {
    return &GeminiClient{
        APIKey:     os.Getenv("GEMINI_API_KEY"),
        HTTPClient: &http.Client{Timeout: 30 * time.Second},
    }
}

func (g *GeminiClient) AnalyzeViolation(
    assetName string,
    platform string,
    infringingURL string,
    similarity float64,
    owner string,
) (*ViolationAnalysis, error) {

    prompt := fmt.Sprintf(`You are an expert digital rights enforcement AI for sports media organizations.

Analyze this potential copyright violation and respond in valid JSON only. No markdown, no backticks, no explanation outside the JSON.

Asset: "%s"
Rights Owner: "%s"
Platform: "%s"
Infringing URL: "%s"
Visual Similarity Score: %.1f%%

Scoring rules:
- similarity 90-100%%: risk_score 85-100, severity "critical"
- similarity 75-89%%: risk_score 65-84, severity "high"  
- similarity 55-74%%: risk_score 40-64, severity "medium"
- similarity below 55%%: risk_score 10-39, severity "low"
- Live streams or full matches: always bump to critical
- Fan edits or compilations: may qualify as fair use, lower severity

Respond with ONLY this JSON structure:
{
  "risk_score": <integer 0-100>,
  "severity": "<critical|high|medium|low>",
  "ai_report": "<2-3 sentence professional analysis of the violation, mention similarity score and commercial impact>",
  "recommended_action": "<immediate_takedown|dmca_notice|monitor|ignore>",
  "explanation": "<1 sentence plain English explanation of why this was flagged — for transparency>",
  "repeat_offender": <true if channel name suggests serial piracy, false otherwise>,
  "views_impact": "<high|medium|low based on platform reach>"
}`,
        assetName, owner, platform, infringingURL, similarity)

    payload := map[string]interface{}{
        "contents": []map[string]interface{}{
            {"parts": []map[string]interface{}{{"text": prompt}}},
        },
        "generationConfig": map[string]interface{}{
            "temperature":     0.1,
            "maxOutputTokens": 400,
        },
    }

    body, _ := json.Marshal(payload)
    url := fmt.Sprintf(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s",
        g.APIKey,
    )

    resp, err := g.HTTPClient.Post(url, "application/json", bytes.NewBuffer(body))
    if err != nil {
        return nil, fmt.Errorf("gemini request failed: %w", err)
    }
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)

    if resp.StatusCode != 200 {
        return nil, fmt.Errorf("gemini error %d: %s", resp.StatusCode, string(respBody))
    }

    var geminiResp struct {
        Candidates []struct {
            Content struct {
                Parts []struct {
                    Text string `json:"text"`
                } `json:"parts"`
            } `json:"content"`
        } `json:"candidates"`
    }

    if err := json.Unmarshal(respBody, &geminiResp); err != nil {
        return nil, fmt.Errorf("failed to parse gemini response: %w", err)
    }

    if len(geminiResp.Candidates) == 0 {
        return nil, fmt.Errorf("no candidates in gemini response")
    }

    text := geminiResp.Candidates[0].Content.Parts[0].Text

    // Clean any accidental markdown
    text = cleanJSON(text)

    var analysis ViolationAnalysis
    if err := json.Unmarshal([]byte(text), &analysis); err != nil {
        return &ViolationAnalysis{
            RiskScore:   int(similarity),
            Severity:    scoreToSeverity(similarity),
            Report:      "AI analysis generated from fingerprint match. Manual review recommended.",
            Recommended: "monitor",
            Explanation: fmt.Sprintf("Content matched with %.1f%% visual similarity to registered asset.", similarity),
            RepeatOffender: false,
            ViewsImpact: "medium",
        }, nil
    }

    return &analysis, nil
}

func cleanJSON(text string) string {
    // Remove markdown code fences
    result := ""
    inCode := false
    lines := splitLines(text)
    for _, line := range lines {
        if line == "```json" || line == "```" {
            inCode = !inCode
            continue
        }
        result += line + "\n"
    }
    if result == "" {
        return text
    }
    return result
}

func splitLines(s string) []string {
    var lines []string
    start := 0
    for i := 0; i < len(s); i++ {
        if s[i] == '\n' {
            lines = append(lines, s[start:i])
            start = i + 1
        }
    }
    if start < len(s) {
        lines = append(lines, s[start:])
    }
    return lines
}

func scoreToSeverity(similarity float64) string {
    switch {
    case similarity >= 90:
        return "critical"
    case similarity >= 75:
        return "high"
    case similarity >= 55:
        return "medium"
    default:
        return "low"
    }
}

func (g *GeminiClient) GenerateScanQuery(assetName, owner string) string {
    return fmt.Sprintf("%s %s highlights official", assetName, owner)
}