const HELP_DESK_API_BASE_URL = import.meta.env.VITE_HELPDESK_API_BASE_URL?.replace(/\/$/, '') || ''
const HELP_DESK_SESSION_STORAGE_KEY = 'helpdesk-admin-session'

export const hasHelpdeskApiConfig = Boolean(HELP_DESK_API_BASE_URL)

function getAdminHeaders() {
  const session = getHelpdeskSession()

  if (!session?.token) {
    throw new Error('You are not logged in.')
  }

  return {
    Authorization: `Bearer ${session.token}`,
  }
}

async function request(path, options = {}) {
  if (!HELP_DESK_API_BASE_URL) {
    throw new Error('VITE_HELPDESK_API_BASE_URL is not configured.')
  }

  const response = await fetch(`${HELP_DESK_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed with status ${response.status}`)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

function normaliseReply(reply) {
  return {
    id: reply.id,
    ticketId: reply.ticketId,
    authorEmail: reply.authorEmail,
    body: reply.body,
    direction: reply.direction,
    createdAt: reply.createdAt,
    messageId: reply.messageId ?? null,
  }
}

function normaliseTicket(ticket) {
  return {
    id: ticket.id,
    status: ticket.status,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    message: ticket.message,
    assigneeEmail: ticket.assigneeEmail || '',
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    replies: Array.isArray(ticket.replies) ? ticket.replies.map(normaliseReply) : [],
  }
}

export function getHelpdeskSession() {
  try {
    const raw = window.localStorage.getItem(HELP_DESK_SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to read helpdesk session from storage:', error)
    return null
  }
}

function setHelpdeskSession(session) {
  window.localStorage.setItem(HELP_DESK_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearHelpdeskSession() {
  window.localStorage.removeItem(HELP_DESK_SESSION_STORAGE_KEY)
}

export async function createTicket(ticket) {
  const payload = await request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticket),
  })

  return {
    ...payload,
    ticket: payload?.ticket ? normaliseTicket(payload.ticket) : null,
  }
}

export async function loginHelpdeskAdmin(credentials) {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  const session = {
    token: payload.token,
    admin: payload.admin,
  }

  setHelpdeskSession(session)
  return session
}

export async function changeHelpdeskAdminPassword(data) {
  return request('/auth/change-password', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  })
}

export async function listTickets() {
  const payload = await request('/tickets', {
    method: 'GET',
    headers: getAdminHeaders(),
  })

  return {
    tickets: Array.isArray(payload?.tickets) ? payload.tickets.map(normaliseTicket) : [],
  }
}

export async function getTicketDetails(ticketId) {
  const payload = await request(`/tickets/${ticketId}`, {
    method: 'GET',
    headers: getAdminHeaders(),
  })

  return {
    ticket: payload?.ticket ? normaliseTicket(payload.ticket) : null,
  }
}

export async function assignTicket(ticketId, data) {
  return request(`/tickets/${ticketId}/assign`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  })
}

export async function closeTicket(ticketId) {
  return request(`/tickets/${ticketId}/status`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status: 'closed' }),
  })
}

export async function reopenTicket(ticketId) {
  return request(`/tickets/${ticketId}/status`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status: 'open' }),
  })
}

export async function addTicketReply(ticketId, data) {
  return request(`/tickets/${ticketId}/replies`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(data),
  })
}