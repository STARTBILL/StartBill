import { Client } from '../types';

export interface ClientDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  clientId: string;
}

export interface ClientNote {
  id: string;
  date: string;
  text: string;
  clientId: string;
}

// In production, no fictive or demo clients are seeded. New users receive a strictly empty space.
export const DEFAULT_CLIENTS_DATA: Client[] = [];

export const DEFAULT_CLIENT_DOCUMENTS: ClientDocument[] = [];

export const DEFAULT_CLIENT_NOTES: ClientNote[] = [];
