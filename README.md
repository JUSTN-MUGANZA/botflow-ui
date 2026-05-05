# 🤖 BotFlow UI

**BotFlow UI** est un outil visuel (no-code) de création de flux conversationnels, conçu pour automatiser les interactions sur WhatsApp. 

Ce projet a été réalisé avec une attention particulière à l'expérience utilisateur (UX) et à la qualité du code (React, TypeScript, Zustand, React Flow).

## ✨ Fonctionnalités

### 1. Éditeur de Graphe Nodal (Drag & Drop)
- **4 Types de nœuds :** Message, Question, Condition, Fin.
- **Ajout interactif :** Glissez un nœud depuis le panneau latéral et déposez-le sur le canevas.
- **Connexions fluides :** Reliez les nœuds intuitivement (flèches lissées).
- **Propriétés dynamiques :** Cliquez sur n'importe quel nœud pour modifier son texte en temps réel depuis le panneau latéral.

### 2. Simulateur de Conversation
- **Interface Smartphone :** Testez votre flux instantanément dans un environnement réaliste (style WhatsApp).
- **Parcours automatique :** Le moteur lit le graphe à partir du nœud racine et simule le comportement du bot (délais, animations "en train d'écrire").
- **Choix interactifs :** Les nœuds "Condition" connectés à une "Question" génèrent automatiquement des boutons cliquables dans le simulateur.
- **Validation intelligente :** Avertissements en temps réel si votre flux contient des nœuds isolés ou si une question n'a pas de conditions liées.

### 3. Persistance & Export
- **Sauvegarde Auto (`localStorage`) :** Ne perdez jamais votre travail. Le flux entier est sauvegardé de manière persistante dans votre navigateur grâce à Zustand.
- **Export JSON :** Téléchargez l'intégralité de votre flux dans un fichier JSON structuré pour l'intégrer au backend Karaba.

## 🛠️ Architecture Technique

- **Framework :** [Next.js (App Router)](https://nextjs.org/)
- **Langage :** [TypeScript](https://www.typescriptlang.org/)
- **Style :** [Tailwind CSS](https://tailwindcss.com/)
- **Éditeur Graphe :** [React Flow (@xyflow/react)](https://reactflow.dev/) (Choisi pour sa robustesse absolue en matière d'UI nodale, son support du zoom/pan et de l'accessibilité).
- **State Management :** [Zustand](https://github.com/pmndrs/zustand) (Plus léger que Redux, parfait pour lier le canevas au simulateur sans *prop drilling* excessif et avec le middleware de persistance inclus).
- **Icônes :** [Lucide React](https://lucide.dev/)

## 🚀 Comment lancer le projet localement

### Prérequis
- Node.js 18+
- npm (ou yarn / pnpm)

### Installation

1. Installez les dépendances :
```bash
npm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

3. Ouvrez votre navigateur sur :
**[http://localhost:3000](http://localhost:3000)**

## 💡 Remarques d'implémentation
- **Hygiène de code :** Les composants sont découpés logiquement (`canvas/`, `nodes/`, `simulator/`, `sidebar/`).
- **Modele de données simple :** L'état global stocke les nœuds bruts (`nodes`) et les connexions (`edges`). Le simulateur se charge de l'intelligence de parcours du graphe de manière récursive asynchrone.

---
*Réalisé pour Karaba.*
