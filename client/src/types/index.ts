export type Matrix = number[][];

export interface MatrixStats {
  max: number;
  min: number;
  average: number;
  sum: number;
  isDiagonal?: boolean;
}

export interface StatsResponse {
  q: MatrixStats;
  r: MatrixStats;
  combined: MatrixStats;
}

export interface QrApiResponse {
  q: Matrix;
  r: Matrix;
  stats: StatsResponse;
}

export interface QrApiError {
  error?: string;
}