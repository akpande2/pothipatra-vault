import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import pages (adjust paths as needed)
import Index from './pages/Index';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import PersonDocuments from './pages/PersonDocuments';
import PersonProfilePage from './pages/PersonProfilePage';
import NotFound from './pages/NotFound';

// Import components
import { DocumentScannerModal } from './components/DocumentScannerModal';
import { PermissionRequestModal } from './components/PermissionRequestModal';

// ============================================================================
// PERMISSION REQUEST MODAL
// ============================================================================

interface PermissionRequestModalProps {
  isOpen: boolean;
  onGranted: () => void;
  onSkip: () => void;
}

export const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
  isOpen,
  onGranted,
  onSkip
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
    }
  }, [isOpen]);

  const checkPermissions = () => {
    if (window.Android?.getPermissionStatus) {
      try {
        const status = JSON.parse(window.Android.getPermissionStatus());
        setPermissionStatus(status);
        
        if (status.allGranted) {
          onGranted();
        }
      } catch (e) {
        console.error('Error checking permissions:', e);
      }
    }
  };

  const handleRequestPermission = () => {
    setIsRequesting(true);
    
    if (window.Android?.requestAllPermissions) {
      window.Android.requestAllPermissions();
      
      // Poll for permission status
      const checkInterval = setInterval(() => {
        if (window.Android?.getPermissionStatus) {
          try {
            const status = JSON.parse(window.Android.getPermissionStatus());
            if (status.allGranted) {
              clearInterval(checkInterval);
              setIsRequesting(false);
              onGranted();
            }
          } catch (e) {
            console.error('Error checking permissions:', e);
          }
        }
      }, 1000);
      
      // Stop checking after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsRequesting(false);
        checkPermissions();
      }, 30000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-xl font-bold dark:text-white mb-2">
            Permission Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            To help you find and organize your documents, we need access to your files and camera.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-2xl">📁</span>
            <div>
              <p className="font-medium dark:text-white">File Access</p>
              <p className="text-sm text-gray-500">Scan and import existing documents</p>
            </div>
            {permissionStatus?.hasStorage && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-2xl">📷</span>
            <div>
              <p className="font-medium dark:text-white">Camera</p>
              <p className="text-sm text-gray-500">Scan new documents</p>
            </div>
            {permissionStatus?.hasCamera && (
              <span className="ml-auto text-green-500">✓</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isRequesting ? 'Requesting...' : 'Grant Permissions'}
          </button>
          
          <button
            onClick={onSkip}
            className="w-full py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
          >
            Skip for now
          </button>
        </div>
        
        <p className="text-xs text-center text-gray-400 mt-4">
          You can change permissions later in Settings
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// APP COMPONENT
// ============================================================================

const App: React.FC = () => {
  const [appState, setAppState] = useState<'loading' | 'permissions' | 'scanning' | 'ready'>('loading');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('[App] Initializing...');
    
    // Check if running in Android WebView
    if (!window.Android) {
      console.log('[App] Not in Android WebView, skipping initialization');
      setAppState('ready');
      return;
    }

    // Check permissions
    const hasPermissions = await checkPermissions();
    
    if (!hasPermissions) {
      setAppState('permissions');
      return;
    }

    // Check if should scan
    const shouldScan = await checkShouldScan();
    
    if (shouldScan) {
      setAppState('scanning');
      setShowScanner(true);
    } else {
      setAppState('ready');
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    if (window.Android?.getPermissionStatus) {
      try {
        const status = JSON.parse(window.Android.getPermissionStatus());
        console.log('[App] Permission status:', status);
        return status.allGranted || status.hasStorage;
      } catch (e) {
        console.error('[App] Error checking permissions:', e);
      }
    }
    return true; // Assume granted if can't check
  };

  const checkShouldScan = async (): Promise<boolean> => {
    if (window.Android?.shouldScanDevice) {
      try {
        const shouldScan = window.Android.shouldScanDevice();
        console.log('[App] Should scan:', shouldScan);
        return shouldScan;
      } catch (e) {
        console.error('[App] Error checking scan status:', e);
      }
    }
    return false;
  };

  const handlePermissionsGranted = async () => {
    console.log('[App] Permissions granted');
    
    // Check if should scan after permissions granted
    const shouldScan = await checkShouldScan();
    
    if (shouldScan) {
      setAppState('scanning');
      setShowScanner(true);
    } else {
      setAppState('ready');
    }
  };

  const handlePermissionsSkipped = () => {
    console.log('[App] Permissions skipped');
    setAppState('ready');
  };

  const handleScannerClose = () => {
    console.log('[App] Scanner closed');
    setShowScanner(false);
    setAppState('ready');
  };

  const handleScannerComplete = () => {
    console.log('[App] Scanner complete');
    setShowScanner(false);
    setAppState('ready');
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Permission Request Modal */}
        <PermissionRequestModal
          isOpen={appState === 'permissions'}
          onGranted={handlePermissionsGranted}
          onSkip={handlePermissionsSkipped}
        />

        {/* Document Scanner Modal */}
        <DocumentScannerModal
          isOpen={showScanner}
          onClose={handleScannerClose}
          onComplete={handleScannerComplete}
        />

        {/* Main App Routes */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/person/:id" element={<PersonDocuments />} />
          <Route path="/person/:id/profile" element={<PersonProfilePage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
};

// ============================================================================
// WINDOW TYPE EXTENSION
// ============================================================================

declare global {
  interface Window {
    Android?: {
      // Permissions
      getPermissionStatus: () => string;
      requestAllPermissions: () => void;
      
      // Device Scanning
      shouldScanDevice: () => boolean;
      scanDeviceForDocuments: () => string;
      getNextDocumentBatch: () => string;
      dismissFoundDocument: (filePath: string) => void;
      importFoundDocument: (documentJson: string) => string;
      
      // Document V2
      getAllDocumentsV2: () => string;
      getDocumentDetailsV2: (documentId: string) => string;
      getDocumentPageImage: (documentId: string, pageNumber: number) => string;
      searchDocumentsV2: (query: string) => string;
      deleteDocumentV2: (documentId: string) => boolean;
      getStorageStats: () => string;
      
      // Scan Settings
      setScanEnabled: (enabled: boolean) => void;
      isScanEnabled: () => boolean;
      getScanStats: () => string;
      
      // Existing methods...
      getAllIDs: () => string;
      getDocumentImage: (id: string) => string;
      deleteID: (id: string) => boolean;
      getPersons: () => string;
      getProfile: (personId: string) => string;
      getDocumentsForPerson: (personId: string) => string;
      startScanner: () => void;
      approveDocument: (dataJson: string) => void;
      rejectDocument: () => void;
      sendChatMessage: (message: string) => void;
      // ... other existing methods
    };
  }
}

export default App;
