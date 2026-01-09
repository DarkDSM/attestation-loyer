# Attestation de Loyer - Générateur PDF

Application web pour générer des attestations de loyer en PDF.

## Installation

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Démarrer : `npm start`

## Configuration

1. Place ton fichier `attestation.png` dans le dossier
2. Dans `server.js`, modifie les positions X,Y pour chaque champ
3. Décommente la ligne `doc.image()` pour ajouter ton PNG en fond

## Accès

- Interface : http://localhost:3000
- Génération PDF : POST http://localhost:3000/generate-pdf
