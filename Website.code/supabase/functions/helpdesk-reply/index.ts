import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

type OutboundPayload = {
  ticketId: string
  to: string
  subject: string
  message: string
}

type InboundPayload = {
  type: 'inbound'
  ticketId: string
  from: string
  subject: string
  message: string
  messageId?: string
}

// Resend webhook format for inbound emails
type ResendInboundWebhook = {
  type: 'email.received' | 'email.bounced' | 'email.complained' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.failed' | 'email.sent'
  created_at: string
  data: {
    email_id?: string
    from?: string
    to?: string | string[]
    subject?: string
    text?: string
    html?: string
    headers?: Record<string, string>
    message_id?: string
  }
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const replyToEmail = Deno.env.get('HELPDESK_REPLY_TO_EMAIL') || 'alistair.m.sweeting@gmail.com'

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(supabaseUrl ?? '', serviceRoleKey ?? '')

const getResendEmailContent = async (emailId: string) => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  try {
    console.log('Calling Resend API for email_id:', emailId)
    // Use the correct Resend receiving API endpoint: GET /emails/receiving/:id
    const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
      },
    })

    console.log('Resend API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch email content: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    console.log('Email content fetched successfully, text length:', data?.text?.length || 0)
    return data
  } catch (error) {
    console.error('Error fetching email content:', error?.message ?? error)
    return null
  }
}

const sendResendEmail = async (payload: OutboundPayload) => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Helpdesk <helpdesk@alistairsweeting.online>',
      reply_to: 'helpdesk@alistairsweeting.online',
      to: payload.to,
      subject: `[TICKET:${payload.ticketId}] ${payload.subject}`,
      text: payload.message,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend error: ${errorText}`)
  }

  const data = await response.json()
  return data?.id ?? null
}

const sendAssigneeUpdateEmail = async ({ to, ticketId, subject, message, fromEmail }: {
  to: string
  ticketId: string
  subject: string
  message: string
  fromEmail: string
}) => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Helpdesk Notifications <notifications@alistairsweeting.online>',
      to,
      subject: `Ticket updated: ${subject}`,
      text: `A customer replied to ticket ${ticketId}.

From: ${fromEmail}
Subject: ${subject}

Message:
${message}

Open the admin dashboard to respond: https://alistairsweeting.online/#/helpdesk/admin`,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend error: ${errorText}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = (await req.json()) as OutboundPayload | InboundPayload | ResendInboundWebhook

    // Handle Resend webhook events
    if ('type' in payload && 'data' in payload) {
      const webhook = payload as ResendInboundWebhook
      
      // Only process email.received events for inbound replies
      if (webhook.type !== 'email.received') {
        // Acknowledge other event types (bounced, complained, clicked, etc.) without processing
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { from, subject, email_id, message_id } = webhook.data
      
      console.log('Email fields extracted:', { from, subject, email_id, message_id })
      
      if (!from || !subject || !email_id) {
        console.error('Missing required fields - from:', from, 'subject:', subject, 'email_id:', email_id)
        return new Response(JSON.stringify({ error: 'Missing from, subject, or email_id in webhook' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Extract ticket ID from subject line
      const ticketMatch = subject.match(/\[TICKET:([a-f0-9\-]+)\]/)
      if (!ticketMatch || !ticketMatch[1]) {
        return new Response(JSON.stringify({ error: 'No ticket ID found in subject' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const ticketId = ticketMatch[1]
      
      // Fetch the full email content from Resend
      console.log('Fetching email content for:', email_id)
      const emailContent = await getResendEmailContent(email_id)
      const emailBody = emailContent?.text || emailContent?.html || `[Email received from ${from}]`

      const { error } = await supabaseAdmin.from('ticket_replies').insert([
        {
          ticket_id: ticketId,
          author_email: from,
          body: emailBody,
          direction: 'inbound',
          message_id: message_id ?? null,
        },
      ])

      if (error) throw error

      try {
        const { data: ticket, error: ticketError } = await supabaseAdmin
          .from('tickets')
          .select('assignee_email, subject')
          .eq('id', ticketId)
          .single()

        if (!ticketError && ticket?.assignee_email) {
          await sendAssigneeUpdateEmail({
            to: ticket.assignee_email,
            ticketId,
            subject: ticket.subject ?? subject,
            message: emailBody,
            fromEmail: from,
          })
        }
      } catch (notifyError) {
        console.error('Failed to send assignee update:', notifyError?.message ?? notifyError)
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handle custom inbound payload format (for testing/manual use)
    if ('type' in payload && payload.type === 'inbound') {
      const inbound = payload as InboundPayload
      const { error } = await supabaseAdmin.from('ticket_replies').insert([
        {
          ticket_id: inbound.ticketId,
          author_email: inbound.from,
          body: inbound.message,
          direction: 'inbound',
          message_id: inbound.messageId ?? null,
        },
      ])

      if (error) throw error

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Outbound emails
    const outbound = payload as OutboundPayload
    const messageId = await sendResendEmail(outbound)

    return new Response(JSON.stringify({ messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
