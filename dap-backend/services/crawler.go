package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

type YouTubeVideo struct {
	ID          string
	Title       string
	ChannelName string
	URL         string
	ThumbnailURL string
	PublishedAt string
}

type CrawlResult struct {
	Video      YouTubeVideo
	MatchResult MatchResult
	Analysis   *ViolationAnalysis
}

type YouTubeCrawler struct {
	APIKey     string
	HTTPClient *http.Client
}

func NewYouTubeCrawler() *YouTubeCrawler {
	return &YouTubeCrawler{
		APIKey:     os.Getenv("YOUTUBE_API_KEY"),
		HTTPClient: &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *YouTubeCrawler) Search(query string, maxResults int) ([]YouTubeVideo, error) {
	endpoint := "https://www.googleapis.com/youtube/v3/search"
	params := url.Values{}
	params.Set("part", "snippet")
	params.Set("q", query)
	params.Set("type", "video")
	params.Set("maxResults", fmt.Sprintf("%d", maxResults))
	params.Set("order", "date")
	params.Set("key", c.APIKey)

	resp, err := c.HTTPClient.Get(endpoint + "?" + params.Encode())
	if err != nil {
		return nil, fmt.Errorf("youtube search failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("youtube API error %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Items []struct {
			ID struct {
				VideoID string `json:"videoId"`
			} `json:"id"`
			Snippet struct {
				Title        string `json:"title"`
				ChannelTitle string `json:"channelTitle"`
				PublishedAt  string `json:"publishedAt"`
				Thumbnails   struct {
					High struct {
						URL string `json:"url"`
					} `json:"high"`
					Default struct {
						URL string `json:"url"`
					} `json:"default"`
				} `json:"thumbnails"`
			} `json:"snippet"`
		} `json:"items"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse youtube response: %w", err)
	}

	var videos []YouTubeVideo
	for _, item := range result.Items {
		thumbURL := item.Snippet.Thumbnails.High.URL
		if thumbURL == "" {
			thumbURL = item.Snippet.Thumbnails.Default.URL
		}
		videos = append(videos, YouTubeVideo{
			ID:           item.ID.VideoID,
			Title:        item.Snippet.Title,
			ChannelName:  item.Snippet.ChannelTitle,
			URL:          "https://youtube.com/watch?v=" + item.ID.VideoID,
			ThumbnailURL: thumbURL,
			PublishedAt:  item.Snippet.PublishedAt,
		})
	}

	return videos, nil
}

func (c *YouTubeCrawler) DownloadThumbnail(thumbURL string) ([]byte, error) {
	resp, err := c.HTTPClient.Get(thumbURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func (c *YouTubeCrawler) ScanAsset(
	asset map[string]interface{},
	allAssets []map[string]interface{},
	gemini *GeminiClient,
) ([]CrawlResult, error) {

	name, _ := asset["name"].(string)
	owner, _ := asset["owner"].(string)
	storedHash, _ := asset["phash"].(string)

	query := fmt.Sprintf("%s %s highlights leaked", name, owner)
	videos, err := c.Search(query, 10)
	if err != nil {
		return nil, err
	}

	var results []CrawlResult

	for _, video := range videos {
		if video.ThumbnailURL == "" {
			continue
		}

		thumbBytes, err := c.DownloadThumbnail(video.ThumbnailURL)
		if err != nil {
			continue
		}

		fp, err := GenerateFingerprintFromBytes(thumbBytes)
		if err != nil {
			continue
		}

		dist, err := CompareHashes(storedHash, fp.PHash)
		if err != nil {
			continue
		}

		similarity := (1.0 - float64(dist)/64.0) * 100.0

		if !IsLikelyMatch(dist) && similarity < 60 {
			continue
		}

		analysis, err := gemini.AnalyzeViolation(
			name,
			"YouTube",
			video.URL,
			similarity,
			owner,
		)
		if err != nil {
			analysis = &ViolationAnalysis{
				RiskScore:   int(similarity),
				Severity:    ScoreToSeverity(similarity),
				Report:      "AI analysis unavailable — flagged by fingerprint match",
				Recommended: "monitor",
			}
		}

		if analysis.Severity == "low" {
			continue
		}

		results = append(results, CrawlResult{
			Video: video,
			MatchResult: MatchResult{
				AssetID:    asset["id"].(string),
				AssetName:  name,
				Owner:      owner,
				Distance:   dist,
				Similarity: similarity,
				IsMatch:    true,
			},
			Analysis: analysis,
		})
	}

	return results, nil
}