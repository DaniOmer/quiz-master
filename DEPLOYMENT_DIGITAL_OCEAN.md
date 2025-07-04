# 🌊 Déploiement QuizMaster sur Digital Ocean

Guide complet pour déployer QuizMaster sur votre droplet Digital Ocean.

**IP du serveur :** `164.90.225.146`

---

## 📋 PRÉREQUIS

- Droplet Digital Ocean configuré ✅
- Accès SSH au serveur ✅
- Nom de domaine (optionnel mais recommandé)

---

## 🚀 ÉTAPE 1 : PRÉPARATION DU SERVEUR

### 1.1 Connexion SSH
```bash
# Connectez-vous à votre droplet
ssh root@164.90.225.146

# Ou si vous avez un utilisateur non-root
ssh votre_utilisateur@164.90.225.146
```

### 1.2 Mise à jour du système
```bash
# Mise à jour des paquets
sudo apt update && sudo apt upgrade -y

# Installation des outils essentiels
sudo apt install -y curl wget git unzip
```

### 1.3 Installation de Node.js
```bash
# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version
npm --version
```

### 1.4 Installation de PM2 (Process Manager)
```bash
# Installation globale de PM2
sudo npm install -g pm2

# Configuration pour démarrage automatique
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

---

## 📁 ÉTAPE 2 : DÉPLOIEMENT DU CODE

### 2.1 Cloner le projet
```bash
# Aller dans le répertoire home
cd ~

# Cloner votre repository (remplacez par votre URL)
git clone https://github.com/FAEZ10/quiz-master.git

# Aller dans le dossier
cd quiz-master
```

### 2.2 Installation des dépendances
```bash
# Installation des dépendances
npm install

# Build du frontend
npm run build
```

### 2.3 Configuration des variables d'environnement
```bash
# Créer le fichier .env.production
nano .env.production
```

Contenu du fichier `.env.production` :
```env
NODE_ENV=production
NEXT_PUBLIC_SOCKET_URL=http://164.90.225.146:3001
PORT_CLIENT=3000
PORT_SERVER=3001
```

---

## 🔧 ÉTAPE 3 : CONFIGURATION NGINX

### 3.1 Installation de Nginx
```bash
# Installation
sudo apt install -y nginx

# Démarrage et activation
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Configuration Nginx
```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/quizmaster
```

Contenu du fichier de configuration :
```nginx
server {
    listen 80;
    server_name 164.90.225.146;  # Remplacez par votre domaine si vous en avez un

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.3 Activation de la configuration
```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/quizmaster /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 🚀 ÉTAPE 4 : DÉMARRAGE DES APPLICATIONS

### 4.1 Créer les fichiers de configuration PM2

#### Configuration pour le backend
```bash
# Créer ecosystem.config.js
nano ecosystem.config.js
```

Contenu :
```javascript
module.exports = {
  apps: [
    {
      name: 'quizmaster-backend',
      script: 'tsx',
      args: 'server/index.ts',
      cwd: '/home/votre_utilisateur/quiz-master',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'quizmaster-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/votre_utilisateur/quiz-master',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
```

### 4.2 Créer le dossier de logs
```bash
mkdir logs
```

### 4.3 Démarrer les applications
```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
```

---

## 🔥 ÉTAPE 5 : CONFIGURATION DU FIREWALL

### 5.1 Configuration UFW
```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow ssh

# Autoriser HTTP et HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Vérifier le statut
sudo ufw status
```

---

## 🌐 ÉTAPE 6 : CONFIGURATION SSL (OPTIONNEL)

### 6.1 Installation de Certbot
```bash
# Installation
sudo apt install -y certbot python3-certbot-nginx

# Si vous avez un domaine, obtenez un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajoutez cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 ÉTAPE 7 : MONITORING ET MAINTENANCE

### 7.1 Commandes utiles PM2
```bash
# Voir les logs en temps réel
pm2 logs

# Redémarrer une application
pm2 restart quizmaster-backend
pm2 restart quizmaster-frontend

# Arrêter une application
pm2 stop quizmaster-backend

# Voir les métriques
pm2 monit

# Recharger la configuration
pm2 reload ecosystem.config.js
```

### 7.2 Commandes utiles Nginx
```bash
# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Tester la configuration
sudo nginx -t
```

---

## 🧪 ÉTAPE 8 : TESTS DE VALIDATION

### 8.1 Tests de connectivité
```bash
# Tester le frontend
curl http://164.90.225.146

# Tester le backend
curl http://164.90.225.146:3001/health

# Tester via navigateur
# Frontend: http://164.90.225.146
# Backend: http://164.90.225.146:3001
```

### 8.2 Tests fonctionnels
1. Ouvrez `http://164.90.225.146` dans votre navigateur
2. Créez un quiz
3. Rejoignez avec un autre onglet/appareil
4. Testez le jeu complet

---

## 🔄 ÉTAPE 9 : SCRIPT DE DÉPLOIEMENT AUTOMATIQUE

### 9.1 Créer un script de déploiement
```bash
nano deploy.sh
```

Contenu :
```bash
#!/bin/bash

echo "🚀 Déploiement QuizMaster..."

# Aller dans le répertoire du projet
cd ~/quiz-master

# Sauvegarder les changements locaux
git stash

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install

# Build du frontend
npm run build

# Redémarrer les applications
pm2 restart ecosystem.config.js

# Redémarrer Nginx
sudo systemctl restart nginx

echo "✅ Déploiement terminé !"
echo "🌐 Application disponible sur : http://164.90.225.146"
```

### 9.2 Rendre le script exécutable
```bash
chmod +x deploy.sh
```

### 9.3 Utilisation
```bash
# Pour redéployer
./deploy.sh
```

---

## 🎯 URLS FINALES

Après déploiement, votre application sera accessible sur :

- **Application complète** : `http://164.90.225.146`
- **API Backend** : `http://164.90.225.146:3001`
- **Health Check** : `http://164.90.225.146:3001/health`

---

## 🐛 DÉPANNAGE

### Problèmes courants

#### 1. Application ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs

# Vérifier les ports
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001
```

#### 2. Nginx ne fonctionne pas
```bash
# Vérifier la configuration
sudo nginx -t

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

#### 3. Socket.IO ne se connecte pas
```bash
# Vérifier que le backend fonctionne
curl http://localhost:3001/health

# Vérifier les logs du backend
pm2 logs quizmaster-backend
```

#### 4. Problème de permissions
```bash
# Changer le propriétaire des fichiers
sudo chown -R $USER:$USER ~/quiz-master

# Permissions pour PM2
sudo chown -R $USER:$USER ~/.pm2
```

---

## 📈 OPTIMISATIONS AVANCÉES

### 1. Optimisation des performances
```bash
# Augmenter les limites de fichiers
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

### 2. Monitoring avancé
```bash
# Installation de htop pour monitoring
sudo apt install -y htop

# Monitoring des ressources
htop
```

### 3. Sauvegarde automatique
```bash
# Script de sauvegarde
nano backup.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf ~/backups/quizmaster_$DATE.tar.gz ~/quiz-master
find ~/backups -name "quizmaster_*.tar.gz" -mtime +7 -delete
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Serveur mis à jour
- [ ] Node.js installé
- [ ] PM2 installé et configuré
- [ ] Code cloné et dépendances installées
- [ ] Variables d'environnement configurées
- [ ] Nginx installé et configuré
- [ ] Applications démarrées avec PM2
- [ ] Firewall configuré
- [ ] Tests de connectivité réussis
- [ ] Application accessible publiquement

---

**🎉 Félicitations ! Votre QuizMaster est maintenant déployé sur Digital Ocean !**

**URL de votre application :** `http://164.90.225.146`
