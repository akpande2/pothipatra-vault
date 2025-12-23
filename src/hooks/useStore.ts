import { useState, useEffect, useCallback } from 'react';
import { Document, Profile } from '@/types/document';

const STORAGE_KEY_PROFILES = 'pothipatra_profiles';
const STORAGE_KEY_DOCUMENTS = 'pothipatra_documents';

// Default profile for first-time users
const defaultProfile: Profile = {
  id: 'default',
  name: 'My Profile',
  relation: 'self',
  createdAt: new Date().toISOString(),
};

export function useStore() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    const storedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
    const storedDocuments = localStorage.getItem(STORAGE_KEY_DOCUMENTS);

    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    } else {
      setProfiles([defaultProfile]);
    }

    if (storedDocuments) {
      setDocuments(JSON.parse(storedDocuments));
    }

    setIsLoading(false);
  }, []);

  // Save profiles to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    }
  }, [profiles, isLoading]);

  // Save documents to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(documents));
    }
  }, [documents, isLoading]);

  const addProfile = useCallback((profile: Omit<Profile, 'id' | 'createdAt'>) => {
    if (profiles.length >= 4) {
      throw new Error('Maximum 4 profiles allowed');
    }
    const newProfile: Profile = {
      ...profile,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, [profiles.length]);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProfile = useCallback((id: string) => {
    if (profiles.length <= 1) {
      throw new Error('At least one profile is required');
    }
    setProfiles(prev => prev.filter(p => p.id !== id));
    setDocuments(prev => prev.filter(d => d.profileId !== id));
    if (activeProfileId === id) {
      setActiveProfileId(profiles[0].id === id ? profiles[1]?.id : profiles[0].id);
    }
  }, [profiles, activeProfileId]);

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

  const getDocumentsByProfile = useCallback(
    (profileId: string) => documents.filter(d => d.profileId === profileId),
    [documents]
  );

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
  const activeDocuments = getDocumentsByProfile(activeProfileId);

  return {
    profiles,
    documents,
    activeProfile,
    activeProfileId,
    activeDocuments,
    isLoading,
    setActiveProfileId,
    addProfile,
    updateProfile,
    deleteProfile,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByProfile,
  };
}
