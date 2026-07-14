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
  - Cognito User Pool
  - SES

## 1. Install backend dependencies

From `aws/helpdesk`:

```bash
npm install
```

## 2. Deploy the backend stack

From `aws/helpdesk`:

```bash
sam build
sam deploy --guided
```

Provide values for:

- `HelpdeskFromEmail`
- `HelpdeskNotificationEmails`
- `HelpdeskAppUrl`

`HelpdeskFromEmail` must already be verified in Amazon SES.

## 3. Create your first Cognito admin user (type your password directly)

After deploy, open CloudFormation stack outputs and copy:

- `HelpdeskAdminUserPoolId`

Then create the admin user in Cognito:

1. Open Cognito in `eu-west-2`
2. Open user pool `portfolio-helpdesk-admins`
3. Go to Users, click Create user
4. Enter your email
5. Set a temporary password and create
6. Open that user and set a permanent password

You can also do this with AWS CLI:

```bash
aws cognito-idp admin-create-user \
  --region eu-west-2 \
  --user-pool-id <HelpdeskAdminUserPoolId> \
  --username you@example.com \
  --user-attributes Name=email,Value=you@example.com Name=name,Value="Your Name" \
  --temporary-password 'TempPassword123!'

aws cognito-idp admin-set-user-password \
  --region eu-west-2 \
  --user-pool-id <HelpdeskAdminUserPoolId> \
  --username you@example.com \
  --password 'YourRealPassword123!' \
  --permanent
```

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
- Admin authentication now uses Cognito User Pool (`USER_PASSWORD_AUTH`).
- Outbound admin replies and assignment notifications are sent via SES.