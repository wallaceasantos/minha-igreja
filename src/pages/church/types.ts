/**
 * Tipos para dados da igreja
 */

export interface PrayerRequest {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  request: string;
  createdAt?: string;
  status?: 'pending' | 'prayed' | 'answered';
}

export interface ContactMessage {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt?: string;
  status?: 'new' | 'read' | 'replied';
}
