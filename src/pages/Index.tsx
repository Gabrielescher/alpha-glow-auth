import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Shield, Download, Upload } from 'lucide-react';
import { TOTPCard } from '@/components/TOTPCard';
import { AddAccountDialog } from '@/components/AddAccountDialog';
import { type TOTPAccount } from '@/lib/totp';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'alpha-totp-accounts';

// Função para gerar um ID único
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const Index = () => {
  const [accounts, setAccounts] = useState<TOTPAccount[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Alpha
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Autenticador multifator seguro e elegante
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-primary-gradient hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Conta
          </Button>
          
          {accounts.length > 0 && (
            <>
              <Button variant="outline" onClick={exportAccounts}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Button variant="outline" asChild>
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
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-primary/20 bg-gradient-to-br from-accent/20 to-transparent">
              <Shield className="h-16 w-16 text-primary/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
                Nenhuma conta adicionada
              </h3>
              <p className="text-muted-foreground mb-6">
                Adicione sua primeira conta de autenticação de duas etapas para começar.
              </p>
              <Button 
                onClick={() => setAddDialogOpen(true)}
                className="bg-primary-gradient hover:shadow-lg transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Conta
              </Button>
            </Card>
          ) : (
            accounts.map((account) => (
              <TOTPCard
                key={account.id}
                account={account}
                onDelete={deleteAccount}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            🔐 Seus dados são armazenados localmente no seu dispositivo
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