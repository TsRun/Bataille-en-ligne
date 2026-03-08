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

## Tests (backend)

```bash
cd server
npm test
```

18 tests couvrant la logique de jeu (deck, distribution, bataille, fin de partie).
