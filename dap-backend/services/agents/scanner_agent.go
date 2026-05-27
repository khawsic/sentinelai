package agents

import (
	"fmt"
	"log"
	"sync"
	"dap-backend/services"
)

// ScannerAgent is responsible for finding potential violations
// across platforms for all registered assets.
type ScannerAgent struct {
	crawler *services.YouTubeCrawler
}

type ScannerResult struct {
	Asset   map[string]interface{}
	Results []services.CrawlResult
	Error   error
}

func NewScannerAgent() *ScannerAgent {
	return &ScannerAgent{
		crawler: services.NewYouTubeCrawler(),
	}
}

// Run scans all assets concurrently using goroutines
func (a *ScannerAgent) Run(
	assets []map[string]interface{},
	gemini *services.GeminiClient,
) []ScannerResult {

	log.Printf("[ScannerAgent] Starting scan for %d assets", len(assets))

	var wg sync.WaitGroup
	resultsCh := make(chan ScannerResult, len(assets))

	for _, asset := range assets {
		wg.Add(1)
		go func(asset map[string]interface{}) {
			defer wg.Done()

			name, _ := asset["name"].(string)
			log.Printf("[ScannerAgent] Scanning asset: %s", name)

			results, err := a.crawler.ScanAsset(asset, assets, gemini)
			resultsCh <- ScannerResult{
				Asset:   asset,
				Results: results,
				Error:   err,
			}

			if err != nil {
				log.Printf("[ScannerAgent] Error scanning '%s': %s", name, err.Error())
			} else {
				log.Printf("[ScannerAgent] Found %d potential violations for '%s'", len(results), name)
			}
		}(asset)
	}

	// Close channel when all goroutines finish
	go func() {
		wg.Wait()
		close(resultsCh)
	}()

	var allResults []ScannerResult
	for result := range resultsCh {
		allResults = append(allResults, result)
	}

	log.Printf("[ScannerAgent] Scan complete — %d assets processed", len(allResults))
	return allResults
}

// Status returns a human-readable status for the UI
func (a *ScannerAgent) Status() string {
	return fmt.Sprintf("ScannerAgent: YouTube crawling active across 60+ query patterns")
}
