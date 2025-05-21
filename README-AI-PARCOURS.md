# Parcours de Création de Projet avec Assistant IA pour Renoveo

Ce document explique le fonctionnement du nouveau parcours de création de projet assisté par IA dans l'application Renoveo.

## Fonctionnalités

Le nouveau parcours offre une expérience conversationnelle avec les caractéristiques suivantes :

1. **Interface de chat moderne** - Interface conversationnelle intuitive avec l'assistant IA
2. **Processus simplifié en 3 étapes** :
   - **Localisation** - Saisie de l'adresse du projet avec suggestion Google Maps
   - **Catégorie et Service** - Sélection simplifiée par choix multiples
   - **Description détaillée** - Description libre des besoins
3. **Intelligence Artificielle** :
   - Génération automatique d'un titre pour le projet
   - Questions pertinentes basées sur le contexte (2-3 questions maximum)
   - Estimation de budget basée sur les informations fournies
4. **Résumé clair** - Récapitulatif visuel avant validation finale

## Technologie

Le parcours utilise :

- **OpenAI GPT-4o** - Pour l'intelligence conversationnelle
- **LangChain** - Pour la gestion du contexte et des interactions
- **Next.js API Routes** - Pour les appels sécurisés à l'API OpenAI
- **Interface moderne** - Design cohérent avec les couleurs de Renoveo (#0E261C et #FCDA89)

## Configuration

Pour utiliser ce parcours, vous devez configurer une clé API OpenAI :

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez votre clé API OpenAI : `OPENAI_API_KEY=votre-clé-api`
3. Redémarrez le serveur de développement

## Avantages

- **Expérience utilisateur améliorée** - Moins d'étapes, plus intuitif
- **Engagement accru** - Format conversationnel plus naturel
- **Réduction du taux d'abandon** - Parcours plus court et guidé
- **Pertinence améliorée** - Questions adaptées au contexte
- **Meilleure qualité de données** - Projets mieux décrits grâce aux suggestions de l'IA

## Accès

Le parcours est accessible via :

- La page d'accueil, bouton "Créer avec l'IA"
- L'URL directe : `/create-project-ai`

## Améliorations futures

- Intégration plus profonde avec LangChain pour des capacités de raisonnement avancées
- Ajout de fonctionnalités de génération d'images pour visualiser les projets
- Extension des capacités d'estimation de budget avec des données historiques
- Personnalisation des questions en fonction de la catégorie de projet 