export type Contact = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
}

export type Message = {
  content: string;
  time: string;
  date: string;
  isRead: boolean;
  isSent: boolean;
}

export type Conversation = {
  id: string;
  contact: Contact;
  lastMessage: Message;
  project: string;
  unreadCount: number;
}

export type ConversationMessage = {
  id: string;
  content: string;
  time: string;
  date: string;
  isSent: boolean;
  sender: string;
} 