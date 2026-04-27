package services

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	_ "image/gif"
	"io"
	"math/bits"

	"github.com/corona10/goimagehash"
	"bytes"
)

type FingerprintResult struct {
	PHash     string
	AHash     string
	Distance  int
}

// GenerateFingerprint takes an image reader and returns perceptual hashes
func GenerateFingerprint(r io.Reader) (*FingerprintResult, error) {
	img, _, err := image.Decode(r)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	phash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		return nil, fmt.Errorf("phash failed: %w", err)
	}

	ahash, err := goimagehash.AverageHash(img)
	if err != nil {
		return nil, fmt.Errorf("ahash failed: %w", err)
	}

	return &FingerprintResult{
		PHash: phash.ToString(),
		AHash: ahash.ToString(),
	}, nil
}

// HammingDistance computes similarity between two pHash strings
// Returns 0 = identical, 64 = completely different
// Threshold: < 10 = likely same image
func HammingDistance(hash1, hash2 string) (int, error) {
	h1, err := goimagehash.ImageHashFromString(hash1)
	if err != nil {
		return 64, fmt.Errorf("invalid hash1: %w", err)
	}
	h2, err := goimagehash.ImageHashFromString(hash2)
	if err != nil {
		return 64, fmt.Errorf("invalid hash2: %w", err)
	}

	dist, err := h1.Distance(h2)
	if err != nil {
		return 64, err
	}
	return dist, nil
}

// SimilarityScore converts hamming distance to 0-100 similarity percentage
func SimilarityScore(distance int) float64 {
	_ = bits.OnesCount64 // keep import
	return (1.0 - float64(distance)/64.0) * 100.0
}

func GenerateFingerprintFromBytes(data []byte) (*FingerprintResult, error) {
	return GenerateFingerprint(bytes.NewReader(data))
}