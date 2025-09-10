import { useEffect, useState } from 'react';
import { getRemainingSeconds } from '@/lib/totp';

interface TimerProps {
  period?: number;
  onTick?: () => void;
}

export function Timer({ period = 30, onTick }: TimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds(period));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemainingSeconds(period);
      setRemainingSeconds(remaining);
      
      if (remaining === period) {
        onTick?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [period, onTick]);

  const progress = ((period - remainingSeconds) / period) * 100;
  const offset = ((remainingSeconds / period) * 100);
  const timeLeft = remainingSeconds;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10 group">
        <svg className="w-10 h-10 -rotate-90 transition-all duration-300 group-hover:scale-110" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary/20"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-primary drop-shadow-sm"
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s linear',
              filter: timeLeft <= 5 ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none',
            }}
          />
          {/* Glow effect for low time */}
          {timeLeft <= 5 && (
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-primary animate-pulse-glow"
              strokeWidth="1"
              strokeDasharray="100"
              strokeDashoffset={offset}
              strokeLinecap="round"
              opacity="0.6"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold transition-all duration-300 ${timeLeft <= 5 ? 'text-destructive animate-bounce-gentle' : 'text-primary'}`}>
            {timeLeft}
          </span>
        </div>
        {/* Pulse indicator for refresh */}
        {timeLeft === period && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
        )}
      </div>
    </div>
  );
}