package linalg

import (
	"errors"
	"math"
)

type Matrix [][]float64

var (
	ErrEmptyMatrix = errors.New("la matriz no puede estar vacía")
	ErrJaggedMatrix = errors.New("todas las filas de la matriz deben tener la misma longitud")
	ErrNotEnoughRows = errors.New("la factorización QR requiere que el número de filas (m) sea mayor o igual al número de columnas (n)")
)

func Dims(a Matrix) (int, int, error) {
	m := len(a)
	if m == 0 {
		return 0, 0, ErrEmptyMatrix
	}
	n := len(a[0])
	if n == 0 {
		return 0, 0, ErrEmptyMatrix
	}
	for _, row := range a {
		if len(row) != n {
			return 0, 0, ErrJaggedMatrix
		}
	}
	return m, n, nil
}

func cloneMatrix(a Matrix) Matrix {
	out := make(Matrix, len(a))
	for i, row := range a {
		out[i] = make([]float64, len(row))
		copy(out[i], row)
	}
	return out
}

func identity(n int) Matrix {
	out := make(Matrix, n)
	for i := range out {
		out[i] = make([]float64, n)
		out[i][i] = 1
	}
	return out
}

func QRDecompose(a Matrix) (q Matrix, r Matrix, err error) {
	m, n, err := Dims(a)
	if err != nil {
		return nil, nil, err
	}
	if m < n {
		return nil, nil, ErrNotEnoughRows
	}

	r = cloneMatrix(a)
	q = identity(m)

	k := n
	if m == n {
		// Para matriz cuadrada, la última columna no necesita reflexión.
		k = n - 1
	}

	for col := 0; col < k; col++ {
		// 1. Extraer el vector x = R[col:m, col]
		x := make([]float64, m-col)
		for i := range x {
			x[i] = r[col+i][col]
		}

		// 2. Calcular alpha con el signo opuesto al de x[0] para evitar
		// cancelación catastrófica (estabilidad numérica estándar).
		normX := norm(x)
		if normX == 0 {
			continue // columna ya nula bajo la diagonal, no hace falta reflejar
		}
		alpha := -math.Copysign(normX, x[0])

		// 3. Construir el vector de Householder v = x - alpha*e1, normalizado
		v := make([]float64, len(x))
		copy(v, x)
		v[0] -= alpha
		normV := norm(v)
		if normV == 0 {
			continue
		}
		for i := range v {
			v[i] /= normV
		}

		// 4. Aplicar la reflexión H = I - 2vv^T al bloque R[col:, col:]
		applyHouseholderLeft(r, v, col)

		// 5. Acumular Q = Q * H_col (H es simétrica y ortogonal, H^T = H)
		applyHouseholderRight(q, v, col)
	}

	// Limpieza numérica: valores extremadamente pequeños por error de punto
	// flotante se llevan a 0 para que la salida sea legible y estable.
	cleanupNearZero(r)
	cleanupNearZero(q)

	return q, r, nil
}

func norm(v []float64) float64 {
	sum := 0.0
	for _, val := range v {
		sum += val * val
	}
	return math.Sqrt(sum)
}

func applyHouseholderLeft(r Matrix, v []float64, offset int) {
	m := len(r)
	n := len(r[0])
	for j := offset; j < n; j++ {
		// dot = v^T * R[:,j] (submatriz)
		dot := 0.0
		for i := 0; i < len(v); i++ {
			dot += v[i] * r[offset+i][j]
		}
		for i := 0; i < len(v); i++ {
			r[offset+i][j] -= 2 * v[i] * dot
		}
	}
	_ = m
}

func applyHouseholderRight(q Matrix, v []float64, offset int) {
	m := len(q)
	for i := 0; i < m; i++ {
		dot := 0.0
		for j := 0; j < len(v); j++ {
			dot += q[i][offset+j] * v[j]
		}
		for j := 0; j < len(v); j++ {
			q[i][offset+j] -= 2 * dot * v[j]
		}
	}
}

func cleanupNearZero(a Matrix) {
	const eps = 1e-10
	for i := range a {
		for j := range a[i] {
			if math.Abs(a[i][j]) < eps {
				a[i][j] = 0
			}
		}
	}
}