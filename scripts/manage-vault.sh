#!/bin/bash

# Script de gestion du vault Ansible pour Quiz Master
# Usage: ./scripts/manage-vault.sh [encrypt|decrypt|edit|view]

set -e

VAULT_FILE="ansible/group_vars/vault.yml"
VAULT_PASSWORD_FILE="ansible/.vault_pass"

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

# Vérifier si ansible-vault est installé
check_ansible() {
    if ! command -v ansible-vault &> /dev/null; then
        print_error "ansible-vault n'est pas installé. Installez Ansible d'abord."
        exit 1
    fi
}

# Vérifier si le fichier vault existe
check_vault_file() {
    if [ ! -f "$VAULT_FILE" ]; then
        print_error "Le fichier vault $VAULT_FILE n'existe pas."
        exit 1
    fi
}

# Créer le fichier de mot de passe vault s'il n'existe pas
setup_vault_password() {
    if [ ! -f "$VAULT_PASSWORD_FILE" ]; then
        print_warning "Fichier de mot de passe vault non trouvé."
        echo -n "Entrez le mot de passe pour le vault: "
        read -s vault_password
        echo
        echo "$vault_password" > "$VAULT_PASSWORD_FILE"
        chmod 600 "$VAULT_PASSWORD_FILE"
        print_success "Fichier de mot de passe créé: $VAULT_PASSWORD_FILE"
        
        # Ajouter au .gitignore si pas déjà présent
        if ! grep -q ".vault_pass" .gitignore 2>/dev/null; then
            echo "ansible/.vault_pass" >> .gitignore
            print_info "Ajouté ansible/.vault_pass au .gitignore"
        fi
    fi
}

# Chiffrer le vault
encrypt_vault() {
    print_info "Chiffrement du vault..."
    if ansible-vault encrypt "$VAULT_FILE" --vault-password-file "$VAULT_PASSWORD_FILE"; then
        print_success "Vault chiffré avec succès!"
    else
        print_error "Échec du chiffrement du vault"
        exit 1
    fi
}

# Déchiffrer le vault
decrypt_vault() {
    print_info "Déchiffrement du vault..."
    if ansible-vault decrypt "$VAULT_FILE" --vault-password-file "$VAULT_PASSWORD_FILE"; then
        print_success "Vault déchiffré avec succès!"
        print_warning "N'oubliez pas de le rechiffrer après modification!"
    else
        print_error "Échec du déchiffrement du vault"
        exit 1
    fi
}

# Éditer le vault
edit_vault() {
    print_info "Ouverture de l'éditeur pour le vault..."
    if ansible-vault edit "$VAULT_FILE" --vault-password-file "$VAULT_PASSWORD_FILE"; then
        print_success "Vault édité avec succès!"
    else
        print_error "Échec de l'édition du vault"
        exit 1
    fi
}

# Voir le contenu du vault
view_vault() {
    print_info "Affichage du contenu du vault..."
    if ansible-vault view "$VAULT_FILE" --vault-password-file "$VAULT_PASSWORD_FILE"; then
        print_success "Contenu affiché avec succès!"
    else
        print_error "Échec de l'affichage du vault"
        exit 1
    fi
}

# Vérifier le statut du vault
check_vault_status() {
    if ansible-vault view "$VAULT_FILE" --vault-password-file "$VAULT_PASSWORD_FILE" &>/dev/null; then
        print_success "Le vault est chiffré et accessible"
        return 0
    elif grep -q "CHANGEME" "$VAULT_FILE" 2>/dev/null; then
        print_warning "Le vault n'est pas chiffré et contient des valeurs par défaut"
        return 1
    else
        print_error "Impossible de déterminer le statut du vault"
        return 2
    fi
}

# Initialiser le vault avec des valeurs par défaut
init_vault() {
    print_info "Initialisation du vault..."
    
    # Demander les valeurs à l'utilisateur
    echo "Entrez les valeurs pour votre configuration:"
    
    echo -n "Token Digital Ocean (DO_PAT): "
    read -s do_pat
    echo
    
    echo -n "Nom du registry Digital Ocean: "
    read registry_name
    
    echo -n "IP du serveur frontend: "
    read frontend_ip
    
    echo -n "IP du serveur backend: "
    read backend_ip
    
    echo -n "Email pour les certificats SSL: "
    read ssl_email
    
    echo -n "Nom de domaine: "
    read domain_name
    
    # Créer le fichier vault avec les vraies valeurs
    cat > "$VAULT_FILE" << EOF
# Fichier de variables chiffrées avec Ansible Vault
# Généré automatiquement le $(date)

# Secrets Digital Ocean
vault_do_pat: "$do_pat"
vault_do_registry_name: "$registry_name"

# Secrets serveurs
vault_frontend_server_ip: "$frontend_ip"
vault_backend_server_ip: "$backend_ip"

# Configuration SSL/TLS
vault_ssl_cert_email: "$ssl_email"
vault_domain_name: "$domain_name"

# Secrets application (à personnaliser selon vos besoins)
vault_database_password: "$(openssl rand -base64 32)"
vault_jwt_secret: "$(openssl rand -base64 64)"
vault_api_key: "$(openssl rand -base64 32)"
EOF
    
    print_success "Vault initialisé avec vos valeurs!"
    print_info "Chiffrement automatique du vault..."
    encrypt_vault
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  encrypt    Chiffrer le vault"
    echo "  decrypt    Déchiffrer le vault"
    echo "  edit       Éditer le vault (ouverture automatique de l'éditeur)"
    echo "  view       Voir le contenu du vault"
    echo "  status     Vérifier le statut du vault"
    echo "  init       Initialiser le vault avec vos valeurs"
    echo "  help       Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 init      # Première utilisation"
    echo "  $0 edit      # Modifier les valeurs"
    echo "  $0 view      # Voir les valeurs actuelles"
    echo "  $0 status    # Vérifier l'état du vault"
}

# Script principal
main() {
    check_ansible
    
    case "${1:-help}" in
        "encrypt")
            check_vault_file
            setup_vault_password
            encrypt_vault
            ;;
        "decrypt")
            check_vault_file
            setup_vault_password
            decrypt_vault
            ;;
        "edit")
            check_vault_file
            setup_vault_password
            edit_vault
            ;;
        "view")
            check_vault_file
            setup_vault_password
            view_vault
            ;;
        "status")
            check_vault_file
            setup_vault_password
            check_vault_status
            ;;
        "init")
            setup_vault_password
            init_vault
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécuter le script principal
main "$@"
