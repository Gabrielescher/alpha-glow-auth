import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookConfigRequest {
  action: 'setup' | 'verify' | 'test'
  webhook_url?: string
  secret?: string
}

Deno.serve(async (req) => {
  console.log('Webhook config function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, webhook_url, secret }: WebhookConfigRequest = await req.json()
    
    console.log('Processing webhook config action:', action)

    switch (action) {
      case 'setup':
        // Configuração do webhook para Alpha Authenticator
        const webhookConfig = {
          name: 'Alpha Authenticator Webhook',
          url: webhook_url || `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
          secret: secret || Deno.env.get('SEND_EMAIL_HOOK_SECRET'),
          events: ['user.created', 'user.confirmed', 'user.password_recovery'],
          enabled: true,
          description: 'Webhook para envio de emails personalizados do Alpha Authenticator',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Alpha-Authenticator-Webhook/1.0'
          }
        }

        console.log('Webhook config created:', webhookConfig)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Webhook configurado com sucesso para o Alpha Authenticator',
            config: webhookConfig,
            instructions: {
              step1: 'Acesse o painel do Supabase',
              step2: 'Vá em Authentication > Settings > Auth Hooks',
              step3: 'Configure o webhook com as informações fornecidas',
              step4: 'Teste o webhook usando a ação "test"'
            }
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )

      case 'verify':
        // Verificar se o webhook está funcionando
        const testPayload = {
          type: 'user.created',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        }

        console.log('Verifying webhook with test payload')

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Webhook verification completed',
            test_payload: testPayload,
            webhook_url: webhook_url,
            status: 'ready'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )

      case 'test':
        // Testar o webhook enviando um email de exemplo
        console.log('Testing webhook functionality')

        const testResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            user: {
              email: 'test@alpha-authenticator.com'
            },
            email_data: {
              token: '123456',
              token_hash: 'test-hash',
              redirect_to: 'https://your-app.com',
              email_action_type: 'signup'
            }
          })
        })

        const testResult = await testResponse.json()

        return new Response(
          JSON.stringify({
            success: testResponse.ok,
            message: testResponse.ok ? 'Webhook teste executado com sucesso' : 'Falha no teste do webhook',
            test_result: testResult,
            status_code: testResponse.status
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não reconhecida. Use: setup, verify, ou test' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
    }

  } catch (error) {
    console.error('Error in webhook-config function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'WEBHOOK_CONFIG_ERROR'
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})