import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from './ui/Button';

export function PdfUploader({ onFileParsed, isParsing, parseProgress, onClearFile, parsedFile }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;
    
    // Check file type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    if (onFileParsed) {
      onFileParsed(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Box */}
      {!parsedFile && !isParsing && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
          className={`relative w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-amber-500 bg-amber-500/5' 
              : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-950/30'
          }`}
          data-testid="pdf-dropzone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            data-testid="pdf-file-input"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-display font-medium text-zinc-200">
                Drag & drop your resume PDF here, or <span className="text-amber-500 hover:underline">browse</span>
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono uppercase tracking-wide">
                PDF only (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parsing progress */}
      {isParsing && (
        <div className="w-full border border-zinc-900 bg-zinc-950/40 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-500 anim-breath" />
              </div>
              <div>
                <p className="text-sm font-display font-medium text-zinc-200">Parsing PDF Document</p>
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Running local extraction</p>
              </div>
            </div>
            <span className="text-xs font-mono text-amber-500 font-semibold">{parseProgress}%</span>
          </div>
          
          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${parseProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 italic font-mono text-center">
            {parseProgress < 50 
              ? 'Extracting raw PDF characters...' 
              : 'Mapping geometric bounding boxes into reading lines...'}
          </p>
        </div>
      )}

      {/* Parsing Success Card */}
      {parsedFile && !isParsing && (
        <div 
          className="w-full border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 flex items-center justify-between gap-4 animate-fade-up"
          data-testid="parsed-pdf-card"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-display font-medium text-zinc-200 truncate pr-4" title={parsedFile.name}>
                {parsedFile.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                  {formatFileSize(parsedFile.size)}
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="inline-flex items-center gap-1 text-[8px] font-mono font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle className="h-2.5 w-2.5 shrink-0" />
                  Parsed Locally
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClearFile}
            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900/50 transition-all shrink-0 focus:outline-none focus:ring-1 focus:ring-red-500"
            data-testid="clear-pdf-btn"
            title="Remove file"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PdfUploader;
