#!/bin/bash

# Script de vérification de la configuration CI/CD
# Vérifie que tous les fichiers nécessaires sont présents et configurés

set -e

# Configuration des couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌]${NC} $1"
}

print_title() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Variables
ERRORS=0
WARNINGS=0

# Fonction pour incrémenter les erreurs
add_error() {
    print_error "$1"
    ERRORS=$((ERRORS + 1))
}

# Fonction pour incrémenter les warnings
add_warning() {
    print_warning "$1"
    WARNINGS=$((WARNINGS + 1))
}

# Vérification des fichiers essentiels
check_files() {
    print_title "Vérification des fichiers essentiels"
    
    local files=(
        ".github/workflows/ci-cd.yml"
        "ansible/inventory/production.yml"
        "ansible/deploy.yml"
        "ansible/setup.yml"
        "ansible/ansible.cfg"
        "ansible/group_vars/all.yml"
        "ansible/templates/docker-compose.frontend.yml.j2"
        "ansible/templates/docker-compose.backend.yml.j2"
        "ansible/templates/nginx.conf.j2"
        "Dockerfile.frontend"
        "Dockerfile.backend"
        "scripts/deploy-manual.sh"
        "Makefile"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Fichier présent: $file"
        else
            add_error "Fichier manquant: $file"
        fi
    done
}

# Vérification de la configuration Docker
check_docker() {
    print_title "Vérification Docker"
    
    if command -v docker &> /dev/null; then
        print_success "Docker est installé"
        if docker info &> /dev/null; then
            print_success "Docker daemon fonctionne"
        else
            add_warning "Docker daemon ne répond pas"
        fi
    else
        add_error "Docker n'est pas installé"
    fi
    
    # Vérifier doctl
    if command -v doctl &> /dev/null; then
        print_success "doctl est installé"
        local version=$(doctl version 2>/dev/null | grep -oE 'doctl version [0-9]+\.[0-9]+\.[0-9]+' || echo "version inconnue")
        print_status "Version: $version"
    else
        add_error "doctl n'est pas installé (requis pour Digital Ocean Container Registry)"
    fi
}

# Vérification des variables d'environnement
check_env_vars() {
    print_title "Vérification des variables d'environnement"
    
    local required_vars=(
        "FRONTEND_SERVER_IP"
        "BACKEND_SERVER_IP"
        "DO_PAT"
        "DO_REGISTRY_NAME"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var}" ]; then
            print_success "Variable définie: $var"
        else
            add_warning "Variable non définie: $var (nécessaire pour le déploiement manuel)"
        fi
    done
}

# Vérification de la configuration Ansible
check_ansible() {
    print_title "Vérification Ansible"
    
    if command -v ansible &> /dev/null; then
        print_success "Ansible est installé"
        local version=$(ansible --version | head -n1)
        print_status "Version: $version"
    else
        add_warning "Ansible n'est pas installé (sera installé automatiquement si nécessaire)"
    fi
    
    # Vérifier la configuration
    if [ -f "ansible/ansible.cfg" ]; then
        print_success "Configuration Ansible présente"
    else
        add_error "Fichier ansible.cfg manquant"
    fi
}

# Vérification de la clé SSH
check_ssh() {
    print_title "Vérification SSH"
    
    if [ -f "$HOME/.ssh/id_rsa" ]; then
        print_success "Clé SSH privée trouvée"
    else
        add_warning "Clé SSH privée non trouvée dans ~/.ssh/id_rsa"
    fi
    
    if [ -f "$HOME/.ssh/id_rsa.pub" ]; then
        print_success "Clé SSH publique trouvée"
    else
        add_warning "Clé SSH publique non trouvée dans ~/.ssh/id_rsa.pub"
    fi
}

# Vérification de la configuration GitHub Actions
check_github_actions() {
    print_title "Vérification GitHub Actions"
    
    local workflow_file=".github/workflows/ci-cd.yml"
    if [ -f "$workflow_file" ]; then
        print_success "Workflow GitHub Actions configuré"
        
        # Vérifier les secrets nécessaires dans le fichier
        if grep -q "SSH_PRIVATE_KEY" "$workflow_file"; then
            print_success "Secret SSH_PRIVATE_KEY référencé"
        else
            add_error "Secret SSH_PRIVATE_KEY non référencé"
        fi
    else
        add_error "Workflow GitHub Actions manquant"
    fi
}

# Vérification de la structure Ansible
check_ansible_structure() {
    print_title "Vérification de la structure Ansible"
    
    # Vérifier l'inventaire
    local inventory_file="ansible/inventory/production.yml"
    if [ -f "$inventory_file" ]; then
        if grep -q "frontend-server" "$inventory_file" && grep -q "backend-server" "$inventory_file"; then
            print_success "Inventaire Ansible configuré avec frontend et backend"
        else
            add_error "Inventaire Ansible mal configuré"
        fi
    fi
    
    # Vérifier les templates
    local templates_dir="ansible/templates"
    if [ -d "$templates_dir" ]; then
        local template_count=$(ls -1 "$templates_dir"/*.j2 2>/dev/null | wc -l)
        print_success "Templates Ansible: $template_count fichiers"
    else
        add_error "Dossier templates Ansible manquant"
    fi
}

# Vérification des ports
check_ports() {
    print_title "Vérification des ports disponibles"
    
    local ports=(3000 8003)
    for port in "${ports[@]}"; do
        if lsof -i :$port &> /dev/null; then
            add_warning "Port $port est déjà utilisé"
        else
            print_success "Port $port disponible"
        fi
    done
}

# Récapitulatif
print_summary() {
    print_title "Récapitulatif"
    
    echo -e "\n📊 Résultats de la vérification:"
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 Parfait ! Tout est configuré correctement.${NC}"
        echo -e "${GREEN}✅ Prêt pour le déploiement !${NC}"
        return 0
    else
        if [ $ERRORS -gt 0 ]; then
            echo -e "${RED}❌ $ERRORS erreur(s) critique(s) trouvée(s)${NC}"
        fi
        if [ $WARNINGS -gt 0 ]; then
            echo -e "${YELLOW}⚠️ $WARNINGS avertissement(s)${NC}"
        fi
        
        echo -e "\n🔧 Actions recommandées:"
        if [ $ERRORS -gt 0 ]; then
            echo -e "${RED}1. Corriger les erreurs critiques avant le déploiement${NC}"
        fi
        if [ $WARNINGS -gt 0 ]; then
            echo -e "${YELLOW}2. Vérifier les avertissements pour une configuration optimale${NC}"
        fi
        
        return 1
    fi
}

# Fonction principale
main() {
    echo -e "${BLUE}🔍 Vérification de la configuration CI/CD Quiz Master${NC}"
    echo -e "${BLUE}=================================================${NC}"
    
    check_files
    check_docker
    check_env_vars
    check_ansible
    check_ssh
    check_github_actions
    check_ansible_structure
    check_ports
    
    print_summary
}

# Exécuter la vérification
main "$@" 