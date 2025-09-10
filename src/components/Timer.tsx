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
  const circumference = 2 * Math.PI * 20;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted"
          opacity="0.2"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="url(#timer-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray,
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-in-out'
          }}
        />
        <defs>
          <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(280 85% 70%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">
          {remainingSeconds}
        </span>
      </div>
    </div>
  );
}