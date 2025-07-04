#!/bin/bash

# Script de déploiement manuel pour Quiz Master
# Utilisez ce script pour déployer manuellement sans GitHub Actions

set -e

# Configuration
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Ansible
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible n'est pas installé"
        print_status "Installation d'Ansible..."
        pip install ansible docker
    fi
    
    # Vérifier doctl
    if ! command -v doctl &> /dev/null; then
        print_error "doctl n'est pas installé"
        print_status "Veuillez installer doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    # Vérifier les variables d'environnement
    if [ -z "$FRONTEND_SERVER_IP" ] || [ -z "$BACKEND_SERVER_IP" ]; then
        print_error "Les variables FRONTEND_SERVER_IP et BACKEND_SERVER_IP doivent être définies"
        print_status "Exemple:"
        print_status "export FRONTEND_SERVER_IP=164.90.225.146"
        print_status "export BACKEND_SERVER_IP=164.90.225.147"
        exit 1
    fi
    
    if [ -z "$DO_PAT" ]; then
        print_error "La variable DO_PAT doit être définie"
        print_status "Générez un Personal Access Token sur Digital Ocean"
        exit 1
    fi
    
    if [ -z "$DO_REGISTRY_NAME" ]; then
        print_error "La variable DO_REGISTRY_NAME doit être définie"
        print_status "Nom de votre registry Digital Ocean"
        exit 1
    fi
    
    print_success "Prérequis vérifiés"
}

# Construire les images Docker
build_images() {
    print_status "Construction des images Docker..."
    
    # Variables
    REGISTRY="registry.digitalocean.com"
    FRONTEND_IMAGE="${REGISTRY}/${DO_REGISTRY_NAME}/quiz-master-frontend:latest"
    BACKEND_IMAGE="${REGISTRY}/${DO_REGISTRY_NAME}/quiz-master-backend:latest"
    
    # Connexion au registry
    print_status "Connexion au registry Digital Ocean..."
    echo "$DO_PAT" | doctl auth init --access-token -
    doctl registry login
    
    # Construction frontend
    print_status "Construction de l'image frontend..."
    docker build -f Dockerfile.frontend -t "$FRONTEND_IMAGE" .
    
    # Construction backend
    print_status "Construction de l'image backend..."
    docker build -f Dockerfile.backend -t "$BACKEND_IMAGE" .
    
    # Push des images
    print_status "Push des images..."
    docker push "$FRONTEND_IMAGE"
    docker push "$BACKEND_IMAGE"
    
    # Exporter les variables
    export REGISTRY
    export REGISTRY_NAME="$DO_REGISTRY_NAME"
    export FRONTEND_IMAGE
    export BACKEND_IMAGE
    
    print_success "Images construites et poussées"
}

# Setup initial des serveurs
setup_servers() {
    print_status "Setup initial des serveurs..."
    
    cd ansible
    
    # Vérifier la connectivité
    ansible -i inventory/production.yml all -m ping
    
    # Lancer le setup
    ansible-playbook -i inventory/production.yml setup.yml
    
    print_success "Setup terminé"
}

# Déployer l'application
deploy_application() {
    print_status "Déploiement de l'application..."
    
    cd ansible
    
    # Lancer le déploiement
    ansible-playbook -i inventory/production.yml deploy.yml
    
    print_success "Déploiement terminé"
}

# Vérifier le déploiement
verify_deployment() {
    print_status "Vérification du déploiement..."
    
    # Tester le frontend
    if curl -f "http://$FRONTEND_SERVER_IP" > /dev/null 2>&1; then
        print_success "Frontend accessible"
    else
        print_warning "Frontend non accessible"
    fi
    
    # Tester le backend
    if curl -f "http://$BACKEND_SERVER_IP:8003/api/health" > /dev/null 2>&1; then
        print_success "Backend accessible"
    else
        print_warning "Backend non accessible"
    fi
    
    print_status "URLs de l'application:"
    print_status "Frontend: http://$FRONTEND_SERVER_IP"
    print_status "Backend: http://$BACKEND_SERVER_IP:8003"
    print_status "Health Check: http://$BACKEND_SERVER_IP:8003/api/health"
}

# Menu principal
main() {
    print_status "🚀 Déploiement Quiz Master"
    print_status "=========================="
    
    case "${1:-all}" in
        "prerequisites")
            check_prerequisites
            ;;
        "build")
            check_prerequisites
            build_images
            ;;
        "setup")
            check_prerequisites
            setup_servers
            ;;
        "deploy")
            check_prerequisites
            deploy_application
            ;;
        "verify")
            verify_deployment
            ;;
        "all")
            check_prerequisites
            build_images
            setup_servers
            deploy_application
            verify_deployment
            ;;
        *)
            echo "Usage: $0 {prerequisites|build|setup|deploy|verify|all}"
            echo ""
            echo "Commands:"
            echo "  prerequisites  - Vérifier les prérequis"
            echo "  build         - Construire et pousser les images"
            echo "  setup         - Setup initial des serveurs"
            echo "  deploy        - Déployer l'application"
            echo "  verify        - Vérifier le déploiement"
            echo "  all           - Tout faire (par défaut)"
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@" 