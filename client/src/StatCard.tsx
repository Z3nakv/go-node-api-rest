import type { MatrixStats } from './types';

interface StatCardProps {
  name: string;
  stats: MatrixStats;
}

export function StatCard({ name, stats }: StatCardProps) {
  const rows: [string, string | number][] = [
    ['Máximo', stats.max],
    ['Mínimo', stats.min],
    ['Promedio', stats.average.toFixed(4)],
    ['Suma total', stats.sum],
  ];

  return (
    <div className="rounded-[10px] border border-line bg-surface-2 p-4">
      <div className="mb-2.5 text-xs uppercase tracking-wider text-muted">{name}</div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-0.75 font-mono text-[13px]">
          <span className="text-muted">{label}</span>
          <span>{value}</span>
        </div>
      ))}
      {stats.isDiagonal !== undefined && (
        <div className="flex justify-between py-0.75 font-mono text-[13px]">
          <span className="text-muted">¿Es diagonal?</span>
          <span className={stats.isDiagonal ? 'text-accent' : 'text-muted'}>
            {stats.isDiagonal ? 'Sí' : 'No'}
          </span>
        </div>
      )}
    </div>
  );
}