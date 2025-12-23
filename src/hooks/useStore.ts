import { useState, useEffect, useCallback } from 'react';
import { Document, KnownPerson, RelationType } from '@/types/document';

const STORAGE_KEY_DOCUMENTS = 'pothipatra_documents';
const STORAGE_KEY_PERSONS = 'pothipatra_persons';

export function useStore() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [knownPersons, setKnownPersons] = useState<KnownPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    const storedDocuments = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    const storedPersons = localStorage.getItem(STORAGE_KEY_PERSONS);

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments));
    }

    if (storedPersons) {
      setKnownPersons(JSON.parse(storedPersons));
    }

    setIsLoading(false);
  }, []);

  // Save documents to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
    }
  }, [documents, isLoading]);

  // Save known persons to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY_PERSONS, JSON.stringify(knownPersons));
    }
  }, [knownPersons, isLoading]);

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
    setKnownPersons(prev => [...prev, newPerson]);
    return newPerson;
  }, []);

  const updateKnownPerson = useCallback((id: string, updates: Partial<KnownPerson>) => {
    setKnownPersons(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteKnownPerson = useCallback((id: string) => {
    setKnownPersons(prev => prev.filter(p => p.id !== id));
  }, []);

  const addDocument = useCallback((document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, ...updates, updatedAt: new Date().toISOString() }
          : d
      )
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
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
