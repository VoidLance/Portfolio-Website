import crypto from 'node:crypto'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { ChangePasswordCommand, CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ses = new SESv2Client({})
const cognito = new CognitoIdentityProviderClient({})

const tableName = process.env.HELP_DESK_TABLE_NAME
const fromEmail = process.env.HELP_DESK_FROM_EMAIL
const notificationEmails = (process.env.HELP_DESK_NOTIFICATION_EMAILS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const appUrl = process.env.HELP_DESK_APP_URL || 'https://alistairsweeting.online/#/helpdesk/admin'
const cognitoClientId = process.env.COGNITO_CLIENT_ID || ''

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

async function requireAdmin(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw Object.assign(new Error('Missing authorization header.'), { statusCode: 401 })
  }

  try {
    const accessToken = authHeader.slice('Bearer '.length)
    const userResult = await cognito.send(new GetUserCommand({
      AccessToken: accessToken,
    }))

    const emailAttribute = (userResult.UserAttributes || []).find((attribute) => attribute.Name === 'email')
    const nameAttribute = (userResult.UserAttributes || []).find((attribute) => attribute.Name === 'name')

    return {
      sub: userResult.Username,
      email: emailAttribute?.Value || userResult.Username,
      name: nameAttribute?.Value || emailAttribute?.Value || userResult.Username,
      accessToken,
    }
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

async function sendEmail({ to, subject, text, optional = false }) {
  if (!fromEmail) {
    if (optional) {
      return
    }

    throw Object.assign(new Error('HELP_DESK_FROM_EMAIL is not configured.'), { statusCode: 500 })
  }

  const toAddresses = (Array.isArray(to) ? to : [to])
    .map((value) => String(value || '').trim())
    .filter(Boolean)

  if (!toAddresses.length) {
    if (optional) {
      return
    }

    throw Object.assign(new Error('A recipient email address is required.'), { statusCode: 400 })
  }

  await ses.send(new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: {
      ToAddresses: toAddresses,
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
    optional: true,
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
    optional: true,
  })
}

async function changePassword(body, admin) {
  const previousPassword = String(body.previousPassword || '')
  const nextPassword = String(body.nextPassword || '')

  if (!previousPassword || !nextPassword) {
    return response(400, { error: 'Current password and new password are required.' })
  }

  if (previousPassword === nextPassword) {
    return response(400, { error: 'New password must be different from current password.' })
  }

  try {
    await cognito.send(new ChangePasswordCommand({
      AccessToken: admin.accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: nextPassword,
    }))
  } catch (error) {
    if (error?.name === 'NotAuthorizedException') {
      return response(401, { error: 'Current password is incorrect.' })
    }

    if (error?.name === 'InvalidPasswordException') {
      return response(400, { error: error.message || 'New password does not meet policy requirements.' })
    }

    if (error?.name === 'PasswordHistoryPolicyViolationException') {
      return response(400, { error: error.message || 'Cannot reuse a recent password.' })
    }

    throw error
  }

  return response(200, { ok: true })
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
  if (!cognitoClientId) {
    return response(500, { error: 'COGNITO_CLIENT_ID is not configured.' })
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !password) {
    return response(400, { error: 'Email and password are required.' })
  }

  let authResult
  try {
    const cognitoResult = await cognito.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: cognitoClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }))

    authResult = cognitoResult.AuthenticationResult
  } catch (error) {
    return response(401, { error: 'Invalid email or password.' })
  }

  if (!authResult?.AccessToken) {
    return response(401, { error: 'Invalid email or password.' })
  }

  const userResult = await cognito.send(new GetUserCommand({
    AccessToken: authResult.AccessToken,
  }))

  const emailAttribute = (userResult.UserAttributes || []).find((attribute) => attribute.Name === 'email')
  const nameAttribute = (userResult.UserAttributes || []).find((attribute) => attribute.Name === 'name')

  return response(200, {
    token: authResult.AccessToken,
    admin: {
      email: emailAttribute?.Value || email,
      name: nameAttribute?.Value || emailAttribute?.Value || email,
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
    authorEmail: admin.email,
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
      optional: false,
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

    const admin = await requireAdmin(event)

    if (method === 'GET' && segments[0] === 'tickets' && segments.length === 1) {
      return await listTickets()
    }

    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'change-password') {
      return await changePassword(body, admin)
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