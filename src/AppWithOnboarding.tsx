import { useState, useEffect } from 'react';
import { OnboardingChat } from './OnboardingChat';

// Import your existing App component
// import App from './App';

interface AppWithOnboardingProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that shows OnboardingChat for new users,
 * or the main app for returning users.
 * 
 * Usage in main.tsx or index.tsx:
 * 
 * import { AppWithOnboarding } from './AppWithOnboarding';
 * import App from './App';
 * 
 * ReactDOM.createRoot(document.getElementById('root')!).render(
 *   <AppWithOnboarding>
 *     <App />
 *   </AppWithOnboarding>
 * );
 */
export function AppWithOnboarding({ children }: AppWithOnboardingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = () => {
    try {
      // Check if running in Android WebView
      if (window.Android?.isOnboardingComplete) {
        const isComplete = window.Android.isOnboardingComplete();
        console.log('[AppWithOnboarding] Onboarding complete:', isComplete);
        setShowOnboarding(!isComplete);
      } else {
        // Web fallback - check localStorage
        const isComplete = localStorage.getItem('onboarding_complete') === 'true';
        console.log('[AppWithOnboarding] Web mode, onboarding complete:', isComplete);
        setShowOnboarding(!isComplete);
      }
    } catch (e) {
      console.error('[AppWithOnboarding] Error checking status:', e);
      setShowOnboarding(false);
    }
    
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
    console.log('[AppWithOnboarding] Onboarding completed');
    
    // Mark complete in Android
    if (window.Android?.setOnboardingComplete) {
      window.Android.setOnboardingComplete(true);
    }
    
    // Web fallback
    localStorage.setItem('onboarding_complete', 'true');
    
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingChat onComplete={handleOnboardingComplete} />;
  }

  return <>{children}</>;
}

// ============================================================================
// TypeScript declarations for Android bridge
// ============================================================================

declare global {
  interface Window {
    Android?: {
      // Existing methods
      isReady?: () => boolean;
      getCapabilities?: () => string;
      openScanner?: () => void;
      openGallery?: () => void;
      openFilePicker?: () => void;
      getAllIDs?: () => string;
      getAllDocuments?: () => string;
      getDocument?: (id: string) => string;
      getDocumentImage?: (id: string) => string;
      deleteDocument?: (id: string) => boolean;
      deleteID?: (id: string) => boolean;
      viewDocument?: (id: string) => void;
      searchDocuments?: (query: string) => string;
      
      // Person methods
      getAllPersons?: () => string;
      getPerson?: (id: string) => string;
      getPrimaryUser?: () => string;
      getDocumentsForPerson?: (id: string) => string;
      
      // Onboarding methods
      isOnboardingComplete?: () => boolean;
      setOnboardingComplete?: (complete: boolean) => void;
      createPrimaryUser?: (userJson: string) => string;
      createFamilyMember?: (memberJson: string) => string;
      
      // Security methods
      getSecurityStatus?: () => string;
      setupPin?: (pin: string) => boolean;
      verifyPin?: (pin: string) => boolean;
      isPinEnabled?: () => boolean;
      isBiometricAvailable?: () => boolean;
      enableBiometric?: (enabled: boolean) => void;
      shouldLockApp?: () => boolean;
      markSessionActive?: () => void;
      
      // Permission methods
      getPermissionStatus?: () => string;
      requestAllPermissions?: () => void;
      
      // Chat methods
      sendChatMessage?: (message: string) => void;
      getChatHistory?: () => string;
      
      // Scan methods
      scanDeviceForDocuments?: () => string;
      getNextDocumentBatch?: () => string;
      importFoundDocument?: (docJson: string) => string;
      dismissFoundDocument?: (filePath: string) => void;
    };
  }
}

export default AppWithOnboarding;
