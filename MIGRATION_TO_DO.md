# 🔄 Migration vers Digital Ocean Container Registry

Ce document détaille les changements effectués pour migrer de GitHub Container Registry vers Digital Ocean Container Registry.

## 🎯 Changements principaux

### 1. Variables d'environnement

**Avant (GitHub Container Registry):**

```bash
GITHUB_TOKEN="ghp_your_token"
GITHUB_ACTOR="your-username"
REGISTRY="ghcr.io"
```

**Après (Digital Ocean Container Registry):**

```bash
DO_PAT="dop_v1_your_token"
DO_REGISTRY_NAME="quiz-master-registry"  # Nom créé par Terraform
REGISTRY="registry.digitalocean.com"
```

### 2. GitHub Secrets

**Supprimés :**

- `GITHUB_TOKEN` (était automatique)

**Ajoutés :**

- `DO_PAT` : Digital Ocean Personal Access Token
- `DO_REGISTRY_NAME` : Nom du registry créé par Terraform

**Conservés :**

- `SSH_PRIVATE_KEY` : Clé SSH pour les serveurs
- `FRONTEND_SERVER_IP` : IP du serveur frontend
- `BACKEND_SERVER_IP` : IP du serveur backend

### 3. Images Docker

**Avant :**

```
ghcr.io/username/repository-frontend:latest
ghcr.io/username/repository-backend:latest
```

**Après :**

```
registry.digitalocean.com/quiz-master-registry/quiz-master-frontend:latest
registry.digitalocean.com/quiz-master-registry/quiz-master-backend:latest
```

## 📂 Fichiers modifiés

### 1. GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

**Changements :**

- Utilisation de `doctl` au lieu de `docker login`
- Variables d'environnement DO au lieu de GitHub
- Authentification avec `DO_PAT`

```yaml
# Avant
- name: 🔐 Login to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

# Après
- name: 🔐 Install doctl
  uses: digitalocean/action-doctl@v2
  with:
    token: ${{ secrets.DO_PAT }}

- name: 🔐 Login to Digital Ocean Container Registry
  run: doctl registry login
```

### 2. Ansible Deploy (`ansible/deploy.yml`)

**Changements :**

- Installation et utilisation de `doctl` sur les serveurs
- Variables d'environnement DO
- Authentification avec le token DO

```yaml
# Avant
- name: 🔐 Login to Container Registry
  docker_login:
    registry: "{{ registry }}"
    username: "{{ github_actor }}"
    password: "{{ github_token }}"

# Après
- name: 🔐 Install doctl
  get_url:
    url: "https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz"
    dest: "/tmp/doctl.tar.gz"

- name: 🔐 Login to Digital Ocean Container Registry
  shell: |
    echo "{{ do_pat }}" | /usr/local/bin/doctl auth init --access-token -
    /usr/local/bin/doctl registry login
```

### 3. Templates Docker Compose

**Changements :**

- Utilisation des nouvelles variables d'image
- Correction des noms de réseaux
- Simplification des logs

### 4. Script de déploiement manuel (`scripts/deploy-manual.sh`)

**Changements :**

- Vérification de `doctl` au lieu de GitHub CLI
- Variables d'environnement DO
- Authentification avec `doctl auth init`

### 5. Makefile

**Changements :**

- Variables pour DO Registry
- Commandes `doctl` pour l'authentification
- Vérifications des prérequis DO

### 6. Script de vérification (`scripts/check-setup.sh`)

**Changements :**

- Vérification de `doctl` au lieu de GitHub CLI
- Variables d'environnement DO
- Tests de connectivité DO

## 🔧 Actions requises

### 1. Installation de doctl

```bash
# Linux/macOS
curl -OL https://github.com/digitalocean/doctl/releases/latest/download/doctl-*-linux-amd64.tar.gz
tar xf doctl-*-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Ou via Homebrew (macOS)
brew install doctl
```

### 2. Configuration GitHub Secrets

Ajouter dans GitHub repository secrets :

```
DO_PAT=dop_v1_your_digital_ocean_token
DO_REGISTRY_NAME=quiz-master-registry
```

### 3. Variables d'environnement locales

```bash
# Remplacer
export GITHUB_TOKEN="ghp_old_token"
export GITHUB_ACTOR="username"

# Par
export DO_PAT="dop_v1_your_token"
export DO_REGISTRY_NAME="quiz-master-registry"
```

### 4. Authentification initiale

```bash
# Se connecter à DO
doctl auth init --access-token $DO_PAT

# Tester la connexion
doctl registry list
```

## ✅ Vérification

### 1. Vérifier les images dans le registry

```bash
# Lister les repositories
doctl registry repository list

# Vérifier les tags
doctl registry repository list-tags quiz-master-frontend
doctl registry repository list-tags quiz-master-backend
```

### 2. Tester le déploiement

```bash
# Vérifier la configuration
./scripts/check-setup.sh

# Tester le build
make build

# Tester le push
make push
```

## 💡 Avantages de Digital Ocean Container Registry

1. **Intégration native** avec l'infrastructure DO
2. **Coût prévisible** : 5$/mois pour 5GB
3. **Scan de vulnérabilités** intégré
4. **Géolocalisation** des images
5. **Nettoyage automatique** des anciennes images

## 🔄 Retour en arrière

Si vous devez revenir à GitHub Container Registry :

1. Restaurer les anciens fichiers depuis Git
2. Reconfigurer les secrets GitHub
3. Réinstaller les dépendances GitHub

---

**🎉 Migration terminée !**

Votre CI/CD utilise maintenant Digital Ocean Container Registry avec une intégration complète à votre infrastructure DO.
