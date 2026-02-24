# Supabase Edge Functions

## helpdesk-reply

Handles outbound email replies and inbound email webhooks for Helpdesk tickets.

### Required secrets

Set these in Supabase CLI or dashboard secrets:

- SUPABASE_URL (auto-set)
- SUPABASE_SERVICE_ROLE_KEY (auto-set)
- RESEND_API_KEY
- HELPDESK_REPLY_TO_EMAIL (optional, defaults to alistair.m.sweeting@gmail.com)

### Local testing

```
supabase functions serve helpdesk-reply --no-verify-jwt
```

### Deploy

```
supabase functions deploy helpdesk-reply
```
