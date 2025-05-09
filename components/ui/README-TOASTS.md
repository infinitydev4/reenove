# Guide d'utilisation des Toasts avec Sonner

## Introduction

Ce projet utilise désormais [Sonner](https://sonner.emilkowal.ski/) pour gérer les notifications toast. Cette bibliothèque remplace notre système de toast précédent pour une meilleure expérience utilisateur et une plus grande facilité d'utilisation.

## Comment utiliser les toasts

### Méthode 1 : Utilisation directe de Sonner (recommandée)

```tsx
import { toast } from 'sonner';

// Toast simple
toast('Notification simple');

// Toast avec titre et description
toast('Titre', {
  description: 'Description plus détaillée'
});

// Toast d'erreur
toast.error('Une erreur est survenue');

// Toast de succès
toast.success('Opération réussie');

// Plus d'options
toast('Notification', {
  description: 'Description',
  duration: 5000, // 5 secondes
  icon: '👋',
  action: {
    label: 'Annuler',
    onClick: () => console.log('Action annulée')
  }
});
```

### Méthode 2 : Utilisation via le hook useToast (compatibilité)

Pour assurer la compatibilité avec le code existant, vous pouvez continuer à utiliser le hook `useToast` :

```tsx
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const handleClick = () => {
    toast({
      title: "Notification",
      description: "Description de la notification",
      variant: "default", // ou "destructive" pour les erreurs
      duration: 3000
    });
  };
  
  return <button onClick={handleClick}>Afficher toast</button>;
}
```

### Méthode 3 : Utilisation de la fonction toast de use-toast

Vous pouvez également importer directement la fonction toast depuis use-toast :

```tsx
import { toast } from '@/components/ui/use-toast';

function MyComponent() {
  const handleClick = () => {
    toast({
      title: "Notification",
      description: "Description de la notification",
      variant: "default", // ou "destructive" pour les erreurs
    });
  };
  
  return <button onClick={handleClick}>Afficher toast</button>;
}
```

## Configuration

Le Toaster est déjà configuré dans `app/layout.tsx` avec les options suivantes :

```tsx
<Toaster richColors closeButton position="bottom-right" />
```

## Documentation complète

Pour plus d'options et de fonctionnalités avancées, consultez la documentation officielle de Sonner :
https://sonner.emilkowal.ski/ 