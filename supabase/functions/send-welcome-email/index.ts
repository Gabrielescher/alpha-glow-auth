import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { WelcomeEmail } from './_templates/welcome-email.tsx'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const smtpClient = new SMTPClient({
  connection: {
    hostname: Deno.env.get('SMTP_HOST') as string,
    port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
    tls: true,
    auth: {
      username: Deno.env.get('SMTP_USER') as string,
      password: Deno.env.get('SMTP_PASS') as string,
    },
  },
})

// Generate a webhook secret if not exists or convert to base64 if it's a plain string
const getWebhookSecret = () => {
  const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string
  if (!secret) {
    throw new Error('SEND_EMAIL_HOOK_SECRET not configured')
  }
  
  // Check if it's already base64, if not, convert it
  try {
    // Try to use it as is - standardwebhooks expects base64
    return secret
  } catch (e) {
    // If it fails, it might be a plain string - encode it
    const encoder = new TextEncoder()
    const data = encoder.encode(secret)
    return btoa(String.fromCharCode(...data))
  }
}

const hookSecret = getWebhookSecret()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Welcome email function called')
  
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
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Processing webhook payload')
    
    const wh = new Webhook(hookSecret)
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('Webhook verified for user:', user.email)

    // Render the email template
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        user_email: user.email,
        site_url: site_url || redirect_to,
      })
    )

    console.log('Email template rendered')

    // Send email using SMTP
    await smtpClient.send({
      from: Deno.env.get('SMTP_FROM') || 'Alpha Authenticator <noreply@alpha.app>',
      to: user.email,
      subject: '🎉 Bem-vindo ao Alpha - Confirme sua conta',
      html,
    })

    console.log('Email sent successfully via SMTP')

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})