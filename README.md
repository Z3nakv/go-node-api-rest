# go-node-api-rest

Prueba técnica: sistema de dos APIs REST orquestadas con Docker Compose que calculan la factorización QR de una matriz y estadísticas sobre los resultados, con un frontend simple para probarlo.

## Arquitectura

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  frontend   │──────▶│   qr-api    │──────▶│  stats-api  │
│ (nginx)     │ :8081 │ (Go/Fiber)  │ :8080 │(Node/Express)│ :3000
└─────────────┘       └─────────────┘       └─────────────┘
                              │                     │
                              └────── qr-stats-net ─┘
                                (red interna Docker)
```

- **`qr-api`** (Go + Fiber): recibe una matriz, calcula su factorización QR (matrices Q y R), y envía el resultado a `stats-api` para calcular estadísticas sobre ellas.
- **`stats-api`** (Node + Express + TypeScript): recibe las matrices Q y R y calcula estadísticas sobre ellas.
- **`frontend`** (nginx sirviendo HTML estático): interfaz simple para ingresar una matriz y ver el resultado.

Los tres servicios corren en contenedores separados, conectados por una red interna de Docker (`qr-stats-net`). `qr-api` le habla a `stats-api` usando el nombre del servicio como hostname (`http://stats-api:3000`), sin necesidad de exponer ese puerto públicamente para la comunicación entre servicios.

## Stack técnico

| Servicio | Lenguaje / Framework | Puerto |
|---|---|---|
| qr-api | Go 1.26 / Fiber | 8080 |
| stats-api | Node 20 / Express / TypeScript | 3000 |
| frontend | nginx (Alpine) | 8081 → 80 |

Ambos backends usan **Dockerfiles multi-stage** para mantener las imágenes finales livianas (sin herramientas de build ni dependencias de desarrollo en la imagen de producción), sobre base **Alpine Linux**.

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose (incluido en Docker Desktop)

## Cómo levantar el proyecto

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd go-node-api-rest
   ```

2. Crea tu archivo `.env` en la raíz a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   Y completa `JWT_SECRET` con un valor propio.

3. Levanta todo el stack:
   ```bash
   docker compose up --build
   ```

4. Espera a que los tres servicios estén corriendo (verás `Server is running on port 3000` y el banner de Fiber en los logs). Docker Compose espera automáticamente a que `stats-api` esté saludable antes de arrancar `qr-api`.

5. Abre la app en el navegador:
   ```
   http://localhost:8081
   ```

## Endpoints

| Método | Ruta | Servicio | Descripción |
|---|---|---|---|
| GET | `/health` | qr-api, stats-api | Healthcheck |
| POST | `/api/matrix/qr` | qr-api | Recibe una matriz, calcula factorización QR y estadísticas |

Ejemplo de petición:

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

# Probar desde cero, simulando un entorno limpio
docker compose down -v
docker compose up --build
```

## Variables de entorno

Ver `.env.example`. Ninguna variable sensible se versiona en el repositorio; `.env` está excluido vía `.gitignore`.

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto usado para firmar/verificar JWT |
| `PORT` | Puerto interno de cada servicio (definido por servicio en `docker-compose.yml`) |
| `NODE_API_URL` | URL interna que usa `qr-api` para llamar a `stats-api` |

## Decisiones de diseño

- **Multi-stage builds** en ambos backends para separar la etapa de compilación de la imagen final de producción, reduciendo tamaño y superficie de ataque.
- **Alpine Linux** como base por su tamaño reducido; en el caso de `qr-api`, el binario de Go se compila estáticamente (`CGO_ENABLED=0`) para evitar problemas de compatibilidad con `musl libc`.
- **Healthchecks** en ambos backends (`wget` sobre `/health`), usados por Docker Compose para asegurar que `stats-api` esté listo antes de levantar `qr-api` (`depends_on: condition: service_healthy`), evitando errores de conexión al arrancar.
- **Red interna dedicada** (`qr-stats-net`) para que `qr-api` y `stats-api` se comuniquen por nombre de servicio, sin exponer `stats-api` innecesariamente fuera del stack.