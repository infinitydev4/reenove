import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pusherClient, CHANNELS, EVENTS } from '@/lib/pusher';
import { Notification } from '@/lib/types';
import { useSession } from 'next-auth/react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};

// Simule les notifications stockées localement
const getStoredNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : [];
};

// Sauvegarde les notifications dans le stockage local
const storeNotifications = (notifications: Notification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();

  // Charger les notifications stockées au démarrage
  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  // Sauvegarder les notifications lorsqu'elles changent
  useEffect(() => {
    storeNotifications(notifications);
  }, [notifications]);

  // Initialiser la connexion Pusher si l'utilisateur est connecté
  useEffect(() => {
    if (!session?.user) return;

    // S'abonner au canal des notifications
    const channel = pusherClient.subscribe(CHANNELS.NOTIFICATIONS);
    
    // Écouter les nouveaux événements de notification
    channel.bind(EVENTS.NEW_NOTIFICATION, (data: Notification) => {
      addNotification(data);
    });

    // Nettoyage lors du démontage
    return () => {
      pusherClient.unsubscribe(CHANNELS.NOTIFICATIONS);
    };
  }, [session]);

  // Ajouter une nouvelle notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  // Marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Supprimer toutes les notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 