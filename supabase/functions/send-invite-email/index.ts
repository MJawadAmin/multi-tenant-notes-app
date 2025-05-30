import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { email, inviteToken, organizationSlug, role } = await req.json()

    // Validate required fields
    if (!email || !inviteToken || !organizationSlug || !role) {
      throw new Error('Missing required fields')
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('slug', organizationSlug)
      .single()

    if (orgError) throw orgError

    // Create the invitation link
    const inviteLink = `${Deno.env.get('SITE_URL')}/invite?token=${inviteToken}&org=${organizationSlug}`

    // Send the email using your email service provider
    // This is a placeholder - you'll need to implement your email sending logic
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourdomain.com',
        to: email,
        subject: `You've been invited to join ${organization.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">You've been invited to join ${organization.name}</h2>
            <p>You've been invited to join ${organization.name} as a ${role}.</p>
            <p>Click the button below to accept the invitation:</p>
            <a href="${inviteLink}" 
               style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Accept Invitation
            </a>
            <p>This invitation link will expire in 7 days.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send invitation email')
    }

    return new Response(
      JSON.stringify({ message: 'Invitation email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 