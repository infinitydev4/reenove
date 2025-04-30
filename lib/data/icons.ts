import * as LucideIcons from "lucide-react";

// Exclure certaines icônes qui ne sont pas pertinentes pour les catégories
const excludedIcons = [
  "Activity", "AlertCircle", "AlertOctagon", "AlertTriangle", "ArrowLeft", 
  "ArrowRight", "ArrowUp", "ArrowDown", "Check", "CheckCircle", "X", "XCircle",
  "Menu", "Loader", "Loader2", "ChevronLeft", "ChevronRight", "ChevronUp", "ChevronDown",
  "MoreHorizontal", "MoreVertical", "Search", "Settings"
];

// Catégories d'icônes pour une meilleure organisation
export const iconCategories = [
  {
    name: "Bâtiment et construction",
    icons: [
      "Construction", "Hammer", "Wrench", "Drill", "Ruler", "RulerSquare", "Hammer", 
      "Building", "Building2", "Warehouse", "Home", "Tent", "Cctv", "Cog", "Gauge", "Axe"
    ]
  },
  {
    name: "Décoration et intérieur",
    icons: [
      "Paintbrush", "Palette", "Lamp", "Sofa", "LampFloor", "LampDesk", "Bath", 
      "ShowerHead", "DoorOpen", "Door", "Window", "Armchair", "Bed"
    ]
  },
  {
    name: "Extérieur et jardin",
    icons: [
      "Trees", "PalmTree", "Mountain", "Shovel", "Fence", "CloudSun", "Cloudy", 
      "Compass", "FlowerBouquet", "Flower", "Flower2", "Garden", "GardenSpade", "Sprout"
    ]
  },
  {
    name: "Outils et équipements",
    icons: [
      "Tool", "Tools", "Wrench", "Hammer", "Screwdriver", "Scissors", "Truck", 
      "Tractor", "Forklift", "Pipe", "PipeCross", "JetWash", "Ladder", "Drill"
    ]
  },
  {
    name: "Énergie et systèmes",
    icons: [
      "Zap", "Lightbulb", "Thermometer", "Fan", "Wifi", "WifiOff", "Signal", 
      "Antenna", "Plug", "PlugZap", "Plug2", "LightbulbOff", "Cable", "Rocket"
    ]
  },
  {
    name: "Business et services",
    icons: [
      "Briefcase", "CalendarDays", "Clock", "Coins", "DollarSign", "FileText", 
      "Files", "HandShake", "HardHat", "Phone", "Mail", "BadgeCheck", "Award", "Medal"
    ]
  }
];

// Liste complète des icônes disponibles
export const availableIcons = Object.keys(LucideIcons)
  .filter(icon => 
    !icon.startsWith("_") && 
    !excludedIcons.includes(icon) && 
    typeof LucideIcons[icon as keyof typeof LucideIcons] === "function"
  )
  .sort();

// Fonction pour obtenir un composant d'icône à partir de son nom
export function getIconByName(iconName: string) {
  // @ts-expect-error - Accès dynamique aux icônes
  return LucideIcons[iconName] || LucideIcons.HelpCircle;
}

// Liste des icônes favorites/recommandées pour les catégories
export const recommendedCategoryIcons = [
  "Wrench", "Zap", "Hammer", "Paintbrush", "Construction", "Bath", 
  "DoorOpen", "Trees", "Home", "Tool", "Briefcase", "Building", 
  "Warehouse", "Truck", "Thermometer", "Lightbulb", "Ruler", "Scissors"
]; 