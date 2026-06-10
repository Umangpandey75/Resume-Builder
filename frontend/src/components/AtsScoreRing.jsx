import React, { useEffect, useState } from 'react';

export function AtsScoreRing({ score, label, color = '#f59e0b' }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Circumference of a circle with r=36 is 2 * pi * 36 = 226.19
  const radius = 36;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Animate score number counter
    let start = 0;
    const end = parseInt(score, 10) || 0;
    if (end === 0) {
      setAnimatedScore(0);
      return;
    }
    const duration = 1200; // ms
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 flex items-center justify-center">
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-900"
            fill="transparent"
          />
          {/* Dynamic Fill */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Central Display */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold tracking-tight text-zinc-100">
            {animatedScore}
          </span>
          <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">/ 100</span>
        </div>
      </div>
      
      {/* Label */}
      <span className="text-[10px] font-mono tracking-widest font-semibold uppercase text-zinc-400">
        {label}
      </span>
    </div>
  );
}
export default AtsScoreRing;
