import React, { useEffect, useState } from 'react';
import { Sheet } from './ui/Sheet';
import { Trash2, Calendar, FileText, ArrowRight, Activity } from 'lucide-react';
import { getHistory, deleteHistoryEntry, getHistoryEntry, clearAllHistory } from '../lib/history';

export function HistoryDrawer({ isOpen, onClose, onLoadHistoryEntry }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history list when open
  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setHistoryList(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve history from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const handleSelectEntry = async (id) => {
    setIsLoading(true);
    try {
      // Fetch full entry details (with the large fileBlob and texts)
      const fullEntry = await getHistoryEntry(id);
      
      // Re-hydrate the File object from the base64 blob string
      const file = base64ToFile(fullEntry.fileBlob, fullEntry.fileName);
      
      onLoadHistoryEntry({
        file,
        resumeText: fullEntry.resumeText,
        jobDescription: fullEntry.jobDescription,
        result: fullEntry.result
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to load history details. Verify backend server is connected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (e, id) => {
    e.stopPropagation(); // Avoid triggering selection
    if (!confirm('Are you sure you want to delete this analysis record?')) return;
    
    try {
      await deleteHistoryEntry(id);
      // Refresh list
      setHistoryList(prev => prev.filter(item => item._id !== id && item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete history record.');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('WARNING: This will delete ALL analysis records. Continue?')) return;
    try {
      await clearAllHistory();
      setHistoryList([]);
    } catch (err) {
      console.error(err);
      alert('Failed to clear history database.');
    }
  };

  // Helper: Convert base64 back to a standard File object
  const base64ToFile = (base64String, filename) => {
    let base64Data = base64String;
    // Check if it includes a data:URI prefix and strip it
    if (base64String.includes(';base64,')) {
      base64Data = base64String.split(';base64,')[1];
    }
    
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new File([bytes], filename, { type: 'application/pdf' });
  };

  // Helper: Format relative time-ago strings
  const formatTimeAgo = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Audit History"
      description="Manage past resume ATS analyses saved in MongoDB database"
    >
      <div className="flex flex-col gap-4 h-full">
        {/* Actions bar */}
        {historyList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[10px] font-mono tracking-wider font-semibold text-red-400 hover:text-red-300 transition-colors uppercase border border-red-500/20 bg-red-950/10 px-3 py-1.5 rounded-lg text-center active:scale-[0.98] w-full"
          >
            Wipe Audit Database
          </button>
        )}

        {/* Loading / Error States */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Activity className="h-6 w-6 text-amber-500 animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Synchronizing database...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-10 px-4 border border-red-900/30 rounded-lg bg-red-950/10 text-xs text-red-400 font-body">
            {error}
          </div>
        )}

        {/* List Content */}
        {!isLoading && !error && historyList.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-display font-medium">No past audits found</p>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wide mt-1">
              Analyses are auto-saved upon success
            </p>
          </div>
        )}

        {!isLoading && !error && historyList.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {historyList.map((item) => {
              const beforeScore = item.result?.ats_score_before || 0;
              const afterScore = item.result?.ats_score_after || 0;
              const delta = afterScore - beforeScore;
              const recordId = item._id || item.id;

              return (
                <div
                  key={recordId}
                  onClick={() => handleSelectEntry(recordId)}
                  className="group relative border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-950/60 hover:border-zinc-800 rounded-xl p-3.5 cursor-pointer transition-all flex items-center justify-between gap-4"
                  data-testid="history-item"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 text-zinc-500 mt-0.5 shrink-0 group-hover:text-amber-500 transition-colors" />
                    <div className="overflow-hidden">
                      {/* Name */}
                      <p className="text-xs font-display font-semibold text-zinc-200 group-hover:text-zinc-100 truncate pr-6">
                        {item.fileName}
                      </p>
                      
                      {/* Subtitle */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                          <Calendar className="h-3 w-3 text-zinc-600" />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                        
                        <span className="h-1 w-1 rounded-full bg-zinc-800" />
                        
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-500">
                          {beforeScore} <ArrowRight className="h-2 w-2" /> {afterScore} (+{delta})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteEntry(e, recordId)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-900/50 transition-colors focus:outline-none shrink-0"
                    title="Delete record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
export default HistoryDrawer;
