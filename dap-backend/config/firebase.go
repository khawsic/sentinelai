package config

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var ProjectID string
var FirestoreBase string
var httpClient = &http.Client{Timeout: 10 * time.Second}

func InitFirebase() {
	ProjectID = os.Getenv("GOOGLE_CLOUD_PROJECT")
	FirestoreBase = fmt.Sprintf(
		"https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents",
		ProjectID,
	)
}

func FirestoreSet(collection, docID string, data map[string]interface{}) error {
	fields := toFirestoreFields(data)
	body, _ := json.Marshal(map[string]interface{}{"fields": fields})

	url := fmt.Sprintf("%s/%s/%s?key=%s", FirestoreBase, collection, docID, os.Getenv("FIREBASE_API_KEY"))
	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("firestore error %d: %s", resp.StatusCode, string(b))
	}
	return nil
}

func FirestoreGet(collection, docID string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/%s/%s?key=%s", FirestoreBase, collection, docID, os.Getenv("FIREBASE_API_KEY"))
	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == 404 {
		return nil, fmt.Errorf("document not found")
	}
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fields := fromFirestoreFields(result)
	return fields, nil
}

func FirestoreList(collection string) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/%s?key=%s", FirestoreBase, collection, os.Getenv("FIREBASE_API_KEY"))
	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var result struct {
		Documents []struct {
			Fields map[string]interface{} `json:"fields"`
		} `json:"documents"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	var out []map[string]interface{}
	for _, doc := range result.Documents {
		out = append(out, fromFirestoreFields(map[string]interface{}{"fields": doc.Fields}))
	}
	return out, nil
}

func FirestoreUpdate(collection, docID, field, value string) error {
	fields := map[string]interface{}{
		field: map[string]interface{}{"stringValue": value},
	}
	body, _ := json.Marshal(map[string]interface{}{"fields": fields})
	url := fmt.Sprintf("%s/%s/%s?updateMask.fieldPaths=%s&key=%s",
		FirestoreBase, collection, docID, field, os.Getenv("FIREBASE_API_KEY"))
	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func toFirestoreFields(data map[string]interface{}) map[string]interface{} {
	fields := make(map[string]interface{})
	for k, v := range data {
		switch val := v.(type) {
		case string:
			fields[k] = map[string]interface{}{"stringValue": val}
		case int:
			fields[k] = map[string]interface{}{"integerValue": fmt.Sprintf("%d", val)}
		case float64:
			fields[k] = map[string]interface{}{"doubleValue": val}
		case bool:
			fields[k] = map[string]interface{}{"booleanValue": val}
		case []string:
			arr := make([]interface{}, len(val))
			for i, s := range val {
				arr[i] = map[string]interface{}{"stringValue": s}
			}
			fields[k] = map[string]interface{}{"arrayValue": map[string]interface{}{"values": arr}}
		default:
			fields[k] = map[string]interface{}{"stringValue": fmt.Sprintf("%v", val)}
		}
	}
	return fields
}

func FirestoreDelete(collection, docID string) error {
	url := fmt.Sprintf("%s/%s/%s?key=%s",
		FirestoreBase, collection, docID, os.Getenv("FIREBASE_API_KEY"))
	req, _ := http.NewRequest("DELETE", url, nil)
	resp, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func fromFirestoreFields(doc map[string]interface{}) map[string]interface{} {
	raw, ok := doc["fields"]
	if !ok {
		return map[string]interface{}{}
	}
	fieldsMap, ok := raw.(map[string]interface{})
	if !ok {
		return map[string]interface{}{}
	}
	out := make(map[string]interface{})
	for k, v := range fieldsMap {
		vMap, ok := v.(map[string]interface{})
		if !ok {
			continue
		}
		if s, ok := vMap["stringValue"]; ok {
			out[k] = s
		} else if i, ok := vMap["integerValue"]; ok {
			out[k] = i
		} else if d, ok := vMap["doubleValue"]; ok {
			out[k] = d
		} else if b, ok := vMap["booleanValue"]; ok {
			out[k] = b
		} else if a, ok := vMap["arrayValue"]; ok {
			aMap := a.(map[string]interface{})
			if vals, ok := aMap["values"].([]interface{}); ok {
				var arr []string
				for _, val := range vals {
					if m, ok := val.(map[string]interface{}); ok {
						if s, ok := m["stringValue"].(string); ok {
							arr = append(arr, s)
						}
					}
				}
				out[k] = arr
			}
		}
	}
	return out
}