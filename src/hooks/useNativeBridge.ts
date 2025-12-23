import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useNativeBridge = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Listen for Scanned ID results
    (window as any).onScanningResult = (jsonString: string) => {
      setIsProcessing(false);
      try {
        const result = JSON.parse(jsonString);
        if (result.success) {
          toast.success("ID Scanned Successfully!");
          // Save result to local storage or state
          localStorage.setItem('last_scanned_id', jsonString);
          // Redirect to the Documents or Result screen
          navigate('/documents');
        } else {
          toast.error(result.message || "Scanning failed");
        }
      } catch (e) {
        console.error("Failed to parse scan result", e);
      }
    };

    // 2. Listen for the list of saved documents
    (window as any).onDocumentsLoaded = (jsonString: string) => {
      try {
        const docs = JSON.parse(jsonString);
        // You can use a state manager like TanStack Query or simple localStorage
        localStorage.setItem('pothi_vault_docs', JSON.stringify(docs));
        // Trigger a custom event so components know to refresh
        window.dispatchEvent(new Event('vault-updated'));
      } catch (e) {
        console.error("Failed to load documents", e);
      }
    };

    // 3. Listen for Chat AI responses
    (window as any).onChatResponse = (response: string) => {
      // Logic to add the AI response to your Chat screen list
      window.dispatchEvent(new CustomEvent('new-ai-message', { detail: response }));
    };

    return () => {
      // Cleanup: Remove listeners when app closes
      delete (window as any).onScanningResult;
      delete (window as any).onDocumentsLoaded;
      delete (window as any).onChatResponse;
    };
  }, [navigate]);

  return { isProcessing, setIsProcessing };
};
