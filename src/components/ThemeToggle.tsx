import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsDark(!isDark)}
      className="relative overflow-hidden group hover-glow"
    >
      <div className="relative z-10 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </Button>
  );
}