package services

import (
	"fmt"
	"strconv"
	"strings"
)

type MatchResult struct {
	AssetID    string
	AssetName  string
	Owner      string
	Distance   int
	Similarity float64
	IsMatch    bool
}

func CompareHashes(storedHash, candidateHash string) (int, error) {
	s1 := extractBits(storedHash)
	s2 := extractBits(candidateHash)
	if len(s1) != len(s2) || len(s1) == 0 {
		return 64, fmt.Errorf("incompatible hashes")
	}
	distance := 0
	for i := range s1 {
		if s1[i] != s2[i] {
			distance++
		}
	}
	return distance, nil
}

func extractBits(hash string) []int {
	parts := strings.Split(hash, ":")
	if len(parts) < 2 {
		return nil
	}
	val, err := strconv.ParseUint(parts[1], 16, 64)
	if err != nil {
		return nil
	}
	bits := make([]int, 64)
	for i := 0; i < 64; i++ {
		if val&(1<<uint(63-i)) != 0 {
			bits[i] = 1
		}
	}
	return bits
}

func ScoreToSeverity(similarity float64) string {
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

func IsLikelyMatch(distance int) bool {
	return distance <= 12
}

func MatchAgainstRegistry(
	candidateHash string,
	assets []map[string]interface{},
) []MatchResult {
	var results []MatchResult
	for _, asset := range assets {
		storedHash, ok := asset["phash"].(string)
		if !ok || storedHash == "" {
			continue
		}
		dist, err := CompareHashes(storedHash, candidateHash)
		if err != nil {
			continue
		}
		similarity := (1.0 - float64(dist)/64.0) * 100.0
		if IsLikelyMatch(dist) {
			name, _ := asset["name"].(string)
			id, _ := asset["id"].(string)
			owner, _ := asset["owner"].(string)
			results = append(results, MatchResult{
				AssetID:    id,
				AssetName:  name,
				Owner:      owner,
				Distance:   dist,
				Similarity: similarity,
				IsMatch:    true,
			})
		}
	}
	return results
}