package client

import (
	"GO-API-REST/linalg"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type MatrixStats struct {
	Max        float64 `json:"max"`
	Min        float64 `json:"min"`
	Average    float64 `json:"average"`
	Sum        float64 `json:"sum"`
	IsDiagonal bool    `json:"isDiagonal"`
}

type StatsRequest struct {
	Q linalg.Matrix `json:"q"`
	R linalg.Matrix `json:"r"`
}

type StatsResponse struct {
	Q            MatrixStats `json:"q"`
	R            MatrixStats `json:"r"`
	Combined     MatrixStats `json:"combined"`
	AnyDiagonal  bool        `json:"anyDiagonal"`
	ComputedAtMs int64       `json:"computedAtMs"`
}

type StatsClient struct {
	baseURL    string
	httpClient *http.Client
	/* authToken  string  */
}

func NewStatsClient(baseURL string) *StatsClient {
	return &StatsClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
		/* authToken: authToken, */
	}
}

func (s *StatsClient) FetchStats(ctx context.Context, q, r linalg.Matrix) (*StatsResponse, error) {
	body, err := json.Marshal(StatsRequest{Q: q, R: r})
	if err != nil {
		return nil, fmt.Errorf("error serializando payload para node-api: %w", err)
	}

	url := s.baseURL + "/api/stats"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("error creando request hacia node-api: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	/* if s.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.authToken)
	}  */

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error de red llamando a node-api (%s): %w", url, err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error leyendo respuesta de node-api: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("node-api respondió %d: %s", resp.StatusCode, string(respBody))
	}

	var stats StatsResponse
	if err := json.Unmarshal(respBody, &stats); err != nil {
		return nil, fmt.Errorf("error parseando respuesta de node-api: %w", err)
	}

	return &stats, nil
}