# 🏖️ Travel Agency App

Application web moderne pour la gestion d'une agence de voyage, permettant la création et la réservation de destinations touristiques.

## 🚀 Quick Start

### Option 1: Installation rapide (recommandée)

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd travel-agency-app

# 2. Installation complète en une seule commande
npm run setup

# 3. Lancer l'application
npm run dev-full
```

Cette commande unique `npm run setup` va:
- Installer toutes les dépendances (racine, client et serveur)
- Créer le dossier `uploads` nécessaire pour les images
- Configurer la base de données (copie du fichier .env, migrations, données initiales)

Le script d'installation est compatible avec Windows et autres systèmes d'exploitation.

### Option 2: Installation manuelle (PowerShell)

```powershell
# 1. Cloner et installer
git clone <url-du-repo>
cd travel-agency-app
npm install
cd client; npm install
cd ../server; npm install

# 2. Configuration base de données
cd server
copy .env.example .env
if (-not (Test-Path uploads)) { mkdir uploads }
npx prisma migrate dev
node prisma/seed.js

# 3. Lancer l'application
cd ..
npm run dev-full
```

**Accès :**
- 🌐 **Client** : http://localhost:3000
- 🔧 **API** : http://localhost:5000
- 📊 **Test API** : http://localhost:5000/api/test

## 🏗️ Architecture

```
travel-agency-app/
├── client/          # React Frontend
├── server/          # Express API + Database
├── docs/           # Documentation détaillée
└── package.json    # Scripts principaux
```

## 🛠️ Technologies

**Frontend :**
- React 18
- CSS Modules / Styled Components
- Axios pour les appels API

**Backend :**
- Express.js
- Prisma ORM
- SQLite/PostgreSQL
- Validation avec Joi/Zod

## 📖 Documentation

- 📘 **[API Guide](docs/API.md)** - Endpoints et exemples curl
- 🗄️ **[Database Setup](docs/DATABASE.md)** - Configuration BDD
- 👨‍💻 **[Development Guide](docs/DEVELOPMENT.md)** - Guide développeur

## 🎯 Fonctionnalités

- ✅ Gestion des destinations (CRUD)
- ✅ Système de réservations
- ✅ Validation des données
- ✅ API REST complète
- 🔄 Interface utilisateur responsive

## 📝 Scripts disponibles

```bash
npm run setup       # Installation complète (dépendances + configuration BDD)
npm run install-all # Installe toutes les dépendances
npm run dev-full    # Lance client + serveur en parallèle
npm run client      # Lance React uniquement
npm run server      # Lance Express uniquement
npm run build       # Build de production
npm run test        # Tests unitaires
```

## 🔧 Prérequis

- **Node.js** 16+
- **npm** 7+
- **Git**

## 🤝 Contribution

1. Clone le projet (`git clone https://github.com/PierreEWang/travel-agency-app.git`)
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

]