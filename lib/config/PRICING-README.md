# 💰 Système de Tarification BTP - Reenove

## 📋 Vue d'ensemble

Ce système centralise tous les tarifs BTP 2025 utilisés pour générer les estimations de prix dans l'application Reenove. Il est basé sur les tarifs indicatifs du marché français.

## 🏗️ Architecture

```
lib/config/
├── pricingConfig.ts           # Configuration des tarifs
└── PRICING-README.md          # Documentation (ce fichier)

lib/services/
└── langchainConversationService.ts  # Utilise les tarifs pour générer les estimations
```

## 📁 Structure des données

### PriceRange
Définit une fourchette de prix pour un type de travaux :

```typescript
{
  min: number;           // Prix minimum (€)
  max: number;           // Prix maximum (€)
  unit: 'm²' | 'ml' | 'u' | 'm³';  // Unité de mesure
  basePrice: number;     // Prix de base pour calculs
  description: string;   // Description du poste
}
```

### ServicePricing
Configuration complète d'un type de service :

```typescript
{
  baseRanges: PriceRange[];      // Liste de fourchettes de prix
  factors: string[];             // Facteurs influençant le prix
  surfaceMultiplier?: boolean;   // Si true, multiplier par la surface
  minJobPrice?: number;          // Prix minimum pour ce type d'intervention
}
```

## 🎯 Logique de calcul des prix

### 1. Recherche du pricing correspondant

La fonction `findClosestPricing(category, serviceType)` recherche :
1. **Correspondance exacte** : "installer des prises" → "installer des prises"
2. **Correspondance partielle** : "installer prises" → "installer des prises"
3. **Fallback** : Utilise le pricing "default" de la catégorie

### 2. Calcul du prix

#### Cas A : Travaux à la surface (surfaceMultiplier = true)
```
Prix = surface (m²) × prix_au_m²
Exemple : 25 m² × 15€/m² = 375€
```

#### Cas B : Travaux unitaires (surfaceMultiplier = false)
```
Prix = prix_unitaire × multiplicateur_complexité
Exemple : 630€ × 1.2 = 756€
```

### 3. Ajustements automatiques

- **Complexité** : Détectée via des mots-clés dans la description
  - Mots complexes : "complet", "important", "urgent" → +20-30%
  - Mots simples : "simple", "basique", "standard" → -15-20%

- **Prix minimum métier** : Garantit un seuil minimum par type d'intervention
  - Ex: Rénovation salle de bain min. 3000€

## 📊 Exemples d'utilisation

### Exemple 1 : Peinture avec surface
```typescript
Projet:
- Catégorie: "Peinture"
- Service: "repeindre les murs"
- Surface: "35 m²"
- Description: "Repeindre le salon"

Calcul:
- Prix au m²: 15-20€
- Surface: 35 m²
- Résultat: 525€ - 700€
```

### Exemple 2 : Plomberie unitaire
```typescript
Projet:
- Catégorie: "Plomberie"
- Service: "réparer un robinet"
- Description: "Robinet de cuisine qui fuit"

Calcul:
- Prix unitaire: 137-200€
- Complexité: Standard (×1.0)
- Résultat: 137€ - 200€
```

### Exemple 3 : Électricité avec complexité
```typescript
Projet:
- Catégorie: "Électricité"
- Service: "changer le tableau électrique"
- Description: "Remplacement complet et urgent du tableau"

Calcul:
- Prix unitaire: 630-900€
- Complexité: Élevée (×1.3)
- Résultat: 819€ - 1170€
```

## 🔧 Comment ajouter un nouveau tarif

### 1. Identifier la catégorie et le service
```typescript
'Plomberie': {
  'nouveau_service': {  // ← Nom du service (en minuscules, normalisé)
    // Configuration...
  }
}
```

### 2. Définir les fourchettes de prix
```typescript
baseRanges: [
  { 
    min: 100,           // Prix minimum
    max: 200,           // Prix maximum
    unit: 'u',          // Unité (u = unitaire, m² = mètre carré, ml = mètre linéaire)
    basePrice: 150,     // Prix de référence
    description: 'Description précise du poste'
  }
]
```

### 3. Spécifier les facteurs de prix
```typescript
factors: [
  'Premier facteur influençant le prix',
  'Deuxième facteur',
  'Troisième facteur'
]
```

### 4. Ajouter les options
```typescript
surfaceMultiplier: true,  // Si le prix dépend de la surface
minJobPrice: 300          // Prix minimum d'intervention
```

## 📝 Maintenance

### Mise à jour des prix

Les prix doivent être mis à jour annuellement pour refléter :
- L'inflation
- L'évolution du coût des matériaux
- Les changements du marché BTP

### Vérification de cohérence

Avant de déployer des modifications :

1. **Vérifier les calculs** : Tester avec différentes surfaces/configurations
2. **Comparer avec le marché** : S'assurer que les prix restent compétitifs
3. **Tester les cas limites** : Très petites surfaces, projets complexes, etc.

## 🐛 Débogage

Les logs de calcul sont disponibles dans la console :

```
💰 === GÉNÉRATION ESTIMATION PRIX ===
📂 Catégorie: Peinture
🔧 Type de service: repeindre les murs
📐 Surface: 35 m²
✅ Pricing trouvé: Impression + 2 couches murs - acrylique
📐 Calcul basé sur surface: 35m² × 15-20€/m² = 525-700€
💰 ESTIMATION FINALE: 525€ - 700€
```

## 🔗 Références

- **Tarifs BTP 2025** : Basés sur les tarifs indicatifs du marché français
- **Configuration** : `/lib/config/pricingConfig.ts`
- **Utilisation** : `/lib/services/langchainConversationService.ts`

---

**Date de dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0

