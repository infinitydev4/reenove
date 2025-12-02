# 🔄 Changelog - Système de Tarification

## Version 1.0.0 - Décembre 2024

### ✨ Nouveautés

#### Système de tarification centralisé
- **Nouveau fichier** : `lib/config/pricingConfig.ts`
  - Configuration complète des tarifs BTP 2025
  - 9 catégories de travaux avec tarifs détaillés
  - Plus de 50 types de services différents
  - Prix basés sur les tarifs indicatifs du marché français

#### Fonctionnalités principales

1. **Calcul intelligent des prix**
   - Calcul à la surface pour les travaux au m² (peinture, carrelage, etc.)
   - Calcul unitaire pour les interventions ponctuelles
   - Ajustement automatique selon la complexité du projet
   - Prix minimum métier pour garantir la qualité

2. **Recherche intelligente**
   - Correspondance exacte des types de services
   - Correspondance partielle avec normalisation
   - Fallback automatique sur les tarifs par défaut
   - Gestion des accents et variations d'écriture

3. **Facteurs de prix**
   - Détection automatique de la complexité dans les descriptions
   - Liste personnalisée de facteurs influençant le prix par service
   - Multiplicateurs contextuels (urgence, qualité, etc.)

### 📝 Fichiers créés

```
lib/config/
├── pricingConfig.ts              # ⭐ Configuration des tarifs
├── serviceTypeMapping.ts         # Mapping et exemples
├── PRICING-README.md            # Documentation détaillée
└── __tests__/
    └── pricingConfig.test.ts    # Tests unitaires

scripts/
└── test-pricing.ts              # Script de test des estimations
```

### 🔧 Fichiers modifiés

#### `lib/services/langchainConversationService.ts`
- ✅ Import des fonctions de pricing
- ✅ Remplacement de `generatePriceEstimation()` par le nouveau système
- ✅ Logs détaillés pour le débogage
- ✅ Calculs précis basés sur les tarifs réels

**Avant** (ligne 2253-2275) :
```typescript
private async generatePriceEstimation(): Promise<EstimatedPrice> {
  let basePrice = 500;
  
  if (category.includes('plomberie')) {
    basePrice = 300;
  }
  // ...prix hardcodés très basiques
  
  return {
    min: Math.floor(basePrice * 0.7),
    max: Math.ceil(basePrice * 1.5),
    factors: ['Complexité', 'Matériaux', 'Temps']
  };
}
```

**Après** :
```typescript
private async generatePriceEstimation(): Promise<EstimatedPrice> {
  // Recherche du pricing dans la configuration
  const pricing = findClosestPricing(category, serviceType);
  
  // Calcul intelligent avec surface ou unitaire
  // Ajustement selon la complexité
  // Application des prix minimum métier
  
  return {
    min: calculatedMin,
    max: calculatedMax,
    factors: pricing.factors // Facteurs spécifiques au service
  };
}
```

### 📊 Tarifs par catégorie

#### Plomberie
- Réparer un robinet : 137-200€
- Réparer une fuite : 150-400€
- Refaire canalisations : 37-50€/m²
- Installer chauffe-eau : 504-800€
- Installer douche : 998-2800€

#### Électricité
- Tableau électrique : 630-900€
- Prises (unitaire) : 74-100€
- Luminaires : 63-150€
- Mise aux normes : 25-100€/m²

#### Peinture
- Murs : 15-20€/m²
- Plafond : 13-18€/m²
- Boiseries : 25-35€/m²
- Rénovation complète : 20-30€/m²

#### Menuiserie
- Placard : 252-400€/ml
- Parquet stratifié : 25-40€/m²
- Parquet massif : 63-85€/m²
- Étagères : 150-400€/ml

#### Maçonnerie
- Mur parpaings : 68-90€/m²
- Cloison BA13 : 47-65€/m²
- Dalle béton : 79-110€/m²
- Façade enduit : 37-60€/m²

#### Salle de bain
- Rénovation complète : 800-1500€/m²
- Douche standard : 998-1500€
- Douche italienne : 1995-2800€
- Carrelage : 40-65€/m²

#### Portes et fenêtres
- Bloc-porte : 179-700€
- Fenêtre PVC : 546-750€
- Fenêtre ALU : 819-1100€
- Volets roulants : 546-800€

#### Jardinage
- Pelouse : 15-25€/m²
- Aménagement paysager : 50-150€/m²
- Plantation arbres : 100-400€/u
- Terrasse bois : 126-180€/m²

#### Rénovation générale
- Rénovation complète : 400-1200€/m²
- Agrandissement : 1200-2500€/m²
- Isolation thermique : 17-150€/m²
- Aménagement combles : 800-1500€/m²

### 🧪 Tests

#### Tests unitaires créés
- ✅ Normalisation des types de services
- ✅ Extraction des valeurs de surface
- ✅ Calcul du multiplicateur de complexité
- ✅ Recherche de pricing (exact, partiel, fallback)
- ✅ Validation de la structure de configuration
- ✅ Cohérence des prix (min ≤ base ≤ max)
- ✅ Cas d'usage réels pour chaque catégorie

#### Script de test
```bash
npx ts-node scripts/test-pricing.ts
```

### 📈 Améliorations par rapport à l'ancien système

| Fonctionnalité | Avant | Après |
|---|---|---|
| Nombre de tarifs | 4 catégories basiques | 9 catégories × ~6 services = 54+ tarifs |
| Précision des prix | ±30% | Basé sur tarifs BTP 2025 réels |
| Calcul surface | ❌ Non supporté | ✅ Calcul automatique au m² |
| Prix minimum | ❌ Aucun | ✅ Prix minimum métier par service |
| Facteurs de prix | Génériques | Spécifiques à chaque service |
| Complexité | ❌ Non prise en compte | ✅ Détection automatique |
| Maintenance | Hardcodé dans le code | Configuration centralisée |
| Tests | ❌ Aucun | ✅ Suite complète de tests |

### 🔍 Exemples de calculs

#### Exemple 1 : Peinture salon 35m²
```
Input:
- Catégorie: "Peinture"
- Service: "repeindre les murs"
- Surface: "35 m²"
- Description: "Repeindre le salon"

Calcul:
- Prix au m²: 15-20€
- 35 m² × 15-20€ = 525-700€

Résultat: 525€ - 700€
```

#### Exemple 2 : Réparation robinet urgent
```
Input:
- Catégorie: "Plomberie"
- Service: "réparer un robinet"
- Description: "Robinet cuisine fuit urgent"

Calcul:
- Prix base: 137-200€
- Complexité "urgent": ×1.2
- 137×1.2 = 164€ à 200×1.2 = 240€

Résultat: 164€ - 240€
```

#### Exemple 3 : Rénovation salle de bain 6m²
```
Input:
- Catégorie: "Salle de bain"
- Service: "rénovation complète"
- Surface: "6 m²"

Calcul:
- Prix au m²: 800-1500€
- 6 m² × 800-1500€ = 4800-9000€
- Prix minimum: 3000€ → déjà respecté

Résultat: 4800€ - 9000€
```

### 🚀 Impact

#### Pour les utilisateurs
- ✅ Estimations plus précises et réalistes
- ✅ Facteurs de prix transparents et personnalisés
- ✅ Confiance accrue dans les estimations

#### Pour les artisans
- ✅ Tarifs alignés sur le marché
- ✅ Moins de négociations dues à des estimations irréalistes
- ✅ Meilleure qualification des projets

#### Pour le développement
- ✅ Code maintenable et testable
- ✅ Ajout facile de nouveaux services
- ✅ Mise à jour annuelle simplifiée des tarifs

### 📚 Documentation

- **Guide d'utilisation** : `lib/config/PRICING-README.md`
- **Exemples de mapping** : `lib/config/serviceTypeMapping.ts`
- **Tests** : `lib/config/__tests__/pricingConfig.test.ts`
- **Script de test** : `scripts/test-pricing.ts`

### 🔜 Prochaines étapes

1. ✅ **Déploiement** : Tester en production avec des projets réels
2. ⏳ **Monitoring** : Suivre la précision des estimations vs devis réels
3. ⏳ **Ajustements** : Affiner les tarifs selon les retours terrain
4. ⏳ **Extension** : Ajouter plus de variations de services
5. ⏳ **Régionalisation** : Ajuster les prix selon les régions (optionnel)

### 🐛 Corrections

Aucun bug connu. Le système est stable et prêt pour la production.

---

**Date** : Décembre 2024  
**Auteur** : Équipe Reenove  
**Version** : 1.0.0

