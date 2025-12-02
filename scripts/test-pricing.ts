/**
 * Script de test pour le système de pricing
 * Usage: npx ts-node scripts/test-pricing.ts
 */

import { 
  findClosestPricing, 
  extractSurfaceValue, 
  getComplexityMultiplier 
} from '../lib/config/pricingConfig';

interface TestCase {
  category: string;
  serviceType: string;
  surfaceArea?: string;
  description: string;
}

const testCases: TestCase[] = [
  {
    category: 'Peinture',
    serviceType: 'repeindre les murs',
    surfaceArea: '35 m²',
    description: 'Je veux repeindre le salon en blanc'
  },
  {
    category: 'Plomberie',
    serviceType: 'réparer un robinet',
    description: 'Mon robinet de cuisine fuit'
  },
  {
    category: 'Électricité',
    serviceType: 'changer le tableau électrique',
    description: 'Remplacement complet et urgent du tableau'
  },
  {
    category: 'Salle de bain',
    serviceType: 'rénovation complète salle de bain',
    surfaceArea: '6 m²',
    description: 'Rénovation complète de la salle de bain'
  },
  {
    category: 'Menuiserie',
    serviceType: 'poser du parquet',
    surfaceArea: '40 m²',
    description: 'Pose de parquet massif dans le salon'
  },
  {
    category: 'Maçonnerie',
    serviceType: 'construire un mur',
    surfaceArea: '15 m²',
    description: 'Construction d\'un mur de séparation'
  },
  {
    category: 'Rénovation générale',
    serviceType: 'rénovation complète',
    surfaceArea: '80 m²',
    description: 'Rénovation complète d\'un appartement T3'
  }
];

function calculatePrice(testCase: TestCase): void {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 TEST: ${testCase.category} - ${testCase.serviceType}`);
  console.log('='.repeat(80));
  console.log(`📝 Description: ${testCase.description}`);
  if (testCase.surfaceArea) {
    console.log(`📐 Surface: ${testCase.surfaceArea}`);
  }
  
  // Trouver le pricing
  const pricing = findClosestPricing(testCase.category, testCase.serviceType);
  
  if (!pricing) {
    console.log('❌ Aucun pricing trouvé!');
    return;
  }
  
  console.log(`\n✅ Pricing trouvé: ${pricing.baseRanges[0].description}`);
  console.log(`📊 Unité: ${pricing.baseRanges[0].unit}`);
  console.log(`💰 Prix de base: ${pricing.baseRanges[0].min}€ - ${pricing.baseRanges[0].max}€`);
  
  let min = 0;
  let max = 0;
  
  // Calcul avec surface si applicable
  if (testCase.surfaceArea && pricing.surfaceMultiplier) {
    const surface = extractSurfaceValue(testCase.surfaceArea);
    if (surface) {
      const baseRange = pricing.baseRanges[0];
      min = Math.floor(baseRange.min * surface);
      max = Math.ceil(baseRange.max * surface);
      console.log(`\n📐 Calcul avec surface:`);
      console.log(`   ${surface} m² × ${baseRange.min}-${baseRange.max}€/m² = ${min}-${max}€`);
    }
  }
  
  // Calcul unitaire avec complexité
  if (min === 0 && max === 0) {
    const range = pricing.baseRanges[0];
    min = range.min;
    max = range.max;
    
    const complexityMultiplier = getComplexityMultiplier(testCase.description);
    
    if (complexityMultiplier !== 1.0) {
      min = Math.floor(min * complexityMultiplier);
      max = Math.ceil(max * complexityMultiplier);
      console.log(`\n🔧 Calcul unitaire avec ajustement complexité:`);
      console.log(`   Base: ${range.min}-${range.max}€`);
      console.log(`   Multiplicateur: ×${complexityMultiplier.toFixed(2)}`);
      console.log(`   Résultat: ${min}-${max}€`);
    } else {
      console.log(`\n🔧 Calcul unitaire: ${min}-${max}€`);
    }
  }
  
  // Application du prix minimum
  if (pricing.minJobPrice) {
    const originalMin = min;
    min = Math.max(pricing.minJobPrice, min);
    max = Math.max(min + 100, max);
    
    if (originalMin < pricing.minJobPrice) {
      console.log(`\n✅ Prix minimum métier appliqué: ${pricing.minJobPrice}€`);
    }
  }
  
  // Résultat final
  console.log(`\n💰 ESTIMATION FINALE: ${min}€ - ${max}€`);
  console.log(`\n📋 Facteurs influençant le prix:`);
  pricing.factors.forEach((factor, index) => {
    console.log(`   ${index + 1}. ${factor}`);
  });
}

// Exécuter tous les tests
console.log('\n');
console.log('🧪 TESTS DU SYSTÈME DE PRICING REENOVE');
console.log(''.padEnd(80, '═'));

testCases.forEach(calculatePrice);

console.log('\n' + '='.repeat(80));
console.log('✅ Tous les tests terminés');
console.log('='.repeat(80) + '\n');

// Export pour utilisation en tant que module
export { calculatePrice, testCases };

