import type { Matrix } from "../types";


interface BracketMatrixProps {
  label: string;
  matrix: Matrix;
}

export function BracketMatrix({ label, matrix }: BracketMatrixProps) {
  const numCols = matrix[0]?.length ?? 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="flex border-l-2 border-r-2 border-accent-dim px-2.5 py-1.5">
        {Array.from({ length: numCols }).map((_, j) => (
          <div key={j} className="flex flex-col gap-1.5 not-first:ml-3.5">
            {matrix.map((row, i) => (
              <div key={i} className="min-w-12 text-right font-mono text-[13px]">
                {row[j].toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}