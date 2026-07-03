# go-node-api-rest

Sistema de dos APIs REST orquestadas con Docker Compose: cálculo de factorización QR de una matriz y estadísticas sobre los resultados, con un frontend en React.

## Arquitectura

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  frontend   │──────▶│   qr-api    │──────▶│  stats-api  │
│ (React/Vite)│ :8081 │ (Go/Fiber)  │ :8080 │(Node/Express)│ :3000
└─────────────┘       └─────────────┘       └─────────────┘
                              │                     │
                              └────── qr-stats-net ─┘
                                (red interna Docker)
```

- **`qr-api`** (Go + Fiber): recibe una matriz, calcula su factorización QR (matrices Q y R) y envía el resultado a `stats-api`.
- **`stats-api`** (Node + Express + TypeScript): recibe las matrices Q y R y calcula estadísticas sobre ellas.
- **`frontend`** (React + Vite + TypeScript + Tailwind CSS, servido por nginx): interfaz para ingresar una matriz y visualizar la factorización QR y sus estadísticas.

`qr-api` se comunica con `stats-api` usando el nombre del servicio como hostname (`http://stats-api:3000`) a través de la red interna `qr-stats-net`.

## Stack técnico

| Servicio | Lenguaje / Framework | Puerto |
|---|---|---|
| qr-api | Go 1.26 / Fiber | 8080 |
| stats-api | Node 20 / Express / TypeScript | 3000 |
| frontend | React 19 / Vite / TypeScript / Tailwind CSS v4, servido por nginx (Alpine) | 8081 → 80 |

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (incluido en Docker Desktop)

## Levantar el proyecto localmente

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repo>
   cd go-node-api-rest
   ```

2. Crear el archivo `.env` en la raíz a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   Completar `JWT_SECRET` con un valor propio.

3. Levantar el stack:
   ```bash
   docker compose up --build
   ```

4. Abrir en el navegador:
   ```
   http://localhost:8081
   ```

## Desarrollo del frontend fuera de Docker

```bash
cd client
npm install
npm run dev
```

Por defecto apunta a `http://localhost:8080` (variable `VITE_QR_API_URL`). Para otro destino, crear un `.env` dentro de `client/`:

```
VITE_QR_API_URL=http://localhost:8080
```

## Endpoints

| Método | Ruta | Servicio | Descripción |
|---|---|---|---|
| GET | `/health` | qr-api, stats-api | Healthcheck |
| POST | `/api/matrix/qr` | qr-api | Recibe una matriz, calcula factorización QR y estadísticas |

```bash
curl -X POST http://localhost:8080/api/matrix/qr \
  -H "Content-Type: application/json" \
  -d '{"matrix": [[1,2,3],[4,5,6],[7,8,10]]}'
```

## Comandos útiles

```bash
# Levantar todo (con rebuild)
docker compose up --build

# Levantar en background
docker compose up -d

# Ver logs en vivo de servicios específicos
docker compose logs -f qr-api stats-api

# Ver estado de los contenedores
docker compose ps

# Detener y eliminar contenedores + red
docker compose down

# Limpieza completa (incluye imágenes locales)
docker compose down --rmi local -v
```

## Variables de entorno

Ver `.env.example`.

| Variable | Servicio | Descripción |
|---|---|---|
| `JWT_SECRET` | qr-api, stats-api | Secreto usado para firmar/verificar JWT |
| `PORT` | qr-api, stats-api | Puerto interno de cada servicio |
| `NODE_API_URL` | qr-api | URL que usa `qr-api` para llamar a `stats-api` |
| `VITE_QR_API_URL` | frontend | URL de `qr-api` que consume el frontend (build-time) |

## Despliegue en la nube

Cada servicio se despliega de forma independiente en [Render](https://render.com) como Web Services basados en Docker, apuntando al mismo repositorio con distinto Root Directory:

| Servicio | Root Directory |
|---|---|
| stats-api | `node-api-rest` |
| qr-api | `go-api-rest` |
| frontend | `client` |

En producción, `NODE_API_URL` en `qr-api` apunta a la URL pública de `stats-api` en Render.