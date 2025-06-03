# 🌍 Travel Agency App - Configuration

## Installation rapide

### 1. Cloner le projet
```bash
git pull origin votre-branche
cd travel-agency-app-back_end
```

### 2. Installer les dépendances
```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### 3. Configuration de la base de données

**Créer le fichier `.env` dans le dossier `server/`** :
```bash
# server/.env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Initialiser la base de données
```bash
cd server

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Remplir avec les données de test
node seed_destinations.js
```

### 5. Démarrer l'application

**Terminal 1 - Backend :**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd client
npm start
```

## URLs d'accès

- 🖥️ **Frontend** : http://localhost:3000
- 🔌 **API** : http://localhost:5000/api/destinations  
- 🗄️ **Base de données** : http://localhost:5555 (après `npx prisma studio`)

## Données de test incluses

✅ 5 destinations pré-configurées :
- Paris, France (899€)
- Rome, Italie (750€) 
- Barcelone, Espagne (650€)
- Tokyo, Japon (1599€)
- Bali, Indonésie (1299€)

## Problèmes courants

### Erreur Prisma Windows
```bash
# Exécuter VS Code en administrateur puis :
npx prisma generate --force-reset
npx prisma db push
```

### Port déjà utilisé
```bash
# Changer le port dans server/.env
PORT=5001
```