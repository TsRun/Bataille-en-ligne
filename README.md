# Bataille Multijoueur en Ligne

Jeu de Bataille classique en temps réel entre 2 joueurs via un lien partageable.

## Stack

- **Frontend** : React + Vite + Framer Motion + Tailwind CSS (`/client`)
- **Backend** : Node.js + Express + Socket.io (`/server`)

## Lancement

### Prérequis

- Node.js >= 18

### 1. Démarrer le serveur

```bash
cd server
npm install
npm run dev
```

Le serveur écoute sur `http://localhost:3001`.

### 2. Démarrer le client

Dans un second terminal :

```bash
cd client
npm install
npm run dev
```

Le client est accessible sur `http://localhost:5173`.

### 3. Jouer

1. Ouvrir `http://localhost:5173` dans un navigateur, saisir un nom, cliquer **Créer une partie**.
2. Copier le code de room affiché et l'envoyer à l'adversaire.
3. L'adversaire ouvre `http://localhost:5173`, saisit son nom, colle le code, clique **Rejoindre**.
4. La partie commence automatiquement quand les deux joueurs sont connectés.

## Jouer avec un ami

### Option A — Render.com (gratuit)

1. Pousser le repo sur GitHub.
2. Créer un nouveau **Web Service** sur [render.com](https://render.com).
3. Relier votre repo GitHub et configurer :
   - **Build Command** : `npm run build`
   - **Start Command** : `npm start`
   - **Environment** : Node
4. Dans **Settings → Environment**, ajouter `NODE_ENV=production`.
5. Render expose automatiquement le port détecté (`3000`). Une fois déployé, partager l'URL publique à votre adversaire.

### Option B — Docker VPS

Sur n'importe quel VPS avec Docker et Docker Compose installés :

```bash
git clone <url-du-repo>
cd bataille-multijoueur
docker-compose up -d
```

Le jeu est accessible sur `http://<ip-du-vps>:3000`. Partager cette URL à votre adversaire.

### Option C — ngrok (partage local sans serveur)

1. Démarrer le jeu en production locale :
   ```bash
   npm run build
   npm start
   ```
2. Dans un second terminal, exposer le port avec ngrok :
   ```bash
   ngrok http 3000
   ```
3. Copier l'URL `https://xxxx.ngrok-free.app` affichée et l'envoyer à votre adversaire.

---

## Tests (backend)

```bash
cd server
npm test
```

18 tests couvrant la logique de jeu (deck, distribution, bataille, fin de partie).
