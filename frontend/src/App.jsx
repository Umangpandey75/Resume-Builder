import React, { useState, useRef } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Header from './components/Header';
import Analyzer from './components/Analyzer';
import HistoryDrawer from './components/HistoryDrawer';
import { X, CheckCircle, AlertOctagon, Info, AlertTriangle } from 'lucide-react';

function AppContent() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [provider, setProvider] = useState('gemini'); // Gemini default
  const [toasts, setToasts] = useState([]);
  
  // Ref to trigger entry load inside Analyzer
  const loadHistoryEntryRef = useRef(null);

  // Custom premium Toast manager
  const addToast = (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Automatically prune toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoadHistoryEntry = (entryData) => {
    if (loadHistoryEntryRef.current) {
      loadHistoryEntryRef.current(entryData);
      addToast('success', 'Loaded analysis record from history!');
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground bg-tech-grid flex flex-col justify-between">
      {/* Visual Ambient Decorators */}
      <div className="ambient-blobs">
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, transparent 70%) border-radius-full filter blur-[70px] animate-pulse-beam pointer-events-none" />
      </div>
      
      <div className="grain-overlay" />

      {/* Header */}
      <Header 
        onOpenHistory={() => setIsHistoryOpen(true)} 
        onProviderChange={(prov) => setProvider(prov)}
      />

      {/* Main Body */}
      <main className="flex-1 w-full z-10">
        <Analyzer 
          provider={provider}
          showHistoryDrawerTrigger={loadHistoryEntryRef}
          onToastMessage={addToast}
        />
      </main>

      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        onLoadHistoryEntry={handleLoadHistoryEntry}
      />

      {/* Privacy-Focused Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 backdrop-blur-md py-6 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            RESUME ATS AUDITOR © {new Date().getFullYear()}
          </p>
          
          <p className="text-[10px] text-zinc-500 font-body max-w-xl leading-relaxed">
            Your API key never touches our servers — it lives only in this browser tab. Your PDF is parsed locally and never uploaded. The only network call is directly from your browser to OpenAI/Google.
          </p>
          
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 anim-breath" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">SECURE LOCAL ENCRYPT</span>
          </div>
        </div>
      </footer>

      {/* Floating Stack of Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const toastStyles = {
            success: {
              border: 'border-emerald-500/20',
              bg: 'bg-zinc-950/90 text-emerald-400 shadow-emerald-950/10',
              icon: CheckCircle
            },
            error: {
              border: 'border-red-500/20',
              bg: 'bg-zinc-950/90 text-red-400 shadow-red-950/10',
              icon: AlertOctagon
            },
            info: {
              border: 'border-zinc-800',
              bg: 'bg-zinc-950/90 text-zinc-300 shadow-zinc-950/10',
              icon: Info
            },
            warning: {
              border: 'border-amber-500/20',
              bg: 'bg-zinc-950/90 text-amber-400 shadow-amber-950/10',
              icon: AlertTriangle
            }
          };

          const style = toastStyles[toast.type] || toastStyles.info;
          const IconComponent = style.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 border rounded-xl shadow-xl backdrop-blur-md animate-fade-up ${style.bg} ${style.border}`}
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                <IconComponent className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="text-xs font-body leading-normal font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
