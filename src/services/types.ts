import React from 'react';
import { ServiceId } from '../utils/subdomain';

export interface ServiceItem {
  id: ServiceId;
  name: string;
  tagline: string;
  description: string;
  subdomain: string;
  icon: string; // Emoji or Lucide icon key
  category: 'Healthcare' | 'Events' | 'Finance' | 'Identity' | 'Documents';
  accentColor: string;
  gradient: string;
  badge?: string;
  isAvailable: boolean;
  component: React.ComponentType;
}

export interface UniversalDocumentMeta {
  id: string;
  serviceId: ServiceId;
  title: string;
  subtitle?: string;
  createdAt: string;
  updatedAt: string;
  previewUrl?: string;
  data: Record<string, any>;
}
