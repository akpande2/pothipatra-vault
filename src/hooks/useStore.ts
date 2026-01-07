import { useState, useEffect, useCallback } from 'react';
import { Document, KnownPerson, RelationType } from '@/types/document';

const STORAGE_KEY_DOCUMENTS = 'pothipatra_documents';
const STORAGE_KEY_PERSONS = 'pothipatra_persons';

// Helper to get documents from localStorage
const getStoredDocuments = (): Document[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save documents to localStorage
const saveDocuments = (docs: Document[]) => {
  localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(docs));
};

// Helper to get persons from localStorage
const getStoredPersons = (): KnownPerson[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PERSONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save persons to localStorage
const savePersons = (persons: KnownPerson[]) => {
  localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(persons));
};

export function useStore() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [knownPersons, setKnownPersons] = useState<KnownPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    setDocuments(getStoredDocuments());
    setKnownPersons(getStoredPersons());
    setIsLoading(false);
  }, []);

  const normalizeNameForComparison = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const isPersonKnown = useCallback((name: string): KnownPerson | undefined => {
    const normalizedName = normalizeNameForComparison(name);
    return knownPersons.find(
      person => normalizeNameForComparison(person.name) === normalizedName
    );
  }, [knownPersons]);

  const addKnownPerson = useCallback((name: string, relation: RelationType): KnownPerson => {
    const newPerson: KnownPerson = {
      id: crypto.randomUUID(),
      name: name.trim(),
      relation,
      createdAt: new Date().toISOString(),
    };
    
    // Save synchronously to localStorage FIRST
    const currentPersons = getStoredPersons();
    savePersons([...currentPersons, newPerson]);
    
    // Then update React state
    setKnownPersons(prev => [...prev, newPerson]);
    return newPerson;
  }, []);

  const updateKnownPerson = useCallback((id: string, updates: Partial<KnownPerson>) => {
    const currentPersons = getStoredPersons();
    const updatedPersons = currentPersons.map(p => (p.id === id ? { ...p, ...updates } : p));
    savePersons(updatedPersons);
    setKnownPersons(updatedPersons);
  }, []);

  const deleteKnownPerson = useCallback((id: string) => {
    const currentPersons = getStoredPersons();
    const filteredPersons = currentPersons.filter(p => p.id !== id);
    savePersons(filteredPersons);
    setKnownPersons(filteredPersons);
  }, []);

  const addDocument = useCallback((document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('[useStore] addDocument called:', newDocument.type, newDocument.name);
    
    // Save synchronously to localStorage FIRST (prevents race condition on navigate)
    const currentDocs = getStoredDocuments();
    saveDocuments([...currentDocs, newDocument]);
    
    console.log('[useStore] Saved to localStorage, total docs:', currentDocs.length + 1);
    
    // Then update React state
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    const currentDocs = getStoredDocuments();
    const updatedDocs = currentDocs.map(d =>
      d.id === id
        ? { ...d, ...updates, updatedAt: new Date().toISOString() }
        : d
    );
    saveDocuments(updatedDocs);
    setDocuments(updatedDocs);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    const currentDocs = getStoredDocuments();
    const filteredDocs = currentDocs.filter(d => d.id !== id);
    saveDocuments(filteredDocs);
    setDocuments(filteredDocs);
  }, []);

  return {
    documents,
    knownPersons,
    isLoading,
    isPersonKnown,
    addKnownPerson,
    updateKnownPerson,
    deleteKnownPerson,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
