import { Wrench, Zap, Hammer, Paintbrush, Construction, Bath, DoorOpen, Trees, Home, Briefcase } from "lucide-react"

// Types pour les catégories et services
export interface CategoryData {
  id: string
  name: string
  icon: string
  description: string
}

export interface ServiceData {
  id: string
  name: string
  description: string
}

// Données statiques des catégories
export const staticCategories: CategoryData[] = [
  { id: "plumbing", name: "Plomberie", icon: "Wrench", description: "Installation, réparation et entretien de systèmes de plomberie" },
  { id: "electricity", name: "Électricité", icon: "Zap", description: "Installation et dépannage électrique" },
  { id: "carpentry", name: "Menuiserie", icon: "Hammer", description: "Fabrication et installation de mobilier et structures en bois" },
  { id: "painting", name: "Peinture", icon: "Paintbrush", description: "Travaux de peinture intérieure et extérieure" },
  { id: "masonry", name: "Maçonnerie", icon: "Construction", description: "Construction et rénovation de structures en pierre, brique ou béton" },
  { id: "bathroom", name: "Salle de bain", icon: "Bath", description: "Rénovation et installation de salles de bain" },
  { id: "doors", name: "Portes et fenêtres", icon: "DoorOpen", description: "Installation et réparation de portes et fenêtres" },
  { id: "landscaping", name: "Jardinage", icon: "Trees", description: "Aménagement paysager et entretien d'espaces verts" },
  { id: "renovation", name: "Rénovation générale", icon: "Home", description: "Rénovation complète ou partielle de bâtiments" },
  { id: "other", name: "Autre", icon: "Briefcase", description: "Autres types de travaux non listés" },
]

// Données statiques des services par catégorie
export const staticServices: Record<string, ServiceData[]> = {
  // Plomberie
  plumbing: [
    { id: "plumb-install", name: "Installation de plomberie", description: "Installation de tuyauterie, robinetterie, etc." },
    { id: "plumb-repair", name: "Réparation de fuite", description: "Détection et réparation de fuites d'eau" },
    { id: "plumb-heating", name: "Installation chauffage", description: "Installation et entretien de systèmes de chauffage" },
    { id: "plumb-bathroom", name: "Plomberie salle de bain", description: "Installation de sanitaires et robinetterie" },
    { id: "plumb-drain", name: "Débouchage canalisations", description: "Nettoyage et débouchage de canalisations" },
    { id: "plumb-water-heater", name: "Chauffe-eau", description: "Installation et réparation de chauffe-eau" },
    { id: "plumb-kitchen", name: "Plomberie cuisine", description: "Installation d'éviers et de robinetterie de cuisine" },
    { id: "plumb-renovation", name: "Rénovation plomberie", description: "Remplacement complet de systèmes de plomberie anciens" },
  ],
  
  // Électricité
  electricity: [
    { id: "elec-install", name: "Installation électrique", description: "Installation de circuits électriques" },
    { id: "elec-repair", name: "Dépannage électrique", description: "Résolution de pannes électriques" },
    { id: "elec-upgrade", name: "Mise aux normes", description: "Mise en conformité des installations électriques" },
    { id: "elec-automation", name: "Domotique", description: "Installation de systèmes domotiques" },
    { id: "elec-lighting", name: "Éclairage", description: "Installation et réparation de systèmes d'éclairage" },
    { id: "elec-panel", name: "Tableau électrique", description: "Installation et mise à niveau de tableaux électriques" },
    { id: "elec-security", name: "Sécurité électrique", description: "Installation d'alarmes et systèmes de sécurité" },
    { id: "elec-outdoor", name: "Électricité extérieure", description: "Installation électrique pour jardins et extérieurs" },
  ],
  
  // Menuiserie
  carpentry: [
    { id: "carp-furniture", name: "Mobilier sur mesure", description: "Création de meubles et mobilier sur mesure" },
    { id: "carp-doors", name: "Portes intérieures", description: "Fabrication et installation de portes" },
    { id: "carp-kitchen", name: "Cuisine sur mesure", description: "Conception et installation de cuisines" },
    { id: "carp-wooden-floor", name: "Parquet et plancher", description: "Installation et rénovation de parquets" },
    { id: "carp-stairs", name: "Escaliers", description: "Fabrication et rénovation d'escaliers en bois" },
    { id: "carp-dressing", name: "Dressing et placards", description: "Création de rangements sur mesure" },
    { id: "carp-structure", name: "Charpente", description: "Travaux de charpente et structures en bois" },
    { id: "carp-repair", name: "Réparation boiserie", description: "Réparation de structures et éléments en bois" },
  ],
  
  // Peinture
  painting: [
    { id: "paint-interior", name: "Peinture intérieure", description: "Travaux de peinture pour murs et plafonds intérieurs" },
    { id: "paint-exterior", name: "Peinture extérieure", description: "Peinture de façades et surfaces extérieures" },
    { id: "paint-decorative", name: "Peinture décorative", description: "Techniques spéciales et peintures décoratives" },
    { id: "paint-wallpaper", name: "Pose de papier peint", description: "Installation de papiers peints et revêtements muraux" },
    { id: "paint-furniture", name: "Peinture de meubles", description: "Rénovation et peinture de mobilier" },
    { id: "paint-floor", name: "Peinture de sol", description: "Peinture et revêtements pour sols" },
    { id: "paint-facade", name: "Ravalement de façade", description: "Nettoyage et peinture complète de façades" },
    { id: "paint-prep", name: "Préparation des surfaces", description: "Préparation et réparation avant peinture" },
  ],
  
  // Maçonnerie
  masonry: [
    { id: "masonry-walls", name: "Construction de murs", description: "Édification de murs en pierre, brique ou parpaing" },
    { id: "masonry-foundation", name: "Fondations", description: "Création et réparation de fondations" },
    { id: "masonry-concrete", name: "Travaux de béton", description: "Coulage et finition de béton" },
    { id: "masonry-repair", name: "Réparation maçonnerie", description: "Réparation de structures en maçonnerie" },
    { id: "masonry-terrace", name: "Terrasse et dalle", description: "Construction de terrasses et dalles en béton" },
    { id: "masonry-stone", name: "Maçonnerie pierre", description: "Travaux de pierre taillée et ornementale" },
    { id: "masonry-extension", name: "Extension", description: "Construction d'extensions de bâtiment" },
    { id: "masonry-renovation", name: "Rénovation maçonnerie", description: "Rénovation complète d'éléments de maçonnerie" },
  ],
  
  // Salle de bain
  bathroom: [
    { id: "bath-renovation", name: "Rénovation complète", description: "Rénovation complète de salle de bain" },
    { id: "bath-shower", name: "Installation de douche", description: "Installation et remplacement de douches" },
    { id: "bath-bathtub", name: "Installation de baignoire", description: "Installation et remplacement de baignoires" },
    { id: "bath-toilet", name: "Installation de WC", description: "Installation et remplacement de toilettes" },
    { id: "bath-sink", name: "Installation de lavabo", description: "Installation et remplacement de lavabos et vasques" },
    { id: "bath-tile", name: "Carrelage salle de bain", description: "Pose de carrelage mural et au sol" },
    { id: "bath-furniture", name: "Meubles de salle de bain", description: "Installation de meubles et rangements" },
    { id: "bath-ventilation", name: "Ventilation", description: "Installation de systèmes de ventilation" },
  ],
  
  // Portes et fenêtres
  doors: [
    { id: "door-entry", name: "Porte d'entrée", description: "Installation et remplacement de portes d'entrée" },
    { id: "door-interior", name: "Portes intérieures", description: "Installation de portes intérieures" },
    { id: "door-window", name: "Fenêtres", description: "Installation et remplacement de fenêtres" },
    { id: "door-sliding", name: "Portes coulissantes", description: "Installation de portes coulissantes et baies vitrées" },
    { id: "door-garage", name: "Porte de garage", description: "Installation et motorisation de portes de garage" },
    { id: "door-shutter", name: "Volets", description: "Installation de volets roulants ou battants" },
    { id: "door-glass", name: "Vitrage", description: "Remplacement et réparation de vitrages" },
    { id: "door-security", name: "Sécurisation", description: "Installation de systèmes de sécurité pour portes et fenêtres" },
  ],
  
  // Jardinage
  landscaping: [
    { id: "land-design", name: "Conception paysagère", description: "Création et aménagement d'espaces verts" },
    { id: "land-planting", name: "Plantation", description: "Plantation d'arbres, arbustes et fleurs" },
    { id: "land-lawn", name: "Création de pelouse", description: "Installation et entretien de pelouses" },
    { id: "land-maintenance", name: "Entretien jardin", description: "Tonte, taille et entretien régulier" },
    { id: "land-irrigation", name: "Système d'arrosage", description: "Installation de systèmes d'irrigation" },
    { id: "land-terrace", name: "Terrasse et patio", description: "Création de terrasses et espaces extérieurs" },
    { id: "land-tree", name: "Élagage d'arbres", description: "Taille et entretien d'arbres" },
    { id: "land-fence", name: "Clôtures et palissades", description: "Installation de clôtures et délimitations" },
  ],
  
  // Rénovation générale
  renovation: [
    { id: "reno-complete", name: "Rénovation complète", description: "Rénovation intégrale de logement" },
    { id: "reno-interior", name: "Rénovation intérieure", description: "Réaménagement d'espaces intérieurs" },
    { id: "reno-kitchen", name: "Rénovation cuisine", description: "Rénovation complète de cuisine" },
    { id: "reno-bathroom", name: "Rénovation salle de bain", description: "Rénovation de salle de bain et salle d'eau" },
    { id: "reno-insulation", name: "Isolation", description: "Amélioration de l'isolation thermique et phonique" },
    { id: "reno-floor", name: "Revêtement de sol", description: "Installation de nouveaux revêtements de sol" },
    { id: "reno-wall", name: "Murs et cloisons", description: "Création et modification de cloisons" },
    { id: "reno-ceiling", name: "Plafonds", description: "Installation et rénovation de plafonds" },
  ],
  
  // Autres services
  other: [
    { id: "other-cleaning", name: "Nettoyage professionnel", description: "Services de nettoyage approfondi" },
    { id: "other-moving", name: "Déménagement", description: "Services de déménagement et manutention" },
    { id: "other-pest", name: "Traitement nuisibles", description: "Lutte contre les nuisibles et parasites" },
    { id: "other-roof", name: "Toiture", description: "Réparation et entretien de toiture" },
    { id: "other-gutter", name: "Gouttières", description: "Installation et nettoyage de gouttières" },
    { id: "other-inspection", name: "Inspection bâtiment", description: "Diagnostic et inspection de bâtiments" },
    { id: "other-handyman", name: "Petit bricolage", description: "Services de bricolage et petites réparations" },
    { id: "other-woodwork", name: "Traitement du bois", description: "Protection et traitement des bois" },
  ],
} 