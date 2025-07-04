.PHONY: help build test deploy setup verify clean

# Variables
COMPOSE_FILE=docker-compose.dev.yml
REGISTRY=registry.digitalocean.com
DO_REGISTRY_NAME?=your-registry-name
FRONTEND_IMAGE=$(REGISTRY)/$(DO_REGISTRY_NAME)/quiz-master-frontend:latest
BACKEND_IMAGE=$(REGISTRY)/$(DO_REGISTRY_NAME)/quiz-master-backend:latest

# Colors
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m

help: ## Afficher l'aide
	@echo "🚀 Quiz Master - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Développement local
dev: ## Lancer l'environnement de développement
	@echo "$(BLUE)🔧 Lancement de l'environnement de développement...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up --build -d

dev-logs: ## Voir les logs de développement
	@echo "$(BLUE)📋 Logs de développement:$(NC)"
	docker-compose -f $(COMPOSE_FILE) logs -f

dev-stop: ## Arrêter l'environnement de développement
	@echo "$(YELLOW)🛑 Arrêt de l'environnement de développement...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down

dev-clean: ## Nettoyer l'environnement de développement
	@echo "$(YELLOW)🧹 Nettoyage de l'environnement de développement...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes --remove-orphans

# Tests
test: ## Lancer les tests
	@echo "$(BLUE)🧪 Lancement des tests...$(NC)"
	npm ci
	npm run lint
	npm run type-check
	npm run build

# Build et Registry
build: ## Construire les images Docker
	@echo "$(BLUE)🔨 Construction des images Docker...$(NC)"
	docker build -f Dockerfile.frontend -t $(FRONTEND_IMAGE) .
	docker build -f Dockerfile.backend -t $(BACKEND_IMAGE) .
	@echo "$(GREEN)✅ Images construites$(NC)"

push: build ## Construire et pousser les images vers le registry
	@echo "$(BLUE)📤 Push des images vers le registry...$(NC)"
	@echo "$(YELLOW)🔐 Connexion au registry Digital Ocean...$(NC)"
	@echo "$$DO_PAT" | doctl auth init --access-token -
	@doctl registry login
	docker push $(FRONTEND_IMAGE)
	docker push $(BACKEND_IMAGE)
	@echo "$(GREEN)✅ Images poussées$(NC)"

# Déploiement
deploy-check: ## Vérifier les prérequis pour le déploiement
	@echo "$(BLUE)🔍 Vérification des prérequis...$(NC)"
	@if [ -z "$$FRONTEND_SERVER_IP" ] || [ -z "$$BACKEND_SERVER_IP" ]; then \
		echo "$(RED)❌ Les variables FRONTEND_SERVER_IP et BACKEND_SERVER_IP doivent être définies$(NC)"; \
		echo "$(YELLOW)Exemple: export FRONTEND_SERVER_IP=164.90.225.146$(NC)"; \
		echo "$(YELLOW)Exemple: export BACKEND_SERVER_IP=164.90.225.147$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$$DO_PAT" ]; then \
		echo "$(RED)❌ La variable DO_PAT doit être définie$(NC)"; \
		echo "$(YELLOW)Générez un Personal Access Token sur Digital Ocean$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$$DO_REGISTRY_NAME" ]; then \
		echo "$(RED)❌ La variable DO_REGISTRY_NAME doit être définie$(NC)"; \
		echo "$(YELLOW)Nom de votre registry Digital Ocean$(NC)"; \
		exit 1; \
	fi
	@if ! command -v doctl &> /dev/null; then \
		echo "$(RED)❌ doctl n'est pas installé$(NC)"; \
		echo "$(YELLOW)Installez doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Prérequis vérifiés$(NC)"

setup: deploy-check ## Setup initial des serveurs
	@echo "$(BLUE)🔧 Setup initial des serveurs...$(NC)"
	@cd ansible && ansible-playbook -i inventory/production.yml setup.yml
	@echo "$(GREEN)✅ Setup terminé$(NC)"

deploy: deploy-check ## Déployer l'application
	@echo "$(BLUE)🚀 Déploiement de l'application...$(NC)"
	@cd ansible && ansible-playbook -i inventory/production.yml deploy.yml
	@echo "$(GREEN)✅ Déploiement terminé$(NC)"

verify: ## Vérifier le déploiement
	@echo "$(BLUE)🔍 Vérification du déploiement...$(NC)"
	@curl -f "http://$$FRONTEND_SERVER_IP" > /dev/null 2>&1 && echo "$(GREEN)✅ Frontend accessible$(NC)" || echo "$(YELLOW)⚠️ Frontend non accessible$(NC)"
	@curl -f "http://$$BACKEND_SERVER_IP:8003/api/health" > /dev/null 2>&1 && echo "$(GREEN)✅ Backend accessible$(NC)" || echo "$(YELLOW)⚠️ Backend non accessible$(NC)"
	@echo "$(BLUE)📋 URLs de l'application:$(NC)"
	@echo "  Frontend: http://$$FRONTEND_SERVER_IP"
	@echo "  Backend: http://$$BACKEND_SERVER_IP:8003"
	@echo "  Health Check: http://$$BACKEND_SERVER_IP:8003/api/health"

# Déploiement complet
deploy-all: setup deploy verify ## Déploiement complet (setup + deploy + verify)

# Déploiement manuel
deploy-manual: ## Déploiement manuel avec script
	@echo "$(BLUE)🚀 Déploiement manuel...$(NC)"
	@chmod +x scripts/deploy-manual.sh
	@./scripts/deploy-manual.sh

# Ansible
ansible-ping: ## Tester la connectivité avec les serveurs
	@echo "$(BLUE)🏓 Test de connectivité avec les serveurs...$(NC)"
	@cd ansible && ansible -i inventory/production.yml all -m ping

ansible-facts: ## Collecter les informations système des serveurs
	@echo "$(BLUE)📊 Collecte des informations système...$(NC)"
	@cd ansible && ansible -i inventory/production.yml all -m setup

# Monitoring et logs
logs-frontend: ## Voir les logs du frontend
	@echo "$(BLUE)📋 Logs du frontend:$(NC)"
	@ssh root@$$FRONTEND_SERVER_IP 'docker logs -f quiz-master-frontend'

logs-backend: ## Voir les logs du backend
	@echo "$(BLUE)📋 Logs du backend:$(NC)"
	@ssh root@$$BACKEND_SERVER_IP 'docker logs -f quiz-master-backend'

status: ## Voir le statut des services
	@echo "$(BLUE)📊 Statut des services:$(NC)"
	@ssh root@$$FRONTEND_SERVER_IP 'docker ps --filter name=quiz-master'
	@ssh root@$$BACKEND_SERVER_IP 'docker ps --filter name=quiz-master'

# Nettoyage
clean: ## Nettoyer les images Docker locales
	@echo "$(YELLOW)🧹 Nettoyage des images Docker...$(NC)"
	docker system prune -f
	docker image prune -f

clean-all: ## Nettoyage complet
	@echo "$(YELLOW)🧹 Nettoyage complet...$(NC)"
	docker system prune -af
	docker volume prune -f

# Utilitaires
ssh-frontend: ## Se connecter au serveur frontend
	@ssh root@$$FRONTEND_SERVER_IP

ssh-backend: ## Se connecter au serveur backend
	@ssh root@$$BACKEND_SERVER_IP

# Commandes par défaut
.DEFAULT_GOAL := help