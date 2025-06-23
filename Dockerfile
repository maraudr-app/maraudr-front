# Dockerfile pour Maraudr Frontend
# Build multi-stage pour optimiser la taille de l'image

# Stage 1: Build de l'application
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --silent

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ARG VITE_API_URL=http://localhost:8082
ARG VITE_ASSO_API_URL=http://localhost:8080
ARG VITE_STOCK_API_URL=http://localhost:8081
ARG VITE_GEO_API_URL=http://localhost:8084

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ASSO_API_URL=$VITE_ASSO_API_URL
ENV VITE_STOCK_API_URL=$VITE_STOCK_API_URL
ENV VITE_GEO_API_URL=$VITE_GEO_API_URL

# Build de l'application
RUN npm run build

# Stage 2: Serveur de production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Serveur de développement
FROM node:20-alpine AS development

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY . .

# Exposer le port de développement
EXPOSE 3000

# Commande pour le développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 