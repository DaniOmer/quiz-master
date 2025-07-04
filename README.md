# QuizMaster - Quiz Multijoueur en Temps Réel

Un projet de quiz multijoueur moderne développé avec Next.js, Socket.IO et TypeScript. Les joueurs peuvent créer des salles, inviter des amis via des codes ou QR codes, ou des liens d'invitations et participer à des quiz en temps réel avec des scores mis à jour instantanément.

## 🚀 Fonctionnalités

### Fonctionnalités Principales
- ✅ **Connexion des joueurs avec pseudo**
- ✅ **Salles de jeu (rooms) avec codes uniques**
- ✅ **Questions envoyées à tous les joueurs simultanément**
- ✅ **Chronomètre par question avec interface visuelle**
- ✅ **Réponses individuelles évaluées automatiquement**
- ✅ **Mise à jour des scores en temps réel**
- ✅ **Classement final avec podium animé**

### Fonctionnalités Modernes Ajoutées
- 🎯 **Rejoindre via code, QR code ou lien d'invitation**
- 📱 **Interface responsive et moderne**
- 🎨 **Animations fluides avec Framer Motion**
- 🌈 **Design glassmorphism avec gradients**
- 🏆 **Système de points avancé avec bonus de vitesse**
- 📊 **Statistiques détaillées et analytics**
- 🎉 **Effets visuels (confetti, animations)**
- 🔄 **Questions automatiques via API Open Trivia Database**
- 💾 **Questions de fallback intégrées**
- 🎭 **Avatars générés automatiquement**

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 14** avec App Router
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** + **shadcn/ui** pour l'interface
- **Framer Motion** pour les animations
- **Socket.IO Client** pour le temps réel
- **Zustand** pour la gestion d'état
- **React Hook Form** pour les formulaires

### Backend
- **Node.js** + **Express**
- **Socket.IO** pour WebSocket temps réel
- **TypeScript** pour la cohérence
- **Open Trivia Database API** pour les questions

### Fonctionnalités Additionnelles
- **QR Code** generation avec `qrcode`
- **Toast notifications** avec `react-hot-toast`
- **Clipboard API** pour partage facile
- **Canvas Confetti** pour les célébrations

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd quiz-realtime
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Variables d'environnement**
Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3010
NODE_ENV=development
```

4. **Démarrer le projet**
```bash
npm run dev

npm run dev:client  # Port 3000
npm run dev:server  # Port 3001
```

## 🏗️ Architecture du Projet

```
quiz-realtime/
├── app/                          # Pages Next.js
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Page d'accueil
│   └── room/[id]/page.tsx       # Page de salle
├── components/                   # Composants React
│   ├── ui/                      # Composants UI (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   └── quiz/                    # Composants spécifiques
│       ├── CreateRoomDialog.tsx
│       ├── JoinRoomDialog.tsx
│       ├── WaitingRoom.tsx
│       ├── GameScreen.tsx
│       └── ResultsScreen.tsx
├── lib/                         # Utilitaires
│   └── utils.ts                 # Fonctions helper
├── store/                       # État global
│   └── useSocket.ts             # Store Zustand + Socket.IO
├── server/                      # Backend Node.js
│   ├── index.ts                 # Serveur principal
│   └── services/
│       ├── GameManager.ts       # Gestionnaire de jeu
│       └── QuestionService.ts   # Service des questions
├── shared/                      # Types partagés
│   └── types.ts                 # Types TypeScript
└── Configuration files...
```

## 🎮 Guide d'Utilisation

### Créer un Quiz
1. Cliquez sur "Créer un Quiz"
2. Entrez votre nom
3. Configurez les paramètres :
   - Nombre de joueurs (2-10)
   - Nombre de questions (5-25)
   - Temps par question (15-60s)
   - Catégorie et difficulté
4. Cliquez sur "Créer le quiz"

### Rejoindre un Quiz
1. Cliquez sur "Rejoindre un Quiz"
2. Entrez votre nom
3. Entrez le code à 6 caractères OU scannez le QR code
4. Cliquez sur "Rejoindre le quiz"

### Partager un Quiz
- **Code** : Partagez le code à 6 caractères
- **QR Code** : Affichez le QR code pour scan mobile
- **Lien** : Copiez le lien direct
- **Partage natif** : Utilisez l'API de partage du navigateur

## 🎯 Système de Points

- **Base** : 1000 points par bonne réponse
- **Bonus vitesse** : Points supplémentaires selon la rapidité
- **Pénalité** : Aucune pénalité pour les mauvaises réponses
- **Classement** : Tri par score total décroissant

## 🔧 Personnalisation

### Ajouter des Questions Personnalisées
Modifiez `server/services/QuestionService.ts` :
```typescript
private fallbackQuestions: Question[] = [
  {
    id: uuidv4(),
    question: "Votre question ?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    category: "Votre Catégorie",
    difficulty: "easy",
    timeLimit: 30
  },
]
```

### Modifier les Thèmes
Personnalisez `tailwind.config.js` et `app/globals.css` pour changer les couleurs et animations.

### Configurer l'API
Le projet utilise l'Open Trivia Database API par défaut. Pour utiliser une autre API, modifiez `QuestionService.ts`.

## 🚀 Déploiement

### Vercel (Recommandé pour le Frontend)
```bash
npm run build
vercel --prod
```

### Serveur (Backend Socket.IO)
Déployez le serveur sur des plateformes comme :
- **Railway**
- **Render**
- **DigitalOcean**
- **AWS EC2**

### Variables d'Environnement Production
```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
NODE_ENV=production
```

## 🔍 API Endpoints

### Socket.IO Events

#### Client → Server
- `room:create` - Créer une salle
- `room:join` - Rejoindre une salle
- `room:leave` - Quitter une salle
- `game:start` - Démarrer le jeu (host seulement)
- `game:answer` - Soumettre une réponse
- `player:ready` - Marquer comme prêt

#### Server → Client
- `room:joined` - Salle rejointe avec succès
- `room:updated` - Mise à jour de la salle
- `room:error` - Erreur de salle
- `game:started` - Jeu démarré
- `game:question` - Nouvelle question
- `game:answer:result` - Résultat de réponse
- `game:scores` - Scores intermédiaires
- `game:finished` - Jeu terminé
- `player:joined` - Joueur rejoint
- `player:left` - Joueur parti

### REST API
- `GET /api/health` - Santé du serveur
- `GET /api/categories` - Liste des catégories

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## 🐛 Bugs Connus

- [ ] Scanner QR Code (fonctionnalité à implémenter)
- [ ] Support PWA (à ajouter)
- [ ] Mode hors-ligne (futur)

## 🚀 Améliorations Futures

- [ ] **Chat en temps réel** pendant les parties
- [ ] **Système de tournois** multi-salles
- [ ] **Profils utilisateurs** persistants
- [ ] **Historique des parties**
- [ ] **Questions avec images/vidéos**
- [ ] **Mode équipes**
- [ ] **Diffusion en streaming** (spectateurs)
- [ ] **Intégration Twitch/YouTube**
- [ ] **Mode IA** (jouer contre l'IA)
- [ ] **Éditeur de quiz** avancé

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement


**Développé dans le cadre d'un projet d'école**
