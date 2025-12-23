import { useState, useEffect, useCallback } from 'react';
import { Document } from '@/types/document';

const STORAGE_KEY_DOCUMENTS = 'pothipatra_documents';

export function useStore() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    const storedDocuments = localStorage.getItem(STORAGE_KEY_DOCUMENTS);

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments));
    }

    setIsLoading(false);
  }, []);

  // Save documents to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
    }
  }, [documents, isLoading]);

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
    isLoading,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
