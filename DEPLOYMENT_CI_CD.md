# 🚀 CI/CD Pipeline - Quiz Master

Guide complet pour configurer et utiliser la pipeline CI/CD avec GitHub Actions, Docker et Ansible pour déployer sur Digital Ocean avec Digital Ocean Container Registry.

## 📋 Architecture

```
GitHub Repository
      │
      ▼
GitHub Actions (CI/CD)
      │
      ├── Tests & Quality Checks
      ├── Build & Push to DO Registry
      └── Deploy with Ansible
      │
      ▼
Digital Ocean Infrastructure
├── Container Registry (Images)
├── Frontend Server (Nginx + Next.js)
└── Backend Server (Node.js + Socket.IO)
```

## 🛠️ Prérequis

### 1. Infrastructure Digital Ocean

- **Container Registry** créé par Terraform
- **2 Droplets Ubuntu 20.04/22.04**
  - 1 serveur frontend (minimum 1GB RAM)
  - 1 serveur backend (minimum 1GB RAM)
- **Accès SSH configuré** avec clés publiques
- **Accès root** ou utilisateur avec sudo

### 2. Outils locaux

- Docker
- doctl (Digital Ocean CLI)
- Make (optionnel, pour utiliser le Makefile)
- Git
- SSH client

### 3. Comptes et tokens

- Repository GitHub
- Digital Ocean Personal Access Token
- Container Registry créé sur Digital Ocean

## ⚡ Installation rapide

### 1. Configuration des secrets GitHub

Allez dans **Settings > Secrets and variables > Actions** de votre repository et ajoutez :

| Secret               | Description                              | Exemple                                  |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| `SSH_PRIVATE_KEY`    | Clé SSH privée pour accéder aux serveurs | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `FRONTEND_SERVER_IP` | IP du serveur frontend                   | `164.90.225.146`                         |
| `BACKEND_SERVER_IP`  | IP du serveur backend                    | `164.90.225.147`                         |
| `DO_PAT`             | Digital Ocean Personal Access Token      | `dop_v1_...`                             |
| `DO_REGISTRY_NAME`   | Nom du registry DO (créé par Terraform)  | `quiz-master-registry`                   |

### 2. Configuration des variables d'environnement locales

```bash
# Copier le fichier d'exemple
cp ansible/config.yml.example ansible/config.yml

# Éditer avec vos valeurs
nano ansible/config.yml
```

Ou utiliser les variables d'environnement :

```bash
export FRONTEND_SERVER_IP="164.90.225.146"
export BACKEND_SERVER_IP="164.90.225.147"
export DO_PAT="dop_v1_your_digital_ocean_token"
export DO_REGISTRY_NAME="quiz-master-registry"
```

### 3. Installation de doctl

```bash
# Linux/macOS
curl -OL https://github.com/digitalocean/doctl/releases/latest/download/doctl-*-linux-amd64.tar.gz
tar xf doctl-*-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Ou via Homebrew (macOS)
brew install doctl

# Ou via Snap (Linux)
sudo snap install doctl
```

### 4. Premier déploiement

```bash
# 1. Authentification Digital Ocean
doctl auth init

# 2. Setup initial des serveurs (une seule fois)
make setup

# 3. Déployer l'application
make deploy

# 4. Vérifier le déploiement
make verify
```

## 🔧 Configuration détaillée

### Variables d'environnement requises

```bash
# Serveurs
FRONTEND_SERVER_IP="164.90.225.146"
BACKEND_SERVER_IP="164.90.225.147"

# Digital Ocean
DO_PAT="dop_v1_your_token"
DO_REGISTRY_NAME="quiz-master-registry"  # Nom créé par Terraform

# Images Docker (automatiquement générées)
REGISTRY="registry.digitalocean.com"
FRONTEND_IMAGE="registry.digitalocean.com/quiz-master-registry/quiz-master-frontend:latest"
BACKEND_IMAGE="registry.digitalocean.com/quiz-master-registry/quiz-master-backend:latest"
```

### Configuration GitHub Actions

Le workflow utilise maintenant :

- **doctl** pour s'authentifier avec Digital Ocean
- **Digital Ocean Container Registry** au lieu de GitHub Container Registry
- **Variables d'environnement** pour le nom du registry

### Structure des fichiers

```
.
├── .github/workflows/ci-cd.yml       # Pipeline avec DO Registry
├── ansible/
│   ├── templates/
│   │   ├── docker-compose.frontend.yml.j2
│   │   ├── docker-compose.backend.yml.j2
│   │   └── nginx.conf.j2
│   ├── deploy.yml                    # Déploiement avec doctl
│   └── setup.yml                     # Setup serveurs
├── scripts/
│   ├── deploy-manual.sh              # Script avec DO Registry
│   └── check-setup.sh                # Vérification avec doctl
└── Makefile                          # Commandes DO Registry
```

## 🚀 Utilisation

### GitHub Actions (Automatique)

La pipeline se déclenche automatiquement et :

1. **Tests** : lint, type-check, build
2. **Build** : construction et push vers DO Registry
3. **Deploy** : déploiement avec Ansible + doctl

### Déploiement manuel

#### Avec Make (recommandé)

```bash
# Voir toutes les commandes
make help

# Vérifier la configuration
make deploy-check

# Déploiement complet
make deploy-all

# Construire et pousser vers DO Registry
make push
```

#### Avec le script manuel

```bash
# Déploiement complet
./scripts/deploy-manual.sh

# Vérifier la configuration
./scripts/check-setup.sh
```

## 🔍 Vérification

### Images dans le registry

```bash
# Lister les images
doctl registry repository list

# Voir les détails d'une image
doctl registry repository list-tags quiz-master-frontend
doctl registry repository list-tags quiz-master-backend
```

### Health checks

```bash
# Frontend
curl http://$FRONTEND_SERVER_IP

# Backend
curl http://$BACKEND_SERVER_IP:8003/api/health
```

## 📊 URLs de l'application

Après déploiement :

- **Application** : `http://FRONTEND_SERVER_IP`
- **API Backend** : `http://BACKEND_SERVER_IP:8003`
- **Health Check** : `http://BACKEND_SERVER_IP:8003/api/health`

## 🔧 Personnalisation

### Registry personnalisé

Si vous utilisez un nom de registry différent :

```bash
export DO_REGISTRY_NAME="your-custom-registry-name"
```

### Images avec tags

Pour utiliser des tags spécifiques :

```bash
# Dans le workflow GitHub Actions
FRONTEND_IMAGE="registry.digitalocean.com/your-registry/quiz-master-frontend:v1.0.0"
BACKEND_IMAGE="registry.digitalocean.com/your-registry/quiz-master-backend:v1.0.0"
```

## 🐛 Dépannage

### Problèmes courants

#### 1. Erreur d'authentification DO Registry

```bash
# Vérifier l'authentification
doctl auth list

# Se reconnecter
doctl auth init --access-token YOUR_TOKEN
doctl registry login
```

#### 2. Registry non trouvé

```bash
# Vérifier le nom du registry
doctl registry list

# Vérifier les repositories
doctl registry repository list
```

#### 3. Images non trouvées

```bash
# Vérifier les images
doctl registry repository list-tags quiz-master-frontend
doctl registry repository list-tags quiz-master-backend

# Rebuild et push
make push
```

## 💰 Coûts Digital Ocean

- **Container Registry** : 5$/mois pour 5GB stockage
- **Droplets** : À partir de 5$/mois par serveur
- **Bande passante** : 1TB inclus par droplet

## 🔒 Sécurité

### Bonnes pratiques

- ✅ **Registry privé** Digital Ocean
- ✅ **Tokens avec permissions limitées**
- ✅ **Images scannées** pour les vulnérabilités
- ✅ **Secrets GitHub** pour les tokens

### Nettoyage du registry

```bash
# Supprimer les anciennes images
doctl registry garbage-collection start --include-untagged-manifests

# Voir l'utilisation
doctl registry options
```

---

**🎉 Votre CI/CD est maintenant configurée avec Digital Ocean !**

Pour déployer, il suffit de push sur `main` ou d'utiliser les commandes Make avec vos variables d'environnement Digital Ocean.
