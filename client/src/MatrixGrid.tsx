import type { Matrix } from './types';

interface MatrixGridProps {
  rows: number;
  cols: number;
  values: Matrix;
  onCellChange: (row: number, col: number, value: number) => void;
}

export function MatrixGrid({ rows, cols, values, onCellChange }: MatrixGridProps) {
  return (
    <div className="inline-block">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="mb-1.5 flex gap-1.5">
          {Array.from({ length: cols }).map((_, j) => (
            <input
              key={j}
              type="number"
              step="any"
              value={values[i]?.[j] ?? 0}
              onChange={(e) => onCellChange(i, j, parseFloat(e.target.value) || 0)}
              className="h-10 w-16 rounded-md border border-line bg-surface-2 text-center font-mono text-sm text-text focus:border-accent focus:outline-none"
            />
          ))}
        </div>
      ))}
    </div>
  );
}