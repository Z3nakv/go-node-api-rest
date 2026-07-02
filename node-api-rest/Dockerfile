
FROM node:20-alpine

WORKDIR /app

# Copiar package files primero (mejor cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Puerto de la API
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Ejecutar build compilado
CMD ["node", "dist/index.js"]

