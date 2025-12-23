export type DocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving'
  | 'voter'
  | 'ration'
  | 'other';

export type RelationType = 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

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
  createdAt: string;
  updatedAt: string;
}

export interface KnownPerson {
  id: string;
  name: string;
  relation: RelationType;
  createdAt: string;
}

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; labelHi: string; icon: string; color: string }> = {
  aadhaar: { label: 'Aadhaar Card', labelHi: 'आधार कार्ड', icon: '🆔', color: 'card-aadhaar' },
  pan: { label: 'PAN Card', labelHi: 'पैन कार्ड', icon: '💳', color: 'card-pan' },
  passport: { label: 'Passport', labelHi: 'पासपोर्ट', icon: '📘', color: 'card-passport' },
  driving: { label: 'Driving Licence', labelHi: 'ड्राइविंग लाइसेंस', icon: '🚗', color: 'card-driving' },
  voter: { label: 'Voter ID', labelHi: 'मतदाता पहचान पत्र', icon: '🗳️', color: 'card-voter' },
  ration: { label: 'Ration Card', labelHi: 'राशन कार्ड', icon: '🏠', color: 'card-ration' },
  other: { label: 'Other Document', labelHi: 'अन्य दस्तावेज़', icon: '📄', color: 'card-other' },
};

export const RELATIONS: { value: RelationType; label: string; labelHi: string }[] = [
  { value: 'self', label: 'Self', labelHi: 'स्वयं' },
  { value: 'spouse', label: 'Spouse', labelHi: 'पति/पत्नी' },
  { value: 'child', label: 'Child', labelHi: 'बच्चा' },
  { value: 'parent', label: 'Parent', labelHi: 'माता-पिता' },
  { value: 'sibling', label: 'Sibling', labelHi: 'भाई/बहन' },
  { value: 'other', label: 'Other', labelHi: 'अन्य' },
];
