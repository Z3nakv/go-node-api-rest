# --- Etapa 1: build ---
FROM golang:1.26.4-alpine AS builder

WORKDIR /app

# Copiamos primero sólo los manifiestos para aprovechar el cache de capas
# de Docker: si las dependencias no cambian, no se vuelven a descargar.
COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /qr-api .

# --- Etapa 2: imagen final ---
FROM alpine:3.20

RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /qr-api .

EXPOSE 8080

# Healthcheck básico para orquestadores (docker-compose, k8s, etc).
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

ENTRYPOINT ["/app/qr-api"]
