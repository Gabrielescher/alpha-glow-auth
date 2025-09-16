import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Shield, Download, Upload, Sparkles, LogOut } from 'lucide-react';
import { TOTPCard } from '@/components/TOTPCard';
import { AddAccountDialog } from '@/components/AddAccountDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { type TOTPAccount } from '@/lib/totp';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'alpha-totp-accounts';

// Função para gerar um ID único
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const Index = () => {
  const [accounts, setAccounts] = useState<TOTPAccount[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Carregar contas do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAccounts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  }, []);

  // Salvar contas no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = (account: Omit<TOTPAccount, 'id'>) => {
    const newAccount: TOTPAccount = {
      ...account,
      id: generateId(),
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
    toast({
      title: "Conta removida",
      description: "A conta foi removida com sucesso.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const exportAccounts = () => {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alpha-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup exportado",
      description: "Suas contas foram exportadas com sucesso.",
    });
  };

  const importAccounts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedAccounts = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedAccounts)) {
          setAccounts(prev => [...prev, ...importedAccounts.map(acc => ({ ...acc, id: generateId() }))]);
          toast({
            title: "Backup importado",
            description: `${importedAccounts.length} contas foram importadas.`,
          });
        }
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo de backup inválido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Theme Toggle and Logout */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="hover-lift hover-glow transition-all duration-300"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-3xl bg-primary/10 backdrop-blur-sm hover-glow hover:animate-pulse-glow transition-all duration-300 hover:scale-110">
              <Shield className="h-10 w-10 text-primary animate-float" />
            </div>
            <h1 className="text-5xl font-bold text-gradient-primary animate-shimmer">
              Alpha
            </h1>
            <Sparkles className="h-6 w-6 text-primary animate-bounce-gentle" />
          </div>
          <p className="text-muted-foreground text-xl animate-slide-up">
            Autenticador multifator seguro e elegante
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-primary-gradient hover:shadow-lg transition-all duration-300 hover:scale-105 hover-glow relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Plus className="h-4 w-4 mr-2 relative z-10" />
            <span className="relative z-10">Adicionar Conta</span>
          </Button>
          
          {accounts.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={exportAccounts}
                className="hover-lift hover-glow transition-all duration-300 hover:border-primary/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="hover-lift hover-glow transition-all duration-300 hover:border-primary/50"
              >
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                  <input
                    type="file"
                    accept=".json"
                    onChange={importAccounts}
                    className="hidden"
                  />
                </label>
              </Button>
            </>
          )}
        </div>

        {/* Accounts List */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {accounts.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-primary/20 bg-gradient-to-br from-accent/20 to-transparent hover-glow hover-lift transition-all duration-500 glass-morphism">
              <Shield className="h-20 w-20 text-primary/40 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-semibold mb-4 text-muted-foreground">
                Nenhuma conta adicionada
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Adicione sua primeira conta de autenticação de duas etapas para começar.
              </p>
              <Button 
                onClick={() => setAddDialogOpen(true)}
                className="bg-primary-gradient hover:shadow-lg transition-all duration-300 hover:scale-105 hover-glow relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">Adicionar Primeira Conta</span>
              </Button>
            </Card>
          ) : (
            accounts.map((account, index) => (
              <div
                key={account.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <TOTPCard
                  account={account}
                  onDelete={deleteAccount}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <p className="flex items-center justify-center gap-2 text-lg mb-2">
            🔐 
            <span className="animate-shimmer bg-gradient-to-r from-muted-foreground via-primary to-muted-foreground bg-clip-text text-transparent bg-[length:200%_100%]">
              Seus dados são armazenados localmente no seu dispositivo
            </span>
          </p>
          <p className="text-sm">
            Conectado como: <span className="text-primary font-medium">{user?.email}</span>
          </p>
        </div>
      </div>

      <AddAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={addAccount}
      />
    </div>
  );
};

export default Index;