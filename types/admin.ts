export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  lastLogin: string;
}

export interface SystemSetting {
  id: string;
  label: string;
  enabled: boolean;
  description: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "admin" | "moderator";
  lastActive?: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  retention: number;
}

export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
} 