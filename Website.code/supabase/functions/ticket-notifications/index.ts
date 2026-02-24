import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const resendApiKey = Deno.env.get('RESEND_API_KEY')

const supabaseAdmin = createClient(supabaseUrl ?? '', serviceRoleKey ?? '')

type NotificationPayload = {
  type: 'ticket_assigned' | 'daily_digest'
  ticketId?: string
  ticketSubject?: string
  toEmail: string
  assigneeName?: string
}

const sendEmail = async (to: string, subject: string, html: string) => {
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
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend error: ${errorText}`)
  }

  return await response.json()
}

const handleTicketAssigned = async (payload: NotificationPayload) => {
  const { ticketId, ticketSubject, toEmail, assigneeName } = payload

  const html = `
    <h2>You've been assigned a support ticket</h2>
    <p>Hi ${assigneeName || 'there'},</p>
    <p>A new ticket has been assigned to you:</p>
    <p><strong>Subject:</strong> ${ticketSubject}</p>
    <p><a href="https://alistairsweeting.online/#/helpdesk/admin">View in admin dashboard</a></p>
  `

  await sendEmail(toEmail, `New ticket assigned: ${ticketSubject}`, html)
  return { ok: true }
}

const handleDailyDigest = async (payload: NotificationPayload) => {
  const { toEmail } = payload

  // Get all tickets created today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const { data: tickets, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .gte('created_at', todayISO)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Don't send email if no tickets
  if (!tickets || tickets.length === 0) {
    console.log('No tickets created today, skipping digest email')
    return { ok: true, ticketsCount: 0 }
  }

  // Build HTML for ticket list
  let ticketRows = ''
  for (const ticket of tickets) {
    ticketRows += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <strong>${ticket.subject}</strong><br>
          <small style="color: #666;">From: ${ticket.name} (${ticket.email})</small>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          <span style="background: ${ticket.status === 'open' ? '#fef3c7' : ticket.status === 'assigned' ? '#bfdbfe' : '#d1fae5'}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${ticket.status}
          </span>
        </td>
      </tr>
    `
  }

  const html = `
    <h2>Daily Support Ticket Digest</h2>
    <p>Hi,</p>
    <p>${tickets.length} ticket(s) were created today:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="background: #f3f4f6;">
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Subject</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
      </tr>
      ${ticketRows}
    </table>
    <p><a href="https://alistairsweeting.online/#/helpdesk/admin">View all tickets in admin dashboard</a></p>
  `

  await sendEmail(toEmail, `Daily Ticket Digest - ${tickets.length} ticket(s) created today`, html)
  return { ok: true, ticketsCount: tickets.length }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload = (await req.json()) as NotificationPayload

    if (payload.type === 'ticket_assigned') {
      const result = await handleTicketAssigned(payload)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (payload.type === 'daily_digest') {
      const result = await handleDailyDigest(payload)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown notification type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
