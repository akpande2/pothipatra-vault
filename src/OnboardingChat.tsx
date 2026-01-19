import { useState, useEffect, useRef } from 'react';
import { 
  User, Upload, ChevronRight, Check, X, Camera, 
  FileText, Users, Heart, ArrowRight, Sparkles
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  type: 'bot' | 'user' | 'input' | 'options' | 'upload';
  content: string;
  options?: Option[];
  inputType?: 'name' | 'text';
  uploadType?: string;
  completed?: boolean;
}

interface Option {
  id: string;
  label: string;
  icon?: string;
  value: string;
}

interface UserProfile {
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
}

interface OnboardingState {
  step: 'welcome' | 'name' | 'self-docs' | 'ask-family' | 'family-relation' | 'family-name' | 'family-docs' | 'complete';
  currentUser: UserProfile;
  currentDocType: string;
  docIndex: number;
  familyMembers: UserProfile[];
  currentFamilyMember: UserProfile | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DOCUMENTS = [
  { id: 'AADHAAR', name: 'Aadhaar Card', icon: '🪪', required: false },
  { id: 'PAN', name: 'PAN Card', icon: '💳', required: false },
  { id: 'VOTER_ID', name: 'Voter ID', icon: '🗳️', required: false },
  { id: 'DRIVING_LICENSE', name: 'Driving License', icon: '🚗', required: false },
];

const RELATIONSHIPS: Option[] = [
  { id: 'SPOUSE', label: 'Husband/Wife', icon: '💑', value: 'SPOUSE' },
  { id: 'SON', label: 'Son', icon: '👦', value: 'SON' },
  { id: 'DAUGHTER', label: 'Daughter', icon: '👧', value: 'DAUGHTER' },
  { id: 'FATHER', label: 'Father', icon: '👨', value: 'FATHER' },
  { id: 'MOTHER', label: 'Mother', icon: '👩', value: 'MOTHER' },
  { id: 'BROTHER', label: 'Brother', icon: '👦', value: 'BROTHER' },
  { id: 'SISTER', label: 'Sister', icon: '👧', value: 'SISTER' },
  { id: 'FATHER_IN_LAW', label: 'Father-in-law', icon: '👴', value: 'FATHER_IN_LAW' },
  { id: 'MOTHER_IN_LAW', label: 'Mother-in-law', icon: '👵', value: 'MOTHER_IN_LAW' },
  { id: 'OTHER', label: 'Other', icon: '👤', value: 'OTHER' },
];

// ============================================================================
// ONBOARDING CHAT COMPONENT
// ============================================================================

interface OnboardingChatProps {
  onComplete: () => void;
}

export function OnboardingChat({ onComplete }: OnboardingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<OnboardingState>({
    step: 'welcome',
    currentUser: { firstName: '', middleName: '', lastName: '', relationship: 'SELF' },
    currentDocType: '',
    docIndex: 0,
    familyMembers: [],
    currentFamilyMember: null,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [nameInput, setNameInput] = useState({ first: '', middle: '', last: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start onboarding
  useEffect(() => {
    startOnboarding();
  }, []);

  const addBotMessage = (content: string, delay = 500): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          type: 'bot',
          content,
        }]);
        resolve();
      }, delay);
    });
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
    }]);
  };

  const startOnboarding = async () => {
    // Check if user already exists
    if (window.Android?.getPrimaryUser) {
      const userJson = window.Android.getPrimaryUser();
      const user = JSON.parse(userJson || '{}');
      if (user.id) {
        // User exists, skip to main app
        onComplete();
        return;
      }
    }

    await addBotMessage("👋 Welcome to Pothi Patra Vault!", 300);
    await addBotMessage("I'll help you securely store and manage your important documents.", 800);
    await addBotMessage("First, let me know your name so I can personalize your experience.", 800);
    
    setState(prev => ({ ...prev, step: 'name' }));
    setMessages(prev => [...prev, {
      id: `input-name-${Date.now()}`,
      type: 'input',
      content: 'name',
      inputType: 'name',
    }]);
  };

  const handleNameSubmit = async () => {
    if (!nameInput.first.trim()) return;

    const fullName = [nameInput.first, nameInput.middle, nameInput.last]
      .filter(Boolean)
      .join(' ');
    
    addUserMessage(fullName);

    // Save user
    setState(prev => ({
      ...prev,
      currentUser: {
        firstName: nameInput.first.trim(),
        middleName: nameInput.middle.trim(),
        lastName: nameInput.last.trim(),
        relationship: 'SELF',
      },
      step: 'self-docs',
      docIndex: 0,
    }));

    // Create person in Android
    if (window.Android?.createPrimaryUser) {
      window.Android.createPrimaryUser(JSON.stringify({
        firstName: nameInput.first.trim(),
        middleName: nameInput.middle.trim(),
        lastName: nameInput.last.trim(),
        displayName: fullName,
      }));
    }

    setNameInput({ first: '', middle: '', last: '' });

    await addBotMessage(`Hello ${nameInput.first}! 🎉`, 500);
    await addBotMessage("Let's start by uploading your important documents. Don't worry, everything is encrypted and stored securely on your device only.", 800);
    
    askForDocument(0, 'self');
  };

  const askForDocument = async (index: number, mode: 'self' | 'family') => {
    if (index >= DOCUMENTS.length) {
      // Done with documents
      if (mode === 'self') {
        askAboutFamily();
      } else {
        askForMoreFamily();
      }
      return;
    }

    const doc = DOCUMENTS[index];
    const person = mode === 'self' ? state.currentUser.firstName : state.currentFamilyMember?.firstName;
    
    await addBotMessage(`Would you like to upload ${person}'s ${doc.name}? ${doc.icon}`, 600);
    
    setMessages(prev => [...prev, {
      id: `upload-${doc.id}-${Date.now()}`,
      type: 'upload',
      content: doc.name,
      uploadType: doc.id,
      options: [
        { id: 'upload', label: `Upload ${doc.name}`, icon: '📤', value: 'upload' },
        { id: 'skip', label: 'Skip for now', icon: '⏭️', value: 'skip' },
        { id: 'done', label: "I'm done for now", icon: '✅', value: 'done' },
      ],
    }]);

    setState(prev => ({ ...prev, currentDocType: doc.id, docIndex: index }));
  };

  const handleDocumentAction = async (action: string, docType: string) => {
    const doc = DOCUMENTS.find(d => d.id === docType);
    const mode = state.step === 'self-docs' ? 'self' : 'family';

    if (action === 'upload') {
      addUserMessage(`Upload ${doc?.name}`);
      
      // Open scanner/gallery
      if (window.Android?.openGallery) {
        window.Android.openGallery();
      }
      
      // Listen for document processed
      const handleDocProcessed = () => {
        // Move to next document after upload
        setTimeout(() => {
          askForDocument(state.docIndex + 1, mode);
        }, 1000);
        window.removeEventListener('documentProcessed', handleDocProcessed);
      };
      window.addEventListener('documentProcessed', handleDocProcessed);
      
      // Also provide option to continue
      await addBotMessage("Great! Select or scan your document. Once done, we'll move to the next one.", 500);
      
    } else if (action === 'skip') {
      addUserMessage(`Skip ${doc?.name}`);
      await addBotMessage("No problem! You can always add it later.", 400);
      askForDocument(state.docIndex + 1, mode);
      
    } else if (action === 'done') {
      addUserMessage("I'm done for now");
      if (mode === 'self') {
        askAboutFamily();
      } else {
        finishOnboarding();
      }
    }
  };

  const askAboutFamily = async () => {
    setState(prev => ({ ...prev, step: 'ask-family' }));
    
    await addBotMessage("Would you like to add documents for a family member?", 600);
    
    setMessages(prev => [...prev, {
      id: `family-ask-${Date.now()}`,
      type: 'options',
      content: 'Add family member?',
      options: [
        { id: 'yes', label: 'Yes, add family member', icon: '👨‍👩‍👧‍👦', value: 'yes' },
        { id: 'no', label: "No, I'm done for now", icon: '✅', value: 'no' },
      ],
    }]);
  };

  const handleFamilyChoice = async (choice: string) => {
    if (choice === 'yes') {
      addUserMessage('Yes, add family member');
      setState(prev => ({ ...prev, step: 'family-relation' }));
      
      await addBotMessage("Who would you like to add? 👨‍👩‍👧‍👦", 500);
      
      setMessages(prev => [...prev, {
        id: `relation-${Date.now()}`,
        type: 'options',
        content: 'Select relationship',
        options: RELATIONSHIPS,
      }]);
    } else {
      addUserMessage("No, I'm done for now");
      finishOnboarding();
    }
  };

  const handleRelationshipSelect = async (relationship: string) => {
    const rel = RELATIONSHIPS.find(r => r.value === relationship);
    addUserMessage(rel?.label || relationship);
    
    setState(prev => ({
      ...prev,
      step: 'family-name',
      currentFamilyMember: {
        firstName: '',
        middleName: '',
        lastName: '',
        relationship,
      },
    }));

    await addBotMessage(`What is your ${rel?.label.toLowerCase()}'s name?`, 500);
    
    setMessages(prev => [...prev, {
      id: `family-name-${Date.now()}`,
      type: 'input',
      content: 'family-name',
      inputType: 'name',
    }]);
  };

  const handleFamilyNameSubmit = async () => {
    if (!nameInput.first.trim()) return;

    const fullName = [nameInput.first, nameInput.middle, nameInput.last]
      .filter(Boolean)
      .join(' ');
    
    addUserMessage(fullName);

    const familyMember: UserProfile = {
      firstName: nameInput.first.trim(),
      middleName: nameInput.middle.trim(),
      lastName: nameInput.last.trim(),
      relationship: state.currentFamilyMember?.relationship || 'OTHER',
    };

    // Create person in Android
    if (window.Android?.createFamilyMember) {
      window.Android.createFamilyMember(JSON.stringify({
        ...familyMember,
        displayName: fullName,
      }));
    }

    setState(prev => ({
      ...prev,
      currentFamilyMember: familyMember,
      familyMembers: [...prev.familyMembers, familyMember],
      step: 'family-docs',
      docIndex: 0,
    }));

    setNameInput({ first: '', middle: '', last: '' });

    await addBotMessage(`Great! Let's add documents for ${nameInput.first}.`, 500);
    askForDocument(0, 'family');
  };

  const askForMoreFamily = async () => {
    setState(prev => ({ ...prev, step: 'ask-family' }));
    
    await addBotMessage("Would you like to add another family member?", 600);
    
    setMessages(prev => [...prev, {
      id: `more-family-${Date.now()}`,
      type: 'options',
      content: 'Add another family member?',
      options: [
        { id: 'yes', label: 'Yes, add another', icon: '👨‍👩‍👧‍👦', value: 'yes' },
        { id: 'no', label: "No, I'm done", icon: '✅', value: 'no' },
      ],
    }]);
  };

  const finishOnboarding = async () => {
    setState(prev => ({ ...prev, step: 'complete' }));
    
    const totalDocs = state.familyMembers.length + 1; // +1 for self
    
    await addBotMessage("🎉 Awesome! You're all set!", 500);
    await addBotMessage(`You can always add more documents later from the home screen. Your data is encrypted and stored securely on your device.`, 800);
    await addBotMessage("Tap below to start using Pothi Patra Vault!", 600);
    
    // Mark onboarding complete
    if (window.Android?.setOnboardingComplete) {
      window.Android.setOnboardingComplete(true);
    }
    
    setMessages(prev => [...prev, {
      id: `complete-${Date.now()}`,
      type: 'options',
      content: 'Get started',
      options: [
        { id: 'start', label: 'Start Using App', icon: '🚀', value: 'start' },
      ],
    }]);
  };

  const handleComplete = () => {
    onComplete();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold">Pothi Patra Vault</h1>
            <p className="text-xs text-muted-foreground">Secure Document Manager</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            nameInput={nameInput}
            setNameInput={setNameInput}
            onNameSubmit={state.step === 'family-name' ? handleFamilyNameSubmit : handleNameSubmit}
            onOptionSelect={(value) => {
              if (msg.type === 'upload') {
                handleDocumentAction(value, state.currentDocType);
              } else if (state.step === 'ask-family') {
                handleFamilyChoice(value);
              } else if (state.step === 'family-relation') {
                handleRelationshipSelect(value);
              } else if (value === 'start') {
                handleComplete();
              }
            }}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

interface MessageBubbleProps {
  message: Message;
  nameInput: { first: string; middle: string; last: string };
  setNameInput: (input: { first: string; middle: string; last: string }) => void;
  onNameSubmit: () => void;
  onOptionSelect: (value: string) => void;
}

function MessageBubble({ message, nameInput, setNameInput, onNameSubmit, onOptionSelect }: MessageBubbleProps) {
  if (message.type === 'bot') {
    return (
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === 'input' && message.inputType === 'name') {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-sm border max-w-[90%]">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">First Name *</label>
            <input
              type="text"
              value={nameInput.first}
              onChange={(e) => setNameInput({ ...nameInput, first: e.target.value })}
              placeholder="Enter first name"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Middle Name</label>
            <input
              type="text"
              value={nameInput.middle}
              onChange={(e) => setNameInput({ ...nameInput, middle: e.target.value })}
              placeholder="Enter middle name (optional)"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
            <input
              type="text"
              value={nameInput.last}
              onChange={(e) => setNameInput({ ...nameInput, last: e.target.value })}
              placeholder="Enter last name (optional)"
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={onNameSubmit}
            disabled={!nameInput.first.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (message.type === 'options' || message.type === 'upload') {
    return (
      <div className="space-y-2 max-w-[90%]">
        {message.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option.value)}
            className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border hover:bg-muted/50 transition-colors text-left"
          >
            <span className="text-xl">{option.icon}</span>
            <span className="font-medium">{option.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
        ))}
      </div>
    );
  }

  return null;
}

export default OnboardingChat;
