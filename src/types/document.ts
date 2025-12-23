export type DocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving'
  | 'voter'
  | 'ration'
  | 'other';

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  number: string;
  holderName: string;
  expiryDate?: string;
  issueDate?: string;
  frontImage?: string;
  backImage?: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  relation: 'self' | 'spouse' | 'child' | 'parent' | 'other';
  avatar?: string;
  createdAt: string;
}

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; icon: string; color: string }> = {
  aadhaar: { label: 'Aadhaar Card', icon: '🆔', color: 'card-aadhaar' },
  pan: { label: 'PAN Card', icon: '💳', color: 'card-pan' },
  passport: { label: 'Passport', icon: '📘', color: 'card-passport' },
  driving: { label: 'Driving Licence', icon: '🚗', color: 'card-driving' },
  voter: { label: 'Voter ID', icon: '🗳️', color: 'card-voter' },
  ration: { label: 'Ration Card', icon: '🏠', color: 'card-ration' },
  other: { label: 'Other ID', icon: '📄', color: 'card-other' },
};

export const RELATIONS = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'other', label: 'Other' },
] as const;
