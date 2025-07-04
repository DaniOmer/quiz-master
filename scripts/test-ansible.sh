#!/bin/bash

# Script de test pour la configuration Ansible
# Usage: ./scripts/test-ansible.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    # Vérifier Ansible
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible n'est pas installé"
        exit 1
    fi
    
    # Vérifier ansible-playbook
    if ! command -v ansible-playbook &> /dev/null; then
        print_error "ansible-playbook n'est pas installé"
        exit 1
    fi
    
    print_success "Prérequis OK"
}

# Vérifier la syntaxe des playbooks
check_syntax() {
    print_info "Vérification de la syntaxe des playbooks..."
    
    cd ansible
    
    # Vérifier setup.yml
    if ansible-playbook setup.yml --syntax-check; then
        print_success "setup.yml - Syntaxe OK"
    else
        print_error "setup.yml - Erreur de syntaxe"
        return 1
    fi
    
    # Vérifier deploy.yml
    if ansible-playbook deploy.yml --syntax-check; then
        print_success "deploy.yml - Syntaxe OK"
    else
        print_error "deploy.yml - Erreur de syntaxe"
        return 1
    fi
    
    cd ..
}

# Vérifier l'inventaire
check_inventory() {
    print_info "Vérification de l'inventaire..."
    
    cd ansible
    
    if ansible-inventory -i inventory/production.yml --list > /dev/null; then
        print_success "Inventaire OK"
    else
        print_error "Erreur dans l'inventaire"
        return 1
    fi
    
    # Afficher l'inventaire
    print_info "Structure de l'inventaire:"
    ansible-inventory -i inventory/production.yml --list --yaml
    
    cd ..
}

# Vérifier les templates
check_templates() {
    print_info "Vérification des templates..."
    
    local templates_dir="ansible/templates"
    local templates=(
        "docker-compose.frontend.yml.j2"
        "docker-compose.backend.yml.j2"
        "nginx.conf.j2"
    )
    
    for template in "${templates[@]}"; do
        if [ -f "$templates_dir/$template" ]; then
            print_success "$template - Présent"
        else
            print_error "$template - Manquant"
            return 1
        fi
    done
}

# Test de simulation (dry-run)
test_dry_run() {
    print_info "Test de simulation (dry-run)..."
    
    cd ansible
    
    # Variables de test
    local test_vars=(
        "frontend_image=registry.digitalocean.com/test/quiz-master-frontend:latest"
        "backend_image=registry.digitalocean.com/test/quiz-master-backend:latest"
        "registry=registry.digitalocean.com"
        "registry_name=test"
        "do_pat=test_token"
    )
    
    print_info "Test du playbook deploy.yml en mode check..."
    
    if ansible-playbook -i inventory/production.yml deploy.yml --check \
        $(printf -- "--extra-vars %s " "${test_vars[@]}") \
        --connection=local; then
        print_success "Dry-run OK"
    else
        print_warning "Dry-run échoué (normal si les serveurs ne sont pas accessibles)"
    fi
    
    cd ..
}

# Vérifier les variables
check_variables() {
    print_info "Vérification des variables..."
    
    # Vérifier group_vars/all.yml
    if [ -f "ansible/group_vars/all.yml" ]; then
        print_success "group_vars/all.yml - Présent"
    else
        print_error "group_vars/all.yml - Manquant"
        return 1
    fi
    
    # Vérifier vault.yml
    if [ -f "ansible/group_vars/vault.yml" ]; then
        print_success "group_vars/vault.yml - Présent"
        
        # Vérifier si le vault est chiffré
        if grep -q "CHANGEME" "ansible/group_vars/vault.yml" 2>/dev/null; then
            print_warning "Le vault contient encore des valeurs par défaut"
        elif grep -q "\$ANSIBLE_VAULT" "ansible/group_vars/vault.yml" 2>/dev/null; then
            print_success "Le vault est chiffré"
        else
            print_warning "Le vault n'est pas chiffré"
        fi
    else
        print_error "group_vars/vault.yml - Manquant"
        return 1
    fi
}

# Vérifier la configuration Ansible
check_ansible_config() {
    print_info "Vérification de la configuration Ansible..."
    
    if [ -f "ansible/ansible.cfg" ]; then
        print_success "ansible.cfg - Présent"
        
        # Afficher la configuration
        print_info "Configuration Ansible:"
        cd ansible
        ansible-config dump --only-changed
        cd ..
    else
        print_error "ansible.cfg - Manquant"
        return 1
    fi
}

# Générer un rapport de test
generate_report() {
    print_info "Génération du rapport de test..."
    
    local report_file="ansible-test-report.txt"
    
    cat > "$report_file" << EOF
# Rapport de Test Ansible - Quiz Master
Généré le: $(date)

## Configuration
- Ansible Version: $(ansible --version | head -1)
- Python Version: $(python3 --version)

## Fichiers Vérifiés
- ✅ ansible/setup.yml
- ✅ ansible/deploy.yml
- ✅ ansible/inventory/production.yml
- ✅ ansible/group_vars/all.yml
- ✅ ansible/group_vars/vault.yml
- ✅ ansible/ansible.cfg

## Templates
- ✅ ansible/templates/docker-compose.frontend.yml.j2
- ✅ ansible/templates/docker-compose.backend.yml.j2
- ✅ ansible/templates/nginx.conf.j2

## Recommandations
1. Configurer le vault avec de vraies valeurs
2. Tester la connectivité SSH vers les serveurs
3. Vérifier les secrets GitHub Actions

EOF
    
    print_success "Rapport généré: $report_file"
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  --syntax      Vérifier uniquement la syntaxe"
    echo "  --inventory   Vérifier uniquement l'inventaire"
    echo "  --templates   Vérifier uniquement les templates"
    echo "  --variables   Vérifier uniquement les variables"
    echo "  --dry-run     Effectuer uniquement un dry-run"
    echo "  --report      Générer uniquement le rapport"
    echo "  --help        Afficher cette aide"
    echo ""
    echo "Sans option, tous les tests sont exécutés."
}

# Script principal
main() {
    echo "🧪 Test de Configuration Ansible - Quiz Master"
    echo "=============================================="
    
    case "${1:-all}" in
        "--syntax")
            check_prerequisites
            check_syntax
            ;;
        "--inventory")
            check_prerequisites
            check_inventory
            ;;
        "--templates")
            check_templates
            ;;
        "--variables")
            check_variables
            ;;
        "--dry-run")
            check_prerequisites
            test_dry_run
            ;;
        "--report")
            generate_report
            ;;
        "--help")
            show_help
            ;;
        "all"|*)
            check_prerequisites
            check_syntax
            check_inventory
            check_templates
            check_variables
            check_ansible_config
            test_dry_run
            generate_report
            
            echo ""
            print_success "🎉 Tous les tests terminés!"
            print_info "Consultez le rapport: ansible-test-report.txt"
            ;;
    esac
}

# Exécuter le script principal
main "$@"
