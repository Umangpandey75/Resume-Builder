import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, History, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/Button';

export function Header({ onOpenHistory, onProviderChange }) {
  const { theme, toggleTheme } = useTheme();
  
  // States for BYOK
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState('gemini'); // Gemini is default as selected in Step 0
  const [isSaved, setIsSaved] = useState(false);

  // Load key & provider from sessionStorage on mount
  useEffect(() => {
    let savedKey = sessionStorage.getItem('byok_llm_key');
    const defaultProvider = import.meta.env.VITE_DEFAULT_PROVIDER || 'gemini';
    const savedProvider = sessionStorage.getItem('byok_provider') || defaultProvider;
    
    // Seed with user's key for immediate testing convenience
    if (!savedKey) {
      const defaultKey = defaultProvider === 'gemini' 
        ? (import.meta.env.VITE_DEFAULT_GEMINI_API_KEY || '')
        : (import.meta.env.VITE_DEFAULT_OPENAI_API_KEY || '');
      if (defaultKey) {
        sessionStorage.setItem('byok_llm_key', defaultKey);
        savedKey = defaultKey;
      }
    }

    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
    
    if (savedProvider) {
      setProvider(savedProvider);
      if (onProviderChange) {
        onProviderChange(savedProvider);
      }
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('byok_llm_key', apiKey.trim());
      setIsSaved(true);
    } else {
      sessionStorage.removeItem('byok_llm_key');
      setIsSaved(false);
    }
    // Dispatch custom event to notify Analyzer of key changes
    window.dispatchEvent(new Event('sessionStorageChange'));
  };

  const handleProviderSelect = (selected) => {
    setProvider(selected);
    sessionStorage.setItem('byok_provider', selected);
    if (onProviderChange) {
      onProviderChange(selected);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-wide text-zinc-100 flex items-center gap-1.5">
            RESUME <span className="text-amber-500 font-extrabold">ATS</span> AUDITOR
          </h1>
          <p className="text-[10px] text-zinc-500 tracking-[0.25em] font-mono uppercase">AI-Language Detector</p>
        </div>
      </div>

      {/* BYOK Controls */}
      <div className="flex-1 max-w-xl flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2 w-full">
          {/* Key input with eye toggle */}
          <div className="relative flex-1">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type={apiKey === 'DEMO_MODE_ACTIVE' ? 'text' : (showKey ? 'text' : 'password')}
              value={apiKey === 'DEMO_MODE_ACTIVE' ? 'Demo Sandbox Mode (Active)' : apiKey}
              readOnly={apiKey === 'DEMO_MODE_ACTIVE'}
              onChange={(e) => {
                const val = e.target.value;
                setApiKey(val);
                if (val.trim()) {
                  sessionStorage.setItem('byok_llm_key', val.trim());
                  setIsSaved(true);
                } else {
                  sessionStorage.removeItem('byok_llm_key');
                  setIsSaved(false);
                }
                window.dispatchEvent(new Event('sessionStorageChange'));
              }}
              placeholder={`Paste your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key...`}
              className={`w-full h-10 pl-9 pr-10 rounded-lg border text-xs transition-all font-mono ${
                apiKey === 'DEMO_MODE_ACTIVE'
                  ? 'border-amber-500/40 bg-amber-950/20 text-amber-400 font-bold focus:ring-0 focus:border-amber-500/40'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500'
              }`}
              data-testid="api-key-input"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              data-testid="toggle-key-visibility"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Save Button */}
          <Button
            variant={isSaved ? 'success' : 'primary'}
            size="sm"
            onClick={handleSaveKey}
            className="h-10 text-xs px-4"
            data-testid="save-key-btn"
          >
            {isSaved ? 'Saved' : 'Save Key'}
          </Button>

          {/* Provider Selector */}
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 h-10 items-center">
            <button
              onClick={() => handleProviderSelect('gemini')}
              className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all uppercase ${
                provider === 'gemini' 
                  ? 'bg-amber-500 text-black font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              data-testid="select-gemini-provider"
            >
              Gemini
            </button>
            <button
              onClick={() => handleProviderSelect('openai')}
              className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-all uppercase ${
                provider === 'openai' 
                  ? 'bg-amber-500 text-black font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              data-testid="select-openai-provider"
            >
              OpenAI
            </button>
          </div>
        </div>

        {/* Hint and Privacy Pill */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 mt-0.5">
          <span className="font-body italic text-[9px] text-zinc-600">
            {provider === 'gemini' ? (
              <>
                Don't have a key? Get a free Gemini key at{' '}
                <a 
                  href="https://aistudio.google.com/apikey" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-amber-500 hover:underline"
                >
                  aistudio.google.com/apikey
                </a>
              </>
            ) : (
              <>
                Don't have a key? Get an OpenAI key at{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-amber-500 hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            {/* Demo Mode Toggle Button */}
            <button
              onClick={() => {
                const isDemoActive = apiKey === 'DEMO_MODE_ACTIVE';
                const nextKey = isDemoActive ? '' : 'DEMO_MODE_ACTIVE';
                setApiKey(nextKey);
                if (nextKey) {
                  sessionStorage.setItem('byok_llm_key', nextKey);
                  setIsSaved(true);
                } else {
                  sessionStorage.removeItem('byok_llm_key');
                  setIsSaved(false);
                }
                window.dispatchEvent(new Event('sessionStorageChange'));
              }}
              className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border transition-all active:scale-[0.98] ${
                apiKey === 'DEMO_MODE_ACTIVE'
                  ? 'bg-amber-500 text-black border-amber-400 font-bold animate-pulse'
                  : 'text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-750'
              }`}
            >
              {apiKey === 'DEMO_MODE_ACTIVE' ? 'Demo Mode: ON' : 'Try Demo Mode'}
            </button>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 anim-breath" />
            <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-500 border border-emerald-500/20 px-1 py-0.5 rounded bg-emerald-950/20">BYOK Status</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* History drawer button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenHistory}
          className="h-10 text-xs flex items-center gap-2"
          data-testid="open-history-drawer"
        >
          <History className="h-4 w-4" />
          History
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all focus:outline-none"
          data-testid="theme-toggle"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

export default Header;
