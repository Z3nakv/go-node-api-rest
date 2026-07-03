import { useState } from "react";
import { MatrixGrid } from "./MatrixGrid";
import { EquationDisplay } from "./EquationDisplay";
import { StatCard } from "./StatCard";
import { useMatrixGrid } from "./hooks/useMatrixGrid";
import { useQrCompute } from "./hooks/useQRCompute";


const DEFAULT_API_URL = import.meta.env.VITE_QR_API_URL ?? 'http://localhost:8080';
 
function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [token, setToken] = useState('');
 
  const { rows, cols, values, addRow, removeRow, addCol, removeCol, setCell, loadSample } =
    useMatrixGrid();
  const { compute, isLoading, error, data } = useQrCompute();
 
  const handleCompute = () => compute({ apiUrl, token, matrix: values });
 
  return (
    <div className="min-h-screen bg-bg px-6 py-12 text-text sm:px-8 sm:py-16">
      <div className="mx-auto max-w-245">
        <header className="mb-10">
          <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent">
            qr-api · stats-api
          </div>
          <h1 className="mb-2 text-[32px] font-semibold tracking-tight">
            Factorización QR &amp; estadísticas
          </h1>
          <p className="max-w-140 text-[15px] leading-relaxed text-muted">
            Ingresá una matriz, la API en Go calcula su factorización QR (A = Q·R) y se
            la envía a la API en Node.js, que devuelve estadísticas sobre los resultados.
          </p>
        </header>
 
        <section className="mb-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Configuración de las APIs
          </h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="min-w-55 flex-1">
              <label htmlFor="apiUrl" className="mb-1.5 block text-[11px] uppercase tracking-wider text-muted">
                URL de qr-api
              </label>
              <input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2 px-2.5 py-2 font-mono text-[13px] text-text"
              />
            </div>
            <div className="min-w-55 flex-1">
              <label htmlFor="tokenInput" className="mb-1.5 block text-[11px] uppercase tracking-wider text-muted">
                Token JWT (opcional)
              </label>
              <input
                id="tokenInput"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="dejar vacío si JWT_SECRET no está configurado"
                className="w-full rounded-lg border border-line bg-surface-2 px-2.5 py-2 font-mono text-[13px] text-text"
              />
            </div>
          </div>
        </section>
 
        <section className="mb-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Matriz de entrada (A)
          </h2>
          <div className="mb-4 flex flex-wrap gap-2.5">
            <button onClick={addRow} className="btn">+ fila</button>
            <button onClick={removeRow} className="btn-ghost">− fila</button>
            <button onClick={addCol} className="btn">+ columna</button>
            <button onClick={removeCol} className="btn-ghost">− columna</button>
            <button onClick={loadSample} className="btn-ghost">Cargar ejemplo</button>
          </div>
 
          <MatrixGrid rows={rows} cols={cols} values={values} onCellChange={setCell} />
 
          <div className="mt-4.5 flex items-center gap-3">
            <button onClick={handleCompute} disabled={isLoading} className="btn-primary">
              Calcular QR y estadísticas →
            </button>
            {isLoading && (
              <span className="font-mono text-[13px] text-accent">Calculando…</span>
            )}
          </div>
 
          {error && (
            <div className="mt-4 rounded-[10px] border border-[#4A2330] bg-[#241419] px-4 py-3.5 font-mono text-[13px] text-warn">
              ✕ {error}
            </div>
          )}
        </section>
 
        {data && (
          <>
            <section className="mb-5 rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Resultado: A = Q · R
              </h2>
              <EquationDisplay a={values} q={data.q} r={data.r} />
            </section>
 
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Estadísticas (stats-api)
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                <StatCard name="Matriz Q" stats={data.stats.q} />
                <StatCard name="Matriz R" stats={data.stats.r} />
                <StatCard name="Combinado (Q + R)" stats={data.stats.combined} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
 
export default App;

/* function useMatrixGrid(): { rows: any; cols: any; values: any; addRow: any; removeRow: any; addCol: any; removeCol: any; setCell: any; loadSample: any; } {
  throw new Error("Function not implemented.");
} */


/* function useQrCompute(): { compute: any; isLoading: any; error: any; data: any; } {
  throw new Error("Function not implemented.");
}
 */