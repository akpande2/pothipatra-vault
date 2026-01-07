import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Camera, Image, FileText, X, Check, Settings, Loader2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadStep = "source" | "preview";

const DOCUMENT_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" },
  { value: "driving", label: "Driving Licence" },
  { value: "voter", label: "Voter ID" },
  { value: "ration", label: "Ration Card" },
  { value: "other", label: "Other" },
];

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG LOGGER - All logs go to console with clear formatting
// ═══════════════════════════════════════════════════════════════════════════
const DEBUG = {
  log: (section: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString().substr(11, 12);
    console.log(`[${timestamp}] 📱 [${section}] ${message}`);
    if (data !== undefined) {
      console.log(`[${timestamp}]    └─ Data:`, data);
    }
  },
  error: (section: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString().substr(11, 12);
    console.error(`[${timestamp}] ❌ [${section}] ${message}`);
    if (error) {
      console.error(`[${timestamp}]    └─ Error:`, error);
    }
  },
  success: (section: string, message: string) => {
    const timestamp = new Date().toISOString().substr(11, 12);
    console.log(`[${timestamp}] ✅ [${section}] ${message}`);
  },
  separator: (title: string) => {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${"═".repeat(60)}`);
  }
};

export default function UploadID() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>("source");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Bridge state
  const [bridgeStatus, setBridgeStatus] = useState({
    checked: false,
    exists: false,
    methods: {
      openScanner: false,
      openGallery: false,
      openFilePicker: false,
      ping: false,
    }
  });

  // Helper to add debug info
  const addDebug = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-20), `[${timestamp}] ${msg}`]);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: CHECK ANDROID BRIDGE ON MOUNT
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    DEBUG.separator("UPLOAD_ID COMPONENT MOUNTED");
    
    const checkBridge = () => {
      DEBUG.log("BRIDGE_CHECK", "Checking for window.Android...");
      addDebug("Checking bridge...");
      
      const android = (window as any).Android;
      
      DEBUG.log("BRIDGE_CHECK", "window.Android value:", android);
      DEBUG.log("BRIDGE_CHECK", "typeof window.Android:", typeof android);
      
      if (android) {
        DEBUG.success("BRIDGE_CHECK", "Android object FOUND!");
        addDebug("✅ Bridge found!");
        
        // Check each method
        const methods = {
          openScanner: typeof android.openScanner === "function",
          openGallery: typeof android.openGallery === "function",
          openFilePicker: typeof android.openFilePicker === "function",
          ping: typeof android.ping === "function",
        };
        
        DEBUG.log("BRIDGE_CHECK", "Available methods:", methods);
        addDebug(`Methods: scanner=${methods.openScanner}, gallery=${methods.openGallery}, files=${methods.openFilePicker}`);
        
        // Try ping if available
        if (methods.ping) {
          try {
            const pingResult = android.ping();
            DEBUG.log("BRIDGE_CHECK", "Ping result:", pingResult);
            addDebug(`Ping: ${pingResult}`);
          } catch (e) {
            DEBUG.error("BRIDGE_CHECK", "Ping failed", e);
            addDebug(`Ping error: ${e}`);
          }
        }
        
        setBridgeStatus({
          checked: true,
          exists: true,
          methods,
        });
      } else {
        DEBUG.error("BRIDGE_CHECK", "Android object NOT FOUND");
        addDebug("❌ Bridge NOT found");
        
        // Log what IS available on window
        DEBUG.log("BRIDGE_CHECK", "window.isAndroidApp:", (window as any).isAndroidApp);
        DEBUG.log("BRIDGE_CHECK", "window.isAndroidBridgeReady:", (window as any).isAndroidBridgeReady);
        
        setBridgeStatus({
          checked: true,
          exists: false,
          methods: { openScanner: false, openGallery: false, openFilePicker: false, ping: false },
        });
      }
    };

    // Check immediately
    checkBridge();

    // Listen for bridge ready event
    const handleBridgeReady = () => {
      DEBUG.log("BRIDGE_EVENT", "androidBridgeReady event received!");
      addDebug("📡 Bridge ready event!");
      checkBridge();
    };
    
    window.addEventListener("androidBridgeReady", handleBridgeReady);
    DEBUG.log("BRIDGE_CHECK", "Added listener for 'androidBridgeReady' event");

    // Recheck after delays (Android injection timing varies)
    const timeouts = [
      setTimeout(() => { DEBUG.log("BRIDGE_CHECK", "Recheck at 500ms"); checkBridge(); }, 500),
      setTimeout(() => { DEBUG.log("BRIDGE_CHECK", "Recheck at 1000ms"); checkBridge(); }, 1000),
      setTimeout(() => { DEBUG.log("BRIDGE_CHECK", "Recheck at 2000ms"); checkBridge(); }, 2000),
    ];

    return () => {
      window.removeEventListener("androidBridgeReady", handleBridgeReady);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: SET UP ANDROID CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    DEBUG.separator("SETTING UP ANDROID CALLBACKS");

    // File selected callback
    (window as any).onFileSelected = (data: { uri: string; type: string; mimeType?: string }) => {
      DEBUG.separator("onFileSelected CALLBACK FIRED");
      DEBUG.log("CALLBACK", "Received data:", {
        type: data.type,
        mimeType: data.mimeType,
        uriLength: data.uri?.length,
        uriPreview: data.uri?.substring(0, 100),
      });
      addDebug(`📥 File received: ${data.type}, ${data.uri?.length || 0} chars`);
      
      setIsLoading(false);

      if (data.uri) {
        DEBUG.success("CALLBACK", "Setting captured image and moving to preview");
        setCapturedImage(data.uri);
        setStep("preview");
        toast.success("File selected!");
      } else {
        DEBUG.error("CALLBACK", "No URI in data!");
        addDebug("❌ No URI in callback data");
      }
    };
    DEBUG.log("CALLBACKS", "window.onFileSelected registered");

    // Scan complete callback
    (window as any).onScanComplete = (data: any) => {
      DEBUG.separator("onScanComplete CALLBACK FIRED");
      DEBUG.log("CALLBACK", "Received data:", data);
      addDebug(`📥 Scan complete: ${JSON.stringify(data).substring(0, 100)}`);
      
      setIsLoading(false);

      if (data.cancelled) {
        DEBUG.log("CALLBACK", "Scan was cancelled");
        toast.info("Cancelled");
        return;
      }

      if (data.error) {
        DEBUG.error("CALLBACK", "Scan error:", data.error);
        toast.error(data.error);
        return;
      }

      if (data.doc_type) {
        const typeMap: Record<string, string> = {
          AADHAAR: "aadhaar",
          PAN: "pan",
          VOTER_ID: "voter",
        };
        if (typeMap[data.doc_type]) {
          DEBUG.log("CALLBACK", "Auto-selecting document type:", typeMap[data.doc_type]);
          setDocumentType(typeMap[data.doc_type]);
        }
      }

      if (data.success) {
        DEBUG.success("CALLBACK", "Scan successful!");
        toast.success("Document scanned!");
      }
    };
    DEBUG.log("CALLBACKS", "window.onScanComplete registered");

    // Verify callbacks are set
    DEBUG.log("CALLBACKS", "Verifying callbacks are set:");
    DEBUG.log("CALLBACKS", "  window.onFileSelected:", typeof (window as any).onFileSelected);
    DEBUG.log("CALLBACKS", "  window.onScanComplete:", typeof (window as any).onScanComplete);

    return () => {
      DEBUG.log("CALLBACKS", "Cleaning up callbacks");
      delete (window as any).onFileSelected;
      delete (window as any).onScanComplete;
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: HANDLE SOURCE SELECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    DEBUG.separator(`SOURCE SELECTED: ${source.toUpperCase()}`);
    addDebug(`👆 Tapped: ${source}`);
    
    const android = (window as any).Android;
    
    DEBUG.log("SOURCE_SELECT", "Bridge status:", {
      exists: !!android,
      bridgeStatusState: bridgeStatus,
    });

    // ANDROID PATH
    if (android) {
      DEBUG.log("SOURCE_SELECT", "Using ANDROID path");
      addDebug("🤖 Using Android bridge");
      setIsLoading(true);

      try {
        if (source === "camera") {
          DEBUG.log("SOURCE_SELECT", "Checking openScanner method...");
          DEBUG.log("SOURCE_SELECT", "typeof android.openScanner:", typeof android.openScanner);
          
          if (typeof android.openScanner === "function") {
            DEBUG.log("SOURCE_SELECT", "Calling android.openScanner()...");
            addDebug("📤 Calling openScanner()");
            android.openScanner();
            DEBUG.success("SOURCE_SELECT", "openScanner() called!");
            toast.info("Opening camera...");
          } else {
            DEBUG.error("SOURCE_SELECT", "openScanner is not a function!");
            addDebug("❌ openScanner not available");
            throw new Error("openScanner not available");
          }
        } 
        else if (source === "gallery") {
          DEBUG.log("SOURCE_SELECT", "Checking openGallery method...");
          DEBUG.log("SOURCE_SELECT", "typeof android.openGallery:", typeof android.openGallery);
          
          if (typeof android.openGallery === "function") {
            DEBUG.log("SOURCE_SELECT", "Calling android.openGallery()...");
            addDebug("📤 Calling openGallery()");
            android.openGallery();
            DEBUG.success("SOURCE_SELECT", "openGallery() called!");
            toast.info("Opening gallery...");
          } else {
            DEBUG.error("SOURCE_SELECT", "openGallery is not a function!");
            addDebug("❌ openGallery not available");
            throw new Error("openGallery not available");
          }
        } 
        else if (source === "files") {
          DEBUG.log("SOURCE_SELECT", "Checking openFilePicker method...");
          DEBUG.log("SOURCE_SELECT", "typeof android.openFilePicker:", typeof android.openFilePicker);
          
          if (typeof android.openFilePicker === "function") {
            DEBUG.log("SOURCE_SELECT", "Calling android.openFilePicker()...");
            addDebug("📤 Calling openFilePicker()");
            android.openFilePicker();
            DEBUG.success("SOURCE_SELECT", "openFilePicker() called!");
            toast.info("Opening files...");
          } else {
            DEBUG.error("SOURCE_SELECT", "openFilePicker is not a function!");
            addDebug("❌ openFilePicker not available");
            throw new Error("openFilePicker not available");
          }
        }
      } catch (error) {
        DEBUG.error("SOURCE_SELECT", "Bridge call failed!", error);
        addDebug(`❌ Error: ${error}`);
        setIsLoading(false);
        toast.error("Failed to open");
        
        // Fallback to file input
        DEBUG.log("SOURCE_SELECT", "Falling back to file input");
        fileInputRef.current?.click();
      }

      // Safety timeout
      setTimeout(() => {
        DEBUG.log("SOURCE_SELECT", "Safety timeout - resetting loading state");
        setIsLoading(false);
      }, 10000);
      
      return;
    }

    // WEB FALLBACK
    DEBUG.log("SOURCE_SELECT", "Using WEB FALLBACK (no Android bridge)");
    addDebug("🌐 Using web fallback");
    fileInputRef.current?.click();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // WEB FILE INPUT HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    DEBUG.log("FILE_INPUT", "File input changed");
    const file = e.target.files?.[0];
    if (!file) {
      DEBUG.log("FILE_INPUT", "No file selected");
      return;
    }

    DEBUG.log("FILE_INPUT", "File selected:", { name: file.name, type: file.type, size: file.size });
    addDebug(`📁 Web file: ${file.name}`);
    
    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    setStep("preview");
    e.target.value = "";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MANUAL BRIDGE TEST FUNCTION
  // ═══════════════════════════════════════════════════════════════════════════
  const testBridge = () => {
    DEBUG.separator("MANUAL BRIDGE TEST");
    addDebug("🧪 Testing bridge...");
    
    const android = (window as any).Android;
    
    console.log("=== BRIDGE TEST RESULTS ===");
    console.log("window.Android:", android);
    console.log("typeof window.Android:", typeof android);
    
    if (android) {
      console.log("Methods available:");
      console.log("  openScanner:", typeof android.openScanner);
      console.log("  openGallery:", typeof android.openGallery);
      console.log("  openFilePicker:", typeof android.openFilePicker);
      console.log("  getCapabilities:", typeof android.getCapabilities);
      console.log("  isReady:", typeof android.isReady);
      console.log("  ping:", typeof android.ping);
      
      if (typeof android.ping === "function") {
        try {
          const result = android.ping();
          console.log("  ping() result:", result);
          addDebug(`Ping result: ${result}`);
        } catch (e) {
          console.error("  ping() error:", e);
        }
      }
      
      if (typeof android.getCapabilities === "function") {
        try {
          const caps = android.getCapabilities();
          console.log("  getCapabilities() result:", caps);
          addDebug(`Capabilities: ${caps}`);
        } catch (e) {
          console.error("  getCapabilities() error:", e);
        }
      }
      
      toast.success("Bridge test complete - check console");
    } else {
      console.log("NO ANDROID BRIDGE FOUND");
      addDebug("❌ No bridge found");
      toast.error("No Android bridge");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const handleCancel = () => {
    setCapturedImage(null);
    setDocumentType("");
    setStep("source");
  };

  const handleSaveDocument = () => {
    if (!documentType || !capturedImage) return;
    navigate("/dashboard", {
      state: { newDocument: true, imageData: capturedImage, documentType },
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  const sources = [
    { id: "camera" as const, icon: Camera, label: "Camera", desc: "Take a photo" },
    { id: "gallery" as const, icon: Image, label: "Gallery", desc: "Choose from gallery" },
    { id: "files" as const, icon: FileText, label: "Files", desc: "Choose from files" },
  ];

  return (
    <AppLayout>
      {/* HEADER */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <button onClick={testBridge} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
          <Bug className="w-5 h-5 text-orange-500" />
        </button>
        <h1 className="text-lg font-semibold">Add Document</h1>
        <Link to="/settings" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {step === "source" ? (
        <div className="flex flex-col flex-1 p-6 gap-4">
          <p className="text-muted-foreground">
            How would you like to upload your document?
          </p>

          {/* DEBUG STATUS BOX */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono space-y-1">
            <div className="font-bold text-orange-600">🔧 DEBUG STATUS</div>
            <div>Bridge exists: {bridgeStatus.exists ? "✅ YES" : "❌ NO"}</div>
            <div>Methods: 
              scanner={bridgeStatus.methods.openScanner ? "✅" : "❌"} 
              gallery={bridgeStatus.methods.openGallery ? "✅" : "❌"} 
              files={bridgeStatus.methods.openFilePicker ? "✅" : "❌"}
            </div>
            <div>window.Android: {typeof (window as any).Android}</div>
            <div>isAndroidApp: {String((window as any).isAndroidApp)}</div>
            <div className="border-t border-slate-300 dark:border-slate-600 pt-1 mt-1">
              <div className="font-bold">Recent logs:</div>
              {debugInfo.slice(-5).map((log, i) => (
                <div key={i} className="text-[10px] opacity-80 truncate">{log}</div>
              ))}
            </div>
          </div>

          {/* SOURCE BUTTONS */}
          {sources.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => handleSourceSelect(id)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border border-border",
                "bg-card hover:bg-muted/50 transition-all text-left",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                ) : (
                  <Icon className="w-7 h-7 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
            {capturedImage && (
              <img src={capturedImage} alt="Preview" className="max-h-full max-w-full rounded-xl shadow" />
            )}
          </div>

          <div className="p-6 border-t border-border space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14" onClick={handleCancel}>
                <X className="w-5 h-5 mr-2" /> Cancel
              </Button>
              <Button className="flex-1 h-14" disabled={!documentType} onClick={handleSaveDocument}>
                <Check className="w-5 h-5 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
