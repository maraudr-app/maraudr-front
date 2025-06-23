# 🐳 Guide Docker - Maraudr Frontend

Ce guide vous explique comment lancer l'application Maraudr avec Docker et Docker Compose.

## 📋 Prérequis

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- Git

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd maraudr-front
```

### 2. Configuration des variables d'environnement
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer les variables selon vos besoins
nano .env
```

### 3. Lancement en mode développement
```bash
# Lancer uniquement le frontend + base de données
docker-compose up -d

# Voir les logs
docker-compose logs -f maraudr-frontend
```

L'application sera accessible sur : http://localhost:3000

## 🏗️ Architecture des services

### Services inclus

| Service | Port | Description |
|---------|------|-------------|
| `maraudr-frontend` | 3000 | Application React/Vite |
| `maraudr-database` | 5432 | Base de données PostgreSQL |
| `maraudr-redis` | 6379 | Cache Redis |

### Services backend (à ajouter)

| Service | Port | Description |
|---------|------|-------------|
| `maraudr-backend` | 8082 | API principale (Auth, Users) |
| `maraudr-asso-service` | 8080 | Service des associations |
| `maraudr-stock-service` | 8081 | Service de gestion des stocks |
| `maraudr-geo-service` | 8084 | Service de géolocalisation |

## 🔧 Commandes utiles

### Développement
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs d'un service
docker-compose logs -f maraudr-frontend

# Reconstruire une image
docker-compose build maraudr-frontend

# Accéder au shell d'un container
docker-compose exec maraudr-frontend sh
```

### Production
```bash
# Lancer en mode production
docker-compose -f docker-compose.prod.yml up -d

# Build et push des images
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push
```

### Maintenance
```bash
# Nettoyer les volumes
docker-compose down -v

# Nettoyer les images inutilisées
docker system prune -a

# Voir l'état des services
docker-compose ps

# Redémarrer un service
docker-compose restart maraudr-frontend
```

## 📁 Structure des fichiers Docker

```
maraudr-front/
├── Dockerfile                 # Image multi-stage (dev/prod)
├── docker-compose.yml         # Configuration développement
├── docker-compose.prod.yml    # Configuration production
├── nginx.conf                 # Configuration Nginx
├── .dockerignore              # Fichiers à ignorer
└── env.example                # Variables d'environnement
```

## 🔐 Configuration des services backend

Pour utiliser les services backend, vous devez :

1. **Construire les images backend** :
```bash
# Exemple pour le service principal
docker build -t maraudr/backend:latest ./path/to/backend
docker build -t maraudr/asso-service:latest ./path/to/asso-service
docker build -t maraudr/stock-service:latest ./path/to/stock-service
docker build -t maraudr/geo-service:latest ./path/to/geo-service
```

2. **Modifier le docker-compose** :
```yaml
# Décommenter les services backend dans docker-compose.yml
```

3. **Ajuster les variables d'environnement** :
```bash
# Dans .env
VITE_API_URL=http://maraudr-backend:8082
VITE_ASSO_API_URL=http://maraudr-asso-service:8080
# etc...
```

## 🌐 Accès aux services

| Service | URL de développement | URL de production |
|---------|---------------------|-------------------|
| Frontend | http://localhost:3000 | http://localhost:80 |
| PostgreSQL | localhost:5432 | - |
| Redis | localhost:6379 | - |
| Backend API | localhost:8082 | - |
| Service Associations | localhost:8080 | - |
| Service Stocks | localhost:8081 | - |
| Service Géo | localhost:8084 | - |

## 🐛 Dépannage

### Problèmes courants

**Port déjà utilisé** :
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000

# Changer le port dans docker-compose.yml
ports:
  - "3001:3000"  # Utiliser 3001 au lieu de 3000
```

**Problème de permissions** :
```bash
# Donner les bonnes permissions
sudo chown -R $USER:$USER .
```

**Cache npm corrompu** :
```bash
# Reconstruire sans cache
docker-compose build --no-cache maraudr-frontend
```

**Base de données non accessible** :
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps maraudr-database

# Accéder à la base
docker-compose exec maraudr-database psql -U maraudr_user -d maraudr_db
```

### Logs utiles
```bash
# Logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs maraudr-frontend

# Suivre les logs en temps réel
docker-compose logs -f --tail=100
```

## 🔧 Variables d'environnement importantes

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NODE_ENV` | Mode d'exécution | `development` |
| `VITE_API_URL` | URL de l'API principale | `http://localhost:8082` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `maraudr_password` |
| `JWT_SECRET` | Clé secrète JWT | À changer en production ! |

## 📦 Déploiement

### Développement local
```bash
docker-compose up -d
```

### Staging/Production
```bash
# Avec variables d'environnement sécurisées
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD
```bash
# Build des images
docker-compose build

# Tests
docker-compose run --rm maraudr-frontend npm test

# Déploiement
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs`
2. Vérifiez l'état des services : `docker-compose ps`
3. Redémarrez les services : `docker-compose restart`
4. Nettoyez et redémarrez : `docker-compose down && docker-compose up -d`

---

**Note** : Ce setup Docker est optimisé pour le développement. Pour la production, assurez-vous de :
- Changer les mots de passe par défaut
- Utiliser des secrets Docker
- Configurer un reverse proxy (Nginx/Traefik)
- Mettre en place la surveillance (logs, métriques) 