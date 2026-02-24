# Supabase Helpdesk Setup Guide

## 1. Create Supabase Account & Project

1. Go to https://supabase.com and sign up (it's free)
2. Create a new project
3. Wait for the project to finish setting up (~2 minutes)

## 2. Create the Tickets Table

In your Supabase dashboard:

1. Go to **Table Editor** in the left sidebar
2. Click **New Table**
3. Name it: `tickets`
4. Add these columns:

| Column Name | Type | Default Value | Extra Settings |
|------------|------|---------------|----------------|
| id | uuid | `gen_random_uuid()` | Primary Key, NOT NULL |
| created_at | timestamptz | `now()` | NOT NULL |
| name | text | - | NOT NULL |
| email | text | - | NOT NULL |
| subject | text | - | NOT NULL |
| message | text | - | NOT NULL |
| status | text | `'open'` | NOT NULL |
| assignee_email | text | - | - |
| resolved_at | timestamptz | - | - |

5. Click **Save**

## 3. Set Up Row Level Security (RLS)

In the Table Editor, click on your `tickets` table, then click **RLS** button:

1. **Enable RLS** on the tickets table
2. Add these policies:

### Policy 1: Allow public inserts (anon + authenticated)
- **Policy name:** `Allow public to create tickets`
- **Policy command:** INSERT
- **Target roles:** anon
- **USING expression:** (leave empty)
- **WITH CHECK expression:** `true`

### Policy 2: Allow authenticated users to read (for admin)
- **Policy name:** `Allow authenticated users to view all tickets`
- **Policy command:** SELECT
- **Target roles:** authenticated
- **USING expression:** `true`

### Policy 3: Allow authenticated users to update (for admin)
- **Policy name:** `Allow authenticated users to update tickets`
- **Policy command:** UPDATE
- **Target roles:** authenticated
- **USING expression:** `true`
- **WITH CHECK expression:** `true`

## 4. Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Open **Data API** to copy the **Project URL**
3. Open **API Keys** to copy the **anon public** key

## 5. Configure Your Local Environment

1. Create a `.env` file in the `Website.code` directory:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Add `.env` to your `.gitignore` (should already be there)

## 6. Install Dependencies

```bash
cd Website.code
npm install @supabase/supabase-js
```

## 7. Create Your Admin Account

In Supabase dashboard:
1. Go to **Authentication** in the left sidebar
2. Click **Add user** → **Create new user**
3. Enter your email: `alistair.m.sweeting@gmail.com`
4. Set a secure password
5. Click **Create user**

## 8. Create the Ticket Replies Table

Create a new table named `ticket_replies` with the following columns:

| Column Name | Type | Default Value | Extra Settings |
|------------|------|---------------|----------------|
| id | uuid | `gen_random_uuid()` | Primary Key, NOT NULL |
| created_at | timestamptz | `now()` | NOT NULL |
| ticket_id | uuid | - | NOT NULL, Foreign Key -> tickets.id |
| author_email | text | - | NOT NULL |
| body | text | - | NOT NULL |
| direction | text | `'outbound'` | NOT NULL |
| message_id | text | - | - |

### RLS for ticket_replies

1. Enable RLS on `ticket_replies`
2. Add policies:

**Policy: Allow authenticated read replies**
- Command: SELECT
- Roles: authenticated
- USING: `true`

**Policy: Allow authenticated create replies**
- Command: INSERT
- Roles: authenticated
- WITH CHECK: `true`

Note: Inbound replies are inserted by the Edge Function using the service role key and bypass RLS.

## 9. Set Up Email Notifications (Edge Function)

This setup uses a Supabase Edge Function + Resend for outbound email, and an inbound webhook for replies.

### 9.1 Resend setup
1. Create a Resend account: https://resend.com
2. Verify your sender domain or sender email
3. Create an API key

> Note: If you want messages to come "from" your Gmail address, your provider must allow and verify that sender. Otherwise, set your Gmail as reply-to instead.

### 9.2 Configure secrets for Edge Function

Set these secrets in Supabase:

```bash
supabase secrets set RESEND_API_KEY=your-resend-api-key
```

Optional: Set a custom reply-to email (defaults to alistair.m.sweeting@gmail.com):
```bash
supabase secrets set HELPDESK_REPLY_TO_EMAIL=alistair.m.sweeting@gmail.com

### 9.3 Deploy the function

```bash
supabase functions deploy helpdesk-reply
```

### 9.4 Inbound replies

Configure your email provider to send inbound webhooks to:

```
https://<your-project-ref>.functions.supabase.co/helpdesk-reply
```

The function expects JSON like:

```json
{
   "type": "inbound",
   "ticketId": "<ticket-id>",
   "from": "user@example.com",
   "subject": "Re: ...",
   "message": "Their reply",
   "messageId": "optional"
}
```

If your provider sends a different payload, you will need to map it in the function.

## 10. Configure Neocities Deployment

### Option A: Using Supabase Database Webhooks

1. Go to **Database** → **Webhooks** in Supabase
2. Create a new webhook triggered on INSERT to `tickets` table
3. Use a service like:
   - **Make.com** (Integromat) - Free tier available
   - **Zapier** - Has email integration
   - **n8n** - Self-hosted workflow automation

### Option B: Using Supabase Edge Functions (More work but free)

1. Install Supabase CLI: `npm install -g supabase`
2. Create an edge function that sends emails via SendGrid or similar
3. Trigger it via database triggers

### Option C: Simple Email Service

Use **EmailJS** or **SendGrid** API directly from the form submission
- Less reliable (client-side)
- But simplest to set up

## 9. Configure Neocities Deployment

Since you're using environment variables, you'll need to either:

1. **Build locally with env vars** before deploying:
   - Make sure `.env` exists locally
   - Run `npm run build` (will use your .env file)
   - Deploy the `dist/` folder as usual

2. **Or hardcode values in production** (less secure):
   - Create a `src/lib/supabase.prod.js` with hardcoded values
   - Only use for the anon key (which is safe to expose)

**Note:** The anon public key is safe to expose publicly - it's designed for client-side use. RLS policies protect your data.

## 11. Test Everything

1. Start dev server: `npm run dev`
2. Submit a test ticket at `/helpdesk`
3. Check Supabase Table Editor - should see the ticket
4. Go to `/#/helpdesk/admin` 
5. Log in with your admin account
6. Verify you can see and update tickets
7. Add a reply and confirm it appears in `ticket_replies`

## Troubleshooting

### "Failed to submit ticket"
- Check browser console for errors
- Verify .env file exists and has correct values
- Check Supabase RLS policies are set up correctly
 - If you are logged in as an admin, make sure INSERT is allowed for both `anon` and `authenticated`
- Confirm you are using the anon public key (the JWT-looking key), not the publishable key
- If you use `.select()` after insert, you must also allow SELECT for `anon`

### "Cannot read tickets"
- Make sure you're logged in
- Check RLS policy for SELECT is enabled for authenticated users
- Look in browser console for auth errors

### Email notifications not working
- Set up webhooks or edge functions as described above
- Consider using a third-party service for reliability

## Database Indexes for Performance

Once you have many tickets, add these indexes in **SQL Editor**:

```sql
-- Index on status for filtering
CREATE INDEX idx_tickets_status ON tickets(status);

-- Index on created_at for sorting
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Index on email for searching
CREATE INDEX idx_tickets_email ON tickets(email);
```

## Security Notes

- ✅ Anon key is safe to expose (it's meant for public use)
- ✅ RLS policies prevent unauthorized access
- ✅ Admin credentials should never be in code (use Supabase Auth)
- ⚠️ Keep your service_role key secret (don't use it in frontend)
- ⚠️ Always use HTTPS in production

---

Need help? Check Supabase docs: https://supabase.com/docs
