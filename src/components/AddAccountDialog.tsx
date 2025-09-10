import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, KeyRound } from 'lucide-react';
import { parseTOTPUri, type TOTPAccount } from '@/lib/totp';
import { toast } from '@/hooks/use-toast';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: Omit<TOTPAccount, 'id'>) => void;
}

export function AddAccountDialog({ open, onOpenChange, onAdd }: AddAccountDialogProps) {
  const [qrCodeUri, setQrCodeUri] = useState('');
  const [manualForm, setManualForm] = useState({
    name: '',
    issuer: '',
    secret: '',
  });

  const handleQrCodeSubmit = () => {
    try {
      const parsed = parseTOTPUri(qrCodeUri);
      if (!parsed.name || !parsed.secret) {
        throw new Error('Nome e segredo são obrigatórios');
      }
      
      onAdd({
        name: parsed.name,
        issuer: parsed.issuer || '',
        secret: parsed.secret,
        digits: parsed.digits || 6,
        period: parsed.period || 30,
        algorithm: parsed.algorithm || 'SHA1'
      });
      
      setQrCodeUri('');
      onOpenChange(false);
      toast({
        title: "Conta adicionada!",
        description: `${parsed.name} foi adicionada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar conta",
        description: "Verifique se o código QR está correto.",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = () => {
    if (!manualForm.name || !manualForm.secret) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e segredo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      name: manualForm.name,
      issuer: manualForm.issuer,
      secret: manualForm.secret.replace(/\s+/g, ''),
      digits: 6,
      period: 30,
      algorithm: 'SHA1'
    });

    setManualForm({ name: '', issuer: '', secret: '' });
    onOpenChange(false);
    toast({
      title: "Conta adicionada!",
      description: `${manualForm.name} foi adicionada com sucesso.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Adicionar Nova Conta
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova conta de autenticação de duas etapas.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-uri">Cole o código do QR Code:</Label>
              <Textarea
                id="qr-uri"
                placeholder="otpauth://totp/..."
                value={qrCodeUri}
                onChange={(e) => setQrCodeUri(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleQrCodeSubmit} disabled={!qrCodeUri}>
                Adicionar Conta
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Gmail, GitHub..."
                  value={manualForm.name}
                  onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Emissor (opcional)</Label>
                <Input
                  id="issuer"
                  placeholder="Ex: Google, GitHub..."
                  value={manualForm.issuer}
                  onChange={(e) => setManualForm(prev => ({ ...prev, issuer: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret">Chave Secreta *</Label>
                <Input
                  id="secret"
                  placeholder="JBSWY3DPEHPK3PXP"
                  value={manualForm.secret}
                  onChange={(e) => setManualForm(prev => ({ ...prev, secret: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleManualSubmit} 
                disabled={!manualForm.name || !manualForm.secret}
              >
                Adicionar Conta
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}