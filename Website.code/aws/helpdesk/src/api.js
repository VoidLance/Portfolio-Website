import crypto from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ses = new SESv2Client({})

const tableName = process.env.HELP_DESK_TABLE_NAME
const fromEmail = process.env.HELP_DESK_FROM_EMAIL
const notificationEmails = (process.env.HELP_DESK_NOTIFICATION_EMAILS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const adminPasswordPepper = process.env.ADMIN_PASSWORD_PEPPER || ''
const adminJwtSecret = process.env.ADMIN_JWT_SECRET || ''
const appUrl = process.env.HELP_DESK_APP_URL || 'https://alistairsweeting.online/#/helpdesk/admin'
const adminUsers = process.env.ADMIN_EMAIL
  ? [
      {
        email: process.env.ADMIN_EMAIL,
        name: process.env.ADMIN_NAME || process.env.ADMIN_EMAIL,
        passwordSha256: process.env.ADMIN_PASSWORD_SHA256 || '',
      },
    ]
  : []

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
    body: JSON.stringify(body),
  }
}

function parseJson(body) {
  if (!body) {
    return {}
  }

  try {
    return JSON.parse(body)
  } catch {
    throw new Error('Request body must be valid JSON.')
  }
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = 4 - (normalized.length % 4 || 4)
  return Buffer.from(normalized + '='.repeat(padding), 'base64').toString('utf8')
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function signToken(payload) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', adminJwtSecret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  if (!token || !adminJwtSecret) {
    throw new Error('Missing admin token.')
  }

  const [header, body, signature] = token.split('.')
  const expectedSignature = crypto
    .createHmac('sha256', adminJwtSecret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (expectedSignature !== signature) {
    throw new Error('Invalid token signature.')
  }

  const payload = JSON.parse(base64UrlDecode(body))
  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    throw new Error('Token expired.')
  }

  return payload
}

function requireAdmin(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing authorization header.'), { statusCode: 401 })
  }

  try {
    return verifyToken(authHeader.slice('Bearer '.length))
  } catch (error) {
    throw Object.assign(new Error(error.message || 'Unauthorized'), { statusCode: 401 })
  }
}

function getTicketKey(ticketId) {
  return {
    pk: `TICKET#${ticketId}`,
    sk: 'META',
  }
}

function formatTicket(item) {
  return {
    id: item.id,
    status: item.status,
    name: item.name,
    email: item.email,
    subject: item.subject,
    message: item.message,
    assigneeEmail: item.assigneeEmail || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function formatReply(item) {
  return {
    id: item.id,
    ticketId: item.ticketId,
    authorEmail: item.authorEmail,
    body: item.body,
    direction: item.direction,
    createdAt: item.createdAt,
    messageId: item.messageId || null,
  }
}

async function sendEmail({ to, subject, text }) {
  if (!fromEmail || !to) {
    return
  }

  await ses.send(new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: text,
          },
        },
      },
    },
  }))
}

async function notifyNewTicket(ticket) {
  if (!notificationEmails.length) {
    return
  }

  await sendEmail({
    to: notificationEmails,
    subject: `New helpdesk ticket: ${ticket.subject}`,
    text: `A new helpdesk ticket has been created.\n\nFrom: ${ticket.name} <${ticket.email}>\nSubject: ${ticket.subject}\nTicket ID: ${ticket.id}\n\nMessage:\n${ticket.message}\n\nOpen dashboard: ${appUrl}`,
  })
}

async function notifyAssignment(ticket, assigneeEmail) {
  if (!assigneeEmail) {
    return
  }

  await sendEmail({
    to: assigneeEmail,
    subject: `Ticket assigned: ${ticket.subject}`,
    text: `Ticket ${ticket.id} has been assigned to you.\n\nFrom: ${ticket.name} <${ticket.email}>\nSubject: ${ticket.subject}\n\nOpen dashboard: ${appUrl}`,
  })
}

async function createTicket(body) {
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim()
  const subject = String(body.subject || '').trim()
  const message = String(body.message || '').trim()

  if (!name || !email || !subject || !message) {
    return response(400, { error: 'name, email, subject and message are required.' })
  }

  const timestamp = new Date().toISOString()
  const ticket = {
    id: crypto.randomUUID(),
    pk: '',
    sk: 'META',
    entityType: 'ticket',
    status: 'open',
    name,
    email,
    subject,
    message,
    assigneeEmail: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  ticket.pk = `TICKET#${ticket.id}`

  await dynamo.send(new PutCommand({
    TableName: tableName,
    Item: ticket,
  }))

  await notifyNewTicket(ticket)

  return response(201, { ticket: formatTicket(ticket) })
}

async function login(body) {
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const admin = adminUsers.find((candidate) => candidate.email.toLowerCase() === email)

  if (!admin) {
    return response(401, { error: 'Invalid email or password.' })
  }

  const attemptedHash = sha256(`${adminPasswordPepper}:${password}`)
  if (attemptedHash !== admin.passwordSha256) {
    return response(401, { error: 'Invalid email or password.' })
  }

  const token = signToken({
    sub: admin.email,
    name: admin.name || admin.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
  })

  return response(200, {
    token,
    admin: {
      email: admin.email,
      name: admin.name || admin.email,
    },
  })
}

async function listTickets() {
  const result = await dynamo.send(new ScanCommand({
    TableName: tableName,
    FilterExpression: 'entityType = :entityType AND sk = :sk',
    ExpressionAttributeValues: {
      ':entityType': 'ticket',
      ':sk': 'META',
    },
  }))

  const tickets = (result.Items || [])
    .map(formatTicket)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  return response(200, { tickets })
}

async function getTicket(ticketId) {
  const ticketResult = await dynamo.send(new GetCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
  }))

  if (!ticketResult.Item) {
    return response(404, { error: 'Ticket not found.' })
  }

  const repliesResult = await dynamo.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :replyPrefix)',
    ExpressionAttributeValues: {
      ':pk': `TICKET#${ticketId}`,
      ':replyPrefix': 'REPLY#',
    },
  }))

  return response(200, {
    ticket: {
      ...formatTicket(ticketResult.Item),
      replies: (repliesResult.Items || []).map(formatReply),
    },
  })
}

async function updateAssignee(ticketId, body) {
  const ticketResult = await dynamo.send(new GetCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
  }))

  if (!ticketResult.Item) {
    return response(404, { error: 'Ticket not found.' })
  }

  const assigneeEmail = String(body.assigneeEmail || '').trim()
  const updatedAt = new Date().toISOString()

  await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
    UpdateExpression: 'SET assigneeEmail = :assigneeEmail, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':assigneeEmail': assigneeEmail,
      ':updatedAt': updatedAt,
    },
  }))

  await notifyAssignment(ticketResult.Item, assigneeEmail)

  return response(200, { ok: true })
}

async function updateStatus(ticketId, body) {
  const status = String(body.status || '').trim()
  if (!['open', 'closed'].includes(status)) {
    return response(400, { error: 'Status must be open or closed.' })
  }

  await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString(),
    },
  }))

  return response(200, { ok: true })
}

async function addReply(ticketId, body, admin) {
  const direction = String(body.direction || '').trim()
  const replyBody = String(body.body || '').trim()

  if (!['internal', 'outbound'].includes(direction)) {
    return response(400, { error: 'direction must be internal or outbound.' })
  }

  if (!replyBody) {
    return response(400, { error: 'Reply body is required.' })
  }

  const ticketResult = await dynamo.send(new GetCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
  }))

  if (!ticketResult.Item) {
    return response(404, { error: 'Ticket not found.' })
  }

  const replyId = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const messageId = direction === 'outbound' ? crypto.randomUUID() : null
  const reply = {
    pk: `TICKET#${ticketId}`,
    sk: `REPLY#${createdAt}#${replyId}`,
    entityType: 'reply',
    id: replyId,
    ticketId,
    authorEmail: admin.sub,
    body: replyBody,
    direction,
    createdAt,
    messageId,
  }

  await dynamo.send(new PutCommand({
    TableName: tableName,
    Item: reply,
  }))

  await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: getTicketKey(ticketId),
    UpdateExpression: 'SET updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':updatedAt': createdAt,
    },
  }))

  if (direction === 'outbound') {
    await sendEmail({
      to: ticketResult.Item.email,
      subject: `Re: ${ticketResult.Item.subject}`,
      text: `${replyBody}\n\nTicket reference: ${ticketId}`,
    })
  }

  return response(201, { reply: formatReply(reply) })
}

function getPathSegments(event) {
  return (event.rawPath || '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
}

export async function handler(event) {
  if (!tableName) {
    return response(500, { error: 'HELP_DESK_TABLE_NAME is not configured.' })
  }

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    }
  }

  try {
    const method = event.requestContext?.http?.method || 'GET'
    const segments = getPathSegments(event)
    const body = parseJson(event.body)

    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'login') {
      return await login(body)
    }

    if (method === 'POST' && segments[0] === 'tickets' && segments.length === 1) {
      return await createTicket(body)
    }

    const admin = requireAdmin(event)

    if (method === 'GET' && segments[0] === 'tickets' && segments.length === 1) {
      return await listTickets()
    }

    if (segments[0] === 'tickets' && segments[1] && segments.length === 2 && method === 'GET') {
      return await getTicket(segments[1])
    }

    if (segments[0] === 'tickets' && segments[1] && segments[2] === 'assign' && method === 'POST') {
      return await updateAssignee(segments[1], body, admin)
    }

    if (segments[0] === 'tickets' && segments[1] && segments[2] === 'status' && method === 'POST') {
      return await updateStatus(segments[1], body, admin)
    }

    if (segments[0] === 'tickets' && segments[1] && segments[2] === 'replies' && method === 'POST') {
      return await addReply(segments[1], body, admin)
    }

    return response(404, { error: 'Route not found.' })
  } catch (error) {
    console.error('Helpdesk API error:', error)
    return response(error.statusCode || 500, { error: error.message || 'Internal server error.' })
  }
}