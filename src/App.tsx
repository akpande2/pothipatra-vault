import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import IDCards from "./pages/IDCards";
import UploadID from "./pages/UploadID";
import ChatHistory from "./pages/ChatHistory";
import ChatConversation from "./pages/ChatConversation";
import PrivacyTrust from "./pages/PrivacyTrust";
import Reminders from "./pages/Reminders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/id-cards" element={<IDCards />} />
            <Route path="/upload" element={<UploadID />} />
            <Route path="/chat-history" element={<ChatHistory />} />
            <Route path="/chat/:id" element={<ChatConversation />} />
            <Route path="/privacy" element={<PrivacyTrust />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
