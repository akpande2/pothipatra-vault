import React, { useState, useEffect } from 'react';
import { Shield, Trash2, CreditCard, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { StoredID } from '@/hooks/useAndroidBridge';

const DOCUMENTS_STORAGE_KEY = 'pothipatra_documents';

function getStoredDocumentsFromLocalStorage(): StoredID[] {
  try {
    const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function deleteDocumentFromLocalStorage(id: string): boolean {
  try {
    const docs = getStoredDocumentsFromLocalStorage();
    const filtered = docs.filter(d => d.id !== id);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

function maskIdNumber(idNumber: string): string {
  if (!idNumber || idNumber.length < 4) return idNumber || '••••';
  const lastFour = idNumber.slice(-4);
  return `XXXX-${lastFour}`;
}

function getDocTypeName(type: string): string {
  switch (type?.toUpperCase()) {
    case 'AADHAAR': return 'Aadhaar Card';
    case 'PAN': return 'PAN Card';
    case 'VOTER_ID': return 'Voter ID';
    case 'DRIVING': return 'Driving Licence';
    case 'PASSPORT': return 'Passport';
    default: return 'Document';
  }
}

function getDocTypeIcon(type: string) {
  const iconClass = "h-4 w-4";
  switch (type?.toUpperCase()) {
    case 'AADHAAR': return <CreditCard className={cn(iconClass, "text-orange-500")} />;
    case 'PAN': return <CreditCard className={cn(iconClass, "text-blue-500")} />;
    default: return <FileText className={cn(iconClass, "text-muted-foreground")} />;
  }
}

export const SecureVault: React.FC = () => {
  const [storedIDs, setStoredIDs] = useState<StoredID[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const loadStoredIDs = () => {
    setIsLoading(true);
    const android = (window as any).Android;

    if (android?.getAllStoredIDs) {
      console.log('[SecureVault] Calling Android.getAllStoredIDs()');
      android.getAllStoredIDs();
      // Timeout fallback
      setTimeout(() => setIsLoading(false), 3000);
    } else {
      // Web fallback - use localStorage
      const docs = getStoredDocumentsFromLocalStorage();
      setStoredIDs(docs);
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    const android = (window as any).Android;

    if (android?.deleteID) {
      console.log('[SecureVault] Calling Android.deleteID()', id);
      android.deleteID(id);
      toast.info('Deleting...');
    } else {
      // Web fallback
      const success = deleteDocumentFromLocalStorage(id);
      if (success) {
        toast.success('Record deleted');
        loadStoredIDs();
      } else {
        toast.error('Failed to delete');
      }
    }
  };

  useEffect(() => {
    const hasAndroid = !!(window as any).Android;
    setIsAndroid(hasAndroid);

    // Setup Android callbacks
    (window as any).onStorageResult = (data: { ids: StoredID[] }) => {
      console.log('[SecureVault] onStorageResult:', data);
      setIsLoading(false);
      if (data?.ids) {
        setStoredIDs(data.ids);
      }
    };

    (window as any).onDeleteResult = (data: { success: boolean; id: string }) => {
      console.log('[SecureVault] onDeleteResult:', data);
      if (data.success) {
        toast.success('Record deleted');
        loadStoredIDs();
      } else {
        toast.error('Failed to delete');
      }
    };

    // Initial load
    loadStoredIDs();

    return () => {
      delete (window as any).onStorageResult;
      delete (window as any).onDeleteResult;
    };
  }, []);

  if (storedIDs.length === 0 && !isLoading) {
    return null; // Don't show section if empty
  }

  return (
    <section className="mt-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Secure Vault
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={loadStoredIDs}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAndroid ? '🔒 Stored securely on device' : '💾 Stored locally'}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {storedIDs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                      {getDocTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {getDocTypeName(item.type)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{maskIdNumber(item.idNumber)}</span>
                        {item.name && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    onClick={() => handleDelete(item.id, item.name || item.idNumber)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
