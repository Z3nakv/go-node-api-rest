
import { BracketMatrix } from './BracketMatrix';
import type { Matrix } from './types';

interface EquationDisplayProps {
  a: Matrix;
  q: Matrix;
  r: Matrix;
}

export function EquationDisplay({ a, q, r }: EquationDisplayProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 font-mono">
      <BracketMatrix label="A" matrix={a} />
      <span className="text-xl text-muted">=</span>
      <BracketMatrix label="Q" matrix={q} />
      <span className="text-xl text-muted">×</span>
      <BracketMatrix label="R" matrix={r} />
    </div>
  );
}