export type LeadType =
  | "general"
  | "sourcing"
  | "automotive"
  | "logistics"
  | "quality"
  | "supplier"
  | "dropshipping";

export type LeadPayload = {
  type: LeadType;

  name?: string;
  company?: string;
  email: string;
  phone?: string;

  message?: string;

  sourcePage?: string;

  payload?: Record<string, unknown>;

  // Champ anti-spam.
  website?: string;
};