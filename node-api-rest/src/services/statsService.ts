

function assertValidMatrix(matrix: number[][]): void {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('La matriz debe ser un array de arrays no vacío');
  }
  const cols = matrix[0].length;
  if (cols === 0) {
    throw new Error('Las filas de la matriz no pueden estar vacías');
  }
  for (const row of matrix) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error('Todas las filas de la matriz deben tener la misma longitud (matriz rectangular)');
    }
    for (const value of row) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error('Todos los valores de la matriz deben ser números');
      }
    }
  }
}

function isDiagonalMatrix(matrix: number[][], epsilon: number = 1e-9): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;
  if (rows !== cols) return false; 

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > epsilon) {
        return false;
      }
    }
  }
  return true;
}

function computeMatrixStats(matrix: number[][]): any {
  assertValidMatrix(matrix);

  let max = -Infinity;
  let min = Infinity;
  let sum = 0;
  let count = 0;

  for (const row of matrix) {
    for (const value of row) {
      if (value > max) max = value;
      if (value < min) min = value;
      sum += value;
      count += 1;
    }
  }

  return {
    max,
    min,
    average: sum / count,
    sum,
    isDiagonal: isDiagonalMatrix(matrix),
  };
}

function computeCombinedStats(matrices: number[][][]): any {
  let max = -Infinity;
  let min = Infinity;
  let sum = 0;
  let count = 0;

  for (const matrix of matrices) {
    for (const row of matrix) {
      for (const value of row) {
        if (value > max) max = value;
        if (value < min) min = value;
        sum += value;
        count += 1;
      }
    }
  }

  return {
    max,
    min,
    average: count > 0 ? sum / count : 0,
    sum,
    isDiagonal: false,
  };
}

function computeStatsReport({ q, r }: { q: number[][]; r: number[][] }): any {
  const qStats = computeMatrixStats(q);
  const rStats = computeMatrixStats(r);
  const combined = computeCombinedStats([q, r]);

  return {
    q: qStats,
    r: rStats,
    combined,
    anyDiagonal: qStats.isDiagonal || rStats.isDiagonal,
    computedAtMs: Date.now(),
  };
}

export {
  assertValidMatrix,
  isDiagonalMatrix,
  computeMatrixStats,
  computeCombinedStats,
  computeStatsReport,
};