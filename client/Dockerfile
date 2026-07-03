
# --- Etapa 1: build ---
FROM node:20-alpine AS builder
 
WORKDIR /app
 
COPY package*.json ./
RUN npm ci
 
COPY . .
 
ARG VITE_QR_API_URL
ENV VITE_QR_API_URL=$VITE_QR_API_URL
 
RUN npm run build
 
# --- Etapa 2: producción (nginx sirviendo los estáticos) ---
FROM nginx:1.27-alpine
 
COPY --from=builder /app/dist /usr/share/nginx/html
 
EXPOSE 80
 
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1
 
CMD ["nginx", "-g", "daemon off;"]