# PRD - Bataille Multijoueur en Ligne

## Objectif
Jeu de Bataille classique en temps réel entre 2 joueurs via un lien partageable. Interface animée, full-browser, sans installation.

## Stack technique
- **Frontend** : React + Vite + Framer Motion (animations) + Tailwind CSS
- **Backend** : Node.js + Express + Socket.io
- **Communication** : WebSocket (Socket.io) pour le temps réel
- **State** : In-memory côté serveur (pas de base de données)
- **Monorepo** : `/client` et `/server` à la racine

---

## Règles exactes de la Bataille

### Mise en place
- Jeu de 52 cartes standard (sans jokers)
- Distribution aléatoire équitable : 26 cartes par joueur, faces cachées
- Les cartes sont posées en pile, la première carte en haut

### Valeur des cartes (ordre croissant)
`2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A`
- La couleur (♠ ♥ ♦ ♣) ne joue aucun rôle dans la valeur

### Déroulement d'un tour normal
1. Les deux joueurs cliquent sur "Retourner" simultanément (ou l'un attend l'autre)
2. Chaque joueur retourne la carte du dessus de sa pile face visible au centre
3. La carte la plus haute gagne : le gagnant prend les deux cartes et les place **sous** sa pile
4. En cas de victoire, les cartes gagnées vont sous la pile du vainqueur dans un ordre aléatoire

### Bataille (égalité)
Quand les deux cartes retournées ont la **même valeur** :
1. Chaque joueur pose **3 cartes face cachée** sur la table (sans les retourner)
2. Puis chaque joueur pose **1 carte face visible** — c'est la carte de résolution
3. La plus haute des deux cartes de résolution gagne **toutes les cartes en jeu** (les 2 initiales + 6 cachées + 2 de résolution = 10 cartes)
4. Si la carte de résolution est aussi égale → **nouvelle bataille** (on répète depuis l'étape 1)
5. Si un joueur n'a **pas assez de cartes** pour jouer une bataille (moins de 4 cartes disponibles) : il perd immédiatement

### Fin de partie
- Un joueur gagne quand il possède les **52 cartes**
- Un joueur perd s'il n'a **plus aucune carte** (même hors bataille)
- Pas de limite de tours (la partie dure jusqu'à la victoire)

---

## Phase 1 : Backend — Serveur et logique de jeu

- [x] Initialiser le projet Node.js dans `/server` avec Express et Socket.io
- [x] Implémenter le module `deck.js` : création du jeu de 52 cartes, mélange Fisher-Yates, distribution 26/26
- [x] Implémenter le module `game.js` : état de la partie (piles des joueurs, cartes en jeu, phase en cours)
- [x] Implémenter la logique de comparaison de cartes (résolution d'un tour normal)
- [x] Implémenter la logique de bataille complète (pose des 3 cartes cachées + 1 visible, résolution récursive si nouvelle égalité)
- [x] Implémenter la détection de fin de partie (0 carte = défaite, 52 cartes = victoire)
- [x] Créer la gestion des rooms Socket.io : création d'une room avec ID unique, rejoindre une room via ID
- [x] Implémenter les événements Socket.io :
  - `create_room` → crée une partie, retourne le roomId
  - `join_room` → rejoint une partie existante
  - `player_ready` → le joueur signale qu'il est prêt à retourner sa carte
  - `game_state` → broadcast de l'état complet aux deux joueurs après chaque action
  - `game_over` → broadcast quand un joueur gagne ou perd
- [x] Gérer la déconnexion d'un joueur (l'autre est déclaré vainqueur)

## Phase 2 : Frontend — Structure et connexion

- [x] Initialiser le projet React + Vite dans `/client` avec Tailwind CSS et Framer Motion
- [x] Créer le composant `App.jsx` avec routing simple : écran d'accueil / écran de jeu
- [x] Créer l'écran d'accueil `HomeScreen.jsx` : bouton "Créer une partie" + champ pour rejoindre via code
- [x] Connecter Socket.io côté client, gérer les événements `game_state` et `game_over`
- [x] Créer le store d'état global du jeu (React Context ou Zustand) pour stocker l'état reçu du serveur
- [x] Afficher un lien/code partageable après création de la room (copie en un clic)
- [x] Afficher un écran d'attente animé tant que le deuxième joueur n'a pas rejoint
- [x] Refaire l'UI de `HomeScreen.jsx` — garder la logique existante, changer uniquement le visuel avec exactement ces éléments dans cet ordre :
  1. Champ texte "Ton pseudo" en premier (obligatoire, max 20 caractères) — boutons désactivés si pseudo vide
  2. Bouton "Créer une partie"
  3. Séparateur "ou" centré
  4. Champ "Code de la partie" + bouton "Rejoindre" sur la même ligne
  - Design épuré, centré verticalement, fond sombre, aucun autre élément superflu
  - Si l'URL contient `?room=`, pré-remplir le champ code automatiquement

## Phase 3 : Frontend — Table de jeu

- [x] Créer le composant `GameTable.jsx` : layout principal de la table de jeu
- [x] Afficher la pile du joueur local en bas de l'écran (carte du dessus face cachée + compteur de cartes)
- [x] Afficher la pile de l'adversaire en haut de l'écran (carte du dessus face cachée + compteur de cartes)
- [x] Afficher la zone centrale pour les cartes jouées (cartes retournées face visible)
- [x] Créer le composant `Card.jsx` : rendu visuel d'une carte (valeur + couleur + suit symbol) avec face cachée / face visible
- [x] Les cartes rouges (♥ ♦) s'affichent en rouge, les cartes noires (♠ ♣) en noir/blanc
- [x] Bouton "Retourner" pour le joueur local, désactivé si déjà cliqué ce tour

## Phase 4 : Frontend — Animations

- [x] Animation de distribution initiale : les cartes "volent" vers les piles au démarrage
- [x] Animation de retournement de carte : flip 3D (rotateY 0° → 180°) au moment où la carte est révélée
- [x] Animation de déplacement : les cartes gagnées "glissent" vers la pile du vainqueur
- [x] Animation de bataille : les cartes cachées se posent une par une avec un léger délai entre chaque
- [x] Effet visuel distinct pour signaler une "Bataille !" (flash, shake, ou texte animé au centre)
- [x] Animation de fin de partie : confettis ou effet de victoire/défaite
- [x] Indicateur visuel quand l'adversaire a cliqué "Retourner" (ex: card qui tremble sur sa pile)

## Phase 5 : Polish et UX

- [x] Ajouter les noms des joueurs (saisi à l'entrée, affiché sur la table)
- [x] Afficher l'historique des 5 derniers tours dans un bandeau latéral (ex: "Tour 12 - Bataille ! +10 cartes")
- [x] Afficher un message de résultat clair sur la carte gagnante/perdante avant qu'elles bougent
- [x] Responsive design : fonctionne sur mobile et desktop
- [x] Ajouter un bouton "Rejouer" sur l'écran de fin qui relance une nouvelle partie dans la même room
- [x] Créer un `README.md` avec les instructions de lancement (`npm run dev` client + server)

## Phase 6 : Build et mise en ligne

- [x] Configurer Express pour servir les fichiers statiques de `/client/dist` en production (même port pour Socket.io + frontend)
- [x] Ajouter un script `build` à la racine : build le client (`vite build`) puis démarre le serveur en mode production
- [x] Créer un `Dockerfile` à la racine : installe les dépendances, build le client, expose le port 3000, démarre le serveur
- [x] Créer un `docker-compose.yml` pour lancer le tout avec `docker-compose up`
- [x] Ajouter une section "Jouer avec un ami" dans le `README.md` avec 3 options :
  - **Option A - Render.com (gratuit)** : instructions pas-à-pas pour déployer le repo (build command, start command, port)
  - **Option B - Docker VPS** : `docker-compose up -d` sur n'importe quel VPS avec Docker
  - **Option C - ngrok local** : `ngrok http 3000` pour partager sa machine locale sans serveur