import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Check } from 'lucide-react';
import { generateTOTP, type TOTPAccount } from '@/lib/totp';
import { Timer } from './Timer';
import { toast } from '@/hooks/use-toast';

interface TOTPCardProps {
  account: TOTPAccount;
  onDelete: (id: string) => void;
}

export function TOTPCard({ account, onDelete }: TOTPCardProps) {
  const [code, setCode] = useState('------');
  const [copied, setCopied] = useState(false);

  const updateCode = () => {
    const newCode = generateTOTP(account.secret, account.digits, account.period);
    setCode(newCode);
  };

  useEffect(() => {
    updateCode();
  }, [account.secret, account.digits, account.period]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: `${code} foi copiado para a área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-accent/10 border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-card-foreground truncate">
              {account.name}
            </h3>
            {account.issuer && (
              <Badge variant="secondary" className="text-xs">
                {account.issuer}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Timer 
            period={account.period || 30} 
            onTick={updateCode}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div 
            className="text-3xl font-mono font-bold text-primary tracking-wider cursor-pointer select-all hover:bg-primary/10 rounded-md px-2 py-1 transition-colors"
            onClick={copyToClipboard}
          >
            {code.match(/.{1,3}/g)?.join(' ') || code}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}