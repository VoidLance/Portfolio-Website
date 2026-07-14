# AWS Helpdesk Setup

This repo now contains an AWS-native helpdesk implementation for the public Helpdesk page and the admin dashboard.

## Architecture

- Frontend pages:
  - `src/pages/Helpdesk.jsx`
  - `src/pages/HelpdeskAdmin.jsx`
- Frontend API client:
  - `src/lib/helpdeskApi.js`
- Backend scaffold:
  - `aws/helpdesk/template.yaml`
  - `aws/helpdesk/src/api.js`
- AWS services used:
  - API Gateway HTTP API
  - Lambda
  - DynamoDB
  - SES

## 1. Install backend dependencies

From `aws/helpdesk`:

```bash
npm install
```

## 2. Prepare admin credentials

The backend expects a JSON array in `AdminUsersJson`, with each user containing:

- `email`
- `name`
- `passwordSha256`

Generate a password hash with the same pepper you will pass to CloudFormation:

```bash
node -e "const crypto=require('crypto'); const pepper='replace-with-secret-pepper'; const password='replace-with-password'; console.log(crypto.createHash('sha256').update(`${pepper}:${password}`).digest('hex'))"
```

Example JSON:

```json
[
  {
    "email": "you@example.com",
    "name": "Alistair",
    "passwordSha256": "generated-hash-here"
  }
]
```

## 3. Deploy the backend

From `aws/helpdesk`:

```bash
sam build
sam deploy --guided
```

Provide values for:

- `HelpdeskFromEmail`
- `HelpdeskNotificationEmails`
- `HelpdeskAppUrl`
- `AdminUsersJson`
- `AdminPasswordPepper`
- `AdminJwtSecret`

`HelpdeskFromEmail` must already be verified in Amazon SES.

## 4. Configure the frontend

Add the deployed API URL to your Vite env file, for example in `.env.local`:

```bash
VITE_HELPDESK_API_BASE_URL=https://your-api-id.execute-api.eu-west-2.amazonaws.com
```

Then rebuild the site:

```bash
npm run build
```

## 5. Deploy the website

After the env var is set and verified locally:

```bash
npm run deploy:s3
```

## API routes expected by the frontend

- `POST /auth/login`
- `POST /tickets`
- `GET /tickets`
- `GET /tickets/:ticketId`
- `POST /tickets/:ticketId/assign`
- `POST /tickets/:ticketId/status`
- `POST /tickets/:ticketId/replies`

## Notes

- The DynamoDB table uses a simple single-table layout with one `META` record per ticket and `REPLY#...` records for conversation entries.
- Ticket listing currently uses a table scan, which is fine for a low-volume personal portfolio helpdesk. If ticket volume grows, add GSIs for status and assignee queries.
- Outbound admin replies and assignment notifications are sent via SES.