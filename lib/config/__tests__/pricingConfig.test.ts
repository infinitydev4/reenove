/**
 * Tests unitaires pour le système de pricing
 */

import {
  findClosestPricing,
  normalizeServiceType,
  PRICING_CONFIG
} from '../pricingConfig';

// Helper functions pour les tests
function extractSurfaceValue(surface: string | undefined): number | null {
  if (!surface) return null;
  const match = surface.replace(/[^\d.]/g, '');
  const value = parseFloat(match);
  return isNaN(value) ? null : value;
}

function getComplexityMultiplier(description: string): number {
  const lowerDesc = description.toLowerCase();
  const highComplexity = ['complet', 'complexe', 'important', 'grande', 'nombreux', 'difficile', 'urgent'];
  const lowComplexity = ['simple', 'petit', 'basique', 'standard', 'rapide', 'léger'];
  
  let multiplier = 1.0;
  
  for (const word of highComplexity) {
    if (lowerDesc.includes(word)) {
      multiplier += 0.3;
      break;
    }
  }
  
  for (const word of lowComplexity) {
    if (lowerDesc.includes(word)) {
      multiplier -= 0.2;
      break;
    }
  }
  
  return Math.max(0.7, Math.min(1.8, multiplier));
}

describe('pricingConfig', () => {
  describe('normalizeServiceType', () => {
    it('devrait normaliser les accents et la casse', () => {
      expect(normalizeServiceType('Réparer un Robinet')).toBe('reparer un robinet');
      expect(normalizeServiceType('Électricité')).toBe('electricite');
      expect(normalizeServiceType('Création d\'étagères')).toBe('creation d\'etageres');
    });

    it('devrait normaliser les espaces multiples', () => {
      expect(normalizeServiceType('installer   des   prises')).toBe('installer des prises');
    });
  });

  describe('extractSurfaceValue', () => {
    it('devrait extraire la valeur numérique', () => {
      expect(extractSurfaceValue('25 m²')).toBe(25);
      expect(extractSurfaceValue('35m²')).toBe(35);
      expect(extractSurfaceValue('12.5 m²')).toBe(12.5);
      expect(extractSurfaceValue('100')).toBe(100);
    });

    it('devrait retourner null pour les valeurs invalides', () => {
      expect(extractSurfaceValue('')).toBeNull();
      expect(extractSurfaceValue(undefined)).toBeNull();
      expect(extractSurfaceValue('pas de chiffre')).toBeNull();
    });
  });

  describe('getComplexityMultiplier', () => {
    it('devrait augmenter pour une complexité élevée', () => {
      const multiplier = getComplexityMultiplier('projet très complexe et important');
      expect(multiplier).toBeGreaterThan(1.0);
    });

    it('devrait diminuer pour une complexité faible', () => {
      const multiplier = getComplexityMultiplier('travaux simples et basiques');
      expect(multiplier).toBeLessThan(1.0);
    });

    it('devrait être neutre pour une description standard', () => {
      const multiplier = getComplexityMultiplier('réparation du robinet');
      expect(multiplier).toBeCloseTo(1.0, 1);
    });

    it('devrait rester dans les limites 0.7-1.8', () => {
      const high = getComplexityMultiplier('très très très complexe important urgent difficile');
      const low = getComplexityMultiplier('très simple petit basique rapide léger');
      
      expect(high).toBeLessThanOrEqual(1.8);
      expect(low).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('findClosestPricing', () => {
    it('devrait trouver un pricing exact', () => {
      const pricing = findClosestPricing('Plomberie', 'réparer un robinet');
      expect(pricing).not.toBeNull();
      expect(pricing?.baseRanges[0].description).toContain('Mitigeur');
    });

    it('devrait trouver un pricing avec correspondance partielle', () => {
      const pricing = findClosestPricing('Électricité', 'installer prises');
      expect(pricing).not.toBeNull();
      expect(pricing?.baseRanges[0].description).toContain('Prise');
    });

    it('devrait utiliser le pricing default si aucune correspondance', () => {
      const pricing = findClosestPricing('Plomberie', 'service inconnu');
      expect(pricing).not.toBeNull();
      expect(pricing?.baseRanges[0].description).toContain('standard');
    });

    it('devrait retourner null pour une catégorie inexistante', () => {
      const pricing = findClosestPricing('Catégorie Inexistante', 'service');
      expect(pricing).toBeNull();
    });

    it('devrait gérer les variations d\'accents', () => {
      const pricing = findClosestPricing('Électricité', 'changer le tableau électrique');
      expect(pricing).not.toBeNull();
    });
  });

  describe('PRICING_CONFIG structure', () => {
    it('devrait avoir des catégories valides', () => {
      const categories = Object.keys(PRICING_CONFIG);
      expect(categories).toContain('Plomberie');
      expect(categories).toContain('Électricité');
      expect(categories).toContain('Peinture');
      expect(categories).toContain('Menuiserie');
      expect(categories).toContain('Maçonnerie');
    });

    it('chaque catégorie devrait avoir un pricing default', () => {
      Object.entries(PRICING_CONFIG).forEach(([category, services]) => {
        expect(services).toHaveProperty('default');
      });
    });

    it('chaque pricing devrait avoir les propriétés requises', () => {
      Object.entries(PRICING_CONFIG).forEach(([category, services]) => {
        Object.entries(services).forEach(([service, pricing]) => {
          expect(pricing).toHaveProperty('baseRanges');
          expect(pricing).toHaveProperty('factors');
          expect(pricing.baseRanges.length).toBeGreaterThan(0);
          expect(pricing.factors.length).toBeGreaterThan(0);
          
          // Vérifier chaque range
          pricing.baseRanges.forEach(range => {
            expect(range).toHaveProperty('min');
            expect(range).toHaveProperty('max');
            expect(range).toHaveProperty('unit');
            expect(range).toHaveProperty('basePrice');
            expect(range).toHaveProperty('description');
            expect(range.min).toBeLessThanOrEqual(range.max);
            expect(range.min).toBeGreaterThan(0);
          });
        });
      });
    });

    it('les prix devraient être cohérents (min <= base <= max)', () => {
      Object.values(PRICING_CONFIG).forEach(services => {
        Object.values(services).forEach(pricing => {
          pricing.baseRanges.forEach(range => {
            expect(range.min).toBeLessThanOrEqual(range.basePrice);
            expect(range.basePrice).toBeLessThanOrEqual(range.max);
          });
        });
      });
    });
  });

  describe('Cas d\'usage réels', () => {
    it('Peinture: repeindre les murs avec surface', () => {
      const pricing = findClosestPricing('Peinture', 'repeindre les murs');
      expect(pricing).not.toBeNull();
      expect(pricing?.surfaceMultiplier).toBe(true);
      expect(pricing?.baseRanges[0].unit).toBe('m²');
      
      // Simulation calcul: 35m² × 15-20€/m²
      const surface = 35;
      const min = pricing!.baseRanges[0].min * surface;
      const max = pricing!.baseRanges[0].max * surface;
      
      expect(min).toBe(525);
      expect(max).toBe(700);
    });

    it('Plomberie: réparer un robinet (unitaire)', () => {
      const pricing = findClosestPricing('Plomberie', 'réparer un robinet');
      expect(pricing).not.toBeNull();
      expect(pricing?.surfaceMultiplier).toBeUndefined();
      
      const min = pricing!.baseRanges[0].min;
      const max = pricing!.baseRanges[0].max;
      
      expect(min).toBeGreaterThanOrEqual(100);
      expect(max).toBeLessThanOrEqual(250);
    });

    it('Électricité: changer tableau avec prix minimum', () => {
      const pricing = findClosestPricing('Électricité', 'changer le tableau électrique');
      expect(pricing).not.toBeNull();
      expect(pricing?.minJobPrice).toBeGreaterThan(0);
      expect(pricing?.minJobPrice).toBeGreaterThanOrEqual(600);
    });

    it('Salle de bain: rénovation complète avec surface', () => {
      const pricing = findClosestPricing('Salle de bain', 'rénovation complète salle de bain');
      expect(pricing).not.toBeNull();
      expect(pricing?.surfaceMultiplier).toBe(true);
      expect(pricing?.minJobPrice).toBeGreaterThanOrEqual(3000);
    });
  });
});

