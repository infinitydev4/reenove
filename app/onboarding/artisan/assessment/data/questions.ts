export const questions = [
  {
    id: "experience",
    title: "Expérience professionnelle",
    description: "Questions sur votre parcours professionnel",
    questions: [
      {
        id: "years_experience",
        type: "single-choice",
        text: "Depuis combien d'années exercez-vous votre métier ?",
        category: "Expérience",
        maxValue: 4,
        options: [
          { id: "less_1", text: "Moins d'1 an", value: 1 },
          { id: "1_3", text: "1 à 3 ans", value: 2 },
          { id: "3_5", text: "3 à 5 ans", value: 3 },
          { id: "more_5", text: "Plus de 5 ans", value: 4 }
        ]
      },
      {
        id: "projects_completed",
        type: "single-choice",
        text: "Combien de projets avez-vous réalisés dans votre spécialité ?",
        category: "Expérience",
        maxValue: 3,
        options: [
          { id: "less_10", text: "Moins de 10", value: 1 },
          { id: "10_50", text: "Entre 10 et 50", value: 2 },
          { id: "more_50", text: "Plus de 50", value: 3 }
        ]
      }
    ]
  },
  {
    id: "skills",
    title: "Compétences spécifiques",
    description: "Évaluez vos compétences techniques",
    questions: [
      {
        id: "specific_skills",
        type: "multiple-choice",
        text: "Dans votre spécialité, quelles tâches maîtrisez-vous parfaitement ?",
        category: "Compétences techniques",
        maxValue: 10,
        options: [
          { id: "basic", text: "Travaux basiques et courants", value: 1 },
          { id: "medium", text: "Installations complexes", value: 2 },
          { id: "advanced", text: "Rénovation complète", value: 3 },
          { id: "expert", text: "Projets spécialisés ou haut de gamme", value: 4 }
        ]
      },
      {
        id: "team_lead",
        type: "single-choice",
        text: "Êtes-vous capable de superviser une équipe sur un chantier ?",
        category: "Gestion d'équipe",
        maxValue: 3,
        options: [
          { id: "yes", text: "Oui", value: 3 },
          { id: "no", text: "Non", value: 0 }
        ]
      }
    ]
  },
  {
    id: "certifications",
    title: "Certifications et formations",
    description: "Vos qualifications et certifications professionnelles",
    questions: [
      {
        id: "certifications",
        type: "multiple-choice",
        text: "Avez-vous obtenu des certifications professionnelles reconnues ?",
        category: "Certifications",
        maxValue: 6,
        options: [
          { id: "rge", text: "RGE (Reconnu Garant de l'Environnement)", value: 2 },
          { id: "qualibat", text: "Qualibat", value: 2 },
          { id: "specific", text: "Certification spécifique à mon métier", value: 2 },
          { id: "none", text: "Non, aucune certification particulière", value: 0 }
        ]
      },
      {
        id: "certifications_details",
        type: "text",
        text: "Si vous avez des certifications, précisez lesquelles et depuis quand :",
        category: "Certifications",
        maxValue: 0
      }
    ]
  },
  {
    id: "quality",
    title: "Méthodologie et qualité",
    description: "Votre approche de la qualité",
    questions: [
      {
        id: "quality_methods",
        type: "multiple-choice",
        text: "Comment garantissez-vous la qualité de votre travail ?",
        category: "Contrôle qualité",
        maxValue: 5,
        options: [
          { id: "materials", text: "Utilisation de matériaux certifiés", value: 1 },
          { id: "standards", text: "Respect strict des normes", value: 1 },
          { id: "warranty", text: "Garantie après travaux", value: 1 },
          { id: "checks", text: "Audits et contrôles qualité", value: 2 }
        ]
      },
      {
        id: "standards",
        type: "single-choice",
        text: "Travaillez-vous selon des normes spécifiques (ex: normes RT, DTU, etc.) ?",
        category: "Contrôle qualité",
        maxValue: 3,
        options: [
          { id: "always", text: "Systématiquement", value: 3 },
          { id: "often", text: "Souvent", value: 2 },
          { id: "sometimes", text: "Parfois", value: 1 },
          { id: "never", text: "Rarement ou jamais", value: 0 }
        ]
      }
    ]
  },
  {
    id: "practical",
    title: "Questions pratiques",
    description: "Vos conditions d'intervention",
    questions: [
      {
        id: "equipment",
        type: "single-choice",
        text: "Êtes-vous équipé pour intervenir seul sur un chantier (véhicule, outillage complet) ?",
        category: "Équipement",
        maxValue: 2,
        options: [
          { id: "yes", text: "Oui, j'ai tout l'équipement nécessaire", value: 2 },
          { id: "partial", text: "Partiellement, certains outils me manquent", value: 1 },
          { id: "no", text: "Non", value: 0 }
        ]
      },
      {
        id: "availability",
        type: "single-choice",
        text: "En combien de temps êtes-vous généralement disponible pour commencer un nouveau projet ?",
        category: "Disponibilité",
        maxValue: 3,
        options: [
          { id: "less_week", text: "Moins d'une semaine", value: 3 },
          { id: "1_2_weeks", text: "1 à 2 semaines", value: 2 },
          { id: "more_2_weeks", text: "Plus de 2 semaines", value: 1 }
        ]
      }
    ]
  },
  {
    id: "self_evaluation",
    title: "Auto-évaluation",
    description: "Votre propre vision de vos compétences",
    questions: [
      {
        id: "self_evaluation",
        type: "single-choice",
        text: "Comment évalueriez-vous votre niveau de compétence dans votre spécialité principale ?",
        category: "Auto-évaluation",
        maxValue: 4,
        options: [
          { id: "beginner", text: "Débutant", value: 1 },
          { id: "intermediate", text: "Intermédiaire", value: 2 },
          { id: "confirmed", text: "Confirmé", value: 3 },
          { id: "expert", text: "Expert", value: 4 }
        ]
      },
      {
        id: "additional_info",
        type: "text",
        text: "Souhaitez-vous ajouter des informations sur vos compétences ou votre expérience ?",
        category: "Auto-évaluation",
        maxValue: 0
      }
    ]
  }
] 