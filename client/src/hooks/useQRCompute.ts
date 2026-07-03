import { useState } from 'react';
import type { Matrix, QrApiResponse, QrApiError } from '../types';

interface ComputeParams {
  apiUrl: string;
  token: string;
  matrix: Matrix;
}

/**
 * Llama a POST /api/matrix/qr en qr-api.
 * Mantiene loading/error/data como estado local, sin librerías extra,
 * ya que esta pantalla no necesita cache ni revalidación (no es un
 * recurso que cambie fuera de esta acción del usuario).
 */
export function useQrCompute() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QrApiResponse | null>(null);

  const compute = async ({ apiUrl, token, matrix }: ComputeParams) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/matrix/qr`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ matrix }),
      });

      const body: QrApiResponse & QrApiError = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? `La API respondió con status ${res.status}`);
      }

      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al calcular');
    } finally {
      setIsLoading(false);
    }
  };

  return { compute, isLoading, error, data };
}