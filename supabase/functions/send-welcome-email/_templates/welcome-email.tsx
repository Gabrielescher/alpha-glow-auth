import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const WelcomeEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Alpha - Confirme sua conta</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Bem-vindo ao Alpha!</Heading>
        
        <Text style={text}>
          Obrigado por se cadastrar no <strong>Alpha</strong>, seu gerenciador de códigos de autenticação TOTP!
        </Text>

        <Section style={section}>
          <Text style={sectionTitle}>📱 O que é o Alpha?</Text>
          <Text style={text}>
            O Alpha é um aplicativo seguro para gerenciar seus códigos de autenticação de dois fatores (2FA). 
            Com ele você pode:
          </Text>
          <ul style={list}>
            <li style={listItem}>✅ Armazenar códigos TOTP de forma segura</li>
            <li style={listItem}>⏰ Visualizar códigos em tempo real com timer</li>
            <li style={listItem}>🔐 Sincronizar entre dispositivos</li>
            <li style={listItem}>📊 Organizar por issuer e conta</li>
          </ul>
        </Section>

        <Section style={section}>
          <Text style={sectionTitle}>🔑 Confirme sua conta</Text>
          <Text style={text}>
            Para começar a usar o Alpha e proteger suas contas, clique no botão abaixo para confirmar seu email:
          </Text>
          
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            target="_blank"
            style={button}
          >
            Confirmar Email e Acessar Alpha
          </Link>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Text style={sectionTitle}>🛡️ Código de Verificação Manual</Text>
          <Text style={text}>
            Se o botão não funcionar, use este código de verificação:
          </Text>
          <code style={code}>{token}</code>
          <Text style={smallText}>
            Cole este código na tela de confirmação do Alpha.
          </Text>
        </Section>

        <Section style={section}>
          <Text style={sectionTitle}>📋 Próximos Passos</Text>
          <Text style={text}>Após confirmar sua conta, você poderá:</Text>
          <ol style={list}>
            <li style={listItem}>Adicionar sua primeira conta TOTP</li>
            <li style={listItem}>Escanear QR codes ou inserir chaves manualmente</li>
            <li style={listItem}>Gerar códigos de 6 dígitos automaticamente</li>
            <li style={listItem}>Acompanhar o timer de 30 segundos</li>
          </ol>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          <strong>Conta criada:</strong> {user_email}<br/>
          <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}<br/><br/>
          
          Se você não criou esta conta, pode ignorar este email com segurança.<br/>
          
          <Link href="mailto:support@alpha.com" style={link}>
            Precisa de ajuda? Entre em contato
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const section = {
  margin: '32px 0',
  padding: '0 40px',
}

const sectionTitle = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '16px 0 8px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 24px',
  margin: '24px 0',
}

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #eee',
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '2px',
}

const list = {
  margin: '16px 0',
  paddingLeft: '0',
}

const listItem = {
  margin: '8px 0',
  fontSize: '16px',
  lineHeight: '26px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0',
  padding: '0 40px',
}

const link = {
  color: '#007ee6',
  textDecoration: 'underline',
}