import { useState } from 'react';
import type { Matrix } from '../types';

const DEFAULT_VALUES: Matrix = [
  [12, -51],
  [6, 167],
  [-4, 24],
];

const SAMPLE_VALUES: Matrix = [
  [12, -51, 4],
  [6, 167, -68],
  [-4, 24, -41],
  [1, 1, 1],
];

/**
 * Maneja las dimensiones y valores de la matriz de entrada (A).
 * Misma lógica que el prototipo en HTML: al cambiar filas/columnas,
 * se reconstruye la matriz preservando los valores que ya existían.
 */
export function useMatrixGrid() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [values, setValues] = useState<Matrix>(DEFAULT_VALUES);

  const resize = (nextRows: number, nextCols: number) => {
    const next: Matrix = [];
    for (let i = 0; i < nextRows; i++) {
      next.push([]);
      for (let j = 0; j < nextCols; j++) {
        next[i][j] = values[i]?.[j] ?? 0;
      }
    }
    setRows(nextRows);
    setCols(nextCols);
    setValues(next);
  };

  const addRow = () => resize(rows + 1, cols);
  const removeRow = () => rows > 1 && resize(rows - 1, cols);
  const addCol = () => resize(rows, cols + 1);
  const removeCol = () => cols > 1 && resize(rows, cols - 1);

  const setCell = (row: number, col: number, value: number) => {
    setValues((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = value;
      return next;
    });
  };

  const loadSample = () => {
    setRows(SAMPLE_VALUES.length);
    setCols(SAMPLE_VALUES[0].length);
    setValues(SAMPLE_VALUES);
  };

  return { rows, cols, values, addRow, removeRow, addCol, removeCol, setCell, loadSample };
}