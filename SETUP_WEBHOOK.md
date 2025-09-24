# Configuração do Webhook Alpha Authenticator

## 🔧 Configuração no Supabase

### 1. Configuração de URL no Supabase
Acesse o painel do Supabase em Authentication > URL Configuration e configure:

- **Site URL**: `https://seu-dominio.com` (ou URL do preview do Lovable)
- **Redirect URLs**: Adicione as URLs onde sua aplicação está rodando

### 2. Configuração do Email Hook
No painel do Supabase, vá em Authentication > Email Templates e configure:

#### Para Sign Up (Confirm signup):
- **Subject**: `🎉 Bem-vindo ao Alpha - Confirme sua conta`
- **Use custom SMTP**: Desativado (usar Supabase default)
- **Use webhook**: ✅ Ativado
- **Webhook URL**: `https://ljlaqclajosoeiktrcvw.supabase.co/functions/v1/send-welcome-email`
- **Webhook Secret**: Use o valor já configurado em SEND_EMAIL_HOOK_SECRET

## 🔍 Como Testar

### 1. Teste Básico
Execute a função webhook-config para testar:

```bash
curl -X POST https://ljlaqclajosoeiktrcvw.supabase.co/functions/v1/webhook-config \
  -H "Content-Type: application/json" \
  -d '{"action": "setup"}'
```

### 2. Teste de Email
Cadastre um novo usuário no app e verifique:
- ✅ Se o email customizado foi enviado
- ✅ Se contém as informações do Alpha Authenticator
- ✅ Se o link de confirmação funciona

## 🐛 Solucionando Problemas

### Erro "requested path is invalid"
- Verifique se Site URL e Redirect URLs estão configurados corretamente

### Email não está sendo enviado
- Verifique se o webhook está ativado no template
- Confirme se a RESEND_API_KEY está configurada
- Verifique os logs da edge function

### Webhook não está funcionando
- Confirme se SEND_EMAIL_HOOK_SECRET está configurado
- Verifique se a URL do webhook está correta
- Teste a função diretamente via curl

## 📋 Checklist de Configuração

- [ ] URLs configuradas no Supabase Auth
- [ ] RESEND_API_KEY adicionada aos secrets
- [ ] SEND_EMAIL_HOOK_SECRET configurado
- [ ] Webhook ativado no email template
- [ ] Domínio validado no Resend (se necessário)
- [ ] Teste de cadastro realizado

## 🔗 Links Úteis

- [Painel Supabase Auth](https://supabase.com/dashboard/project/ljlaqclajosoeiktrcvw/auth/providers)
- [Email Templates](https://supabase.com/dashboard/project/ljlaqclajosoeiktrcvw/auth/templates)
- [Edge Functions](https://supabase.com/dashboard/project/ljlaqclajosoeiktrcvw/functions)
- [Logs da função](https://supabase.com/dashboard/project/ljlaqclajosoeiktrcvw/functions/send-welcome-email/logs)