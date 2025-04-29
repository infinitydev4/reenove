import Pusher from 'pusher';
import PusherClient from 'pusher-js';

/**
 * Configuration Pusher
 * 
 * Pour utiliser Pusher, vous devez créer un compte sur https://pusher.com/
 * et ajouter les variables d'environnement suivantes dans votre fichier .env.local :
 * 
 * PUSHER_APP_ID=votre_app_id
 * PUSHER_KEY=votre_key
 * PUSHER_SECRET=votre_secret
 * PUSHER_CLUSTER=eu (ou votre cluster)
 * 
 * NEXT_PUBLIC_PUSHER_KEY=votre_key
 * NEXT_PUBLIC_PUSHER_CLUSTER=eu (ou votre cluster)
 */

// Configuration côté serveur
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

// Configuration côté client
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  }
);

// Canaux pour les notifications
export const CHANNELS = {
  NOTIFICATIONS: 'notifications',
};

// Événements pour les notifications
export const EVENTS = {
  NEW_NOTIFICATION: 'new-notification',
}; 