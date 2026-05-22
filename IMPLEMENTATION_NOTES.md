# Evolution API + n8n Integration - Implementation Notes

## Overview

This document describes the implementation of Evolution API (WhatsApp) and n8n (automation webhooks) integration into the CRM system.

## What Was Implemented

### 1. Database Schema Updates (`prisma/schema.prisma`)

Added three new fields to the `User` model to track WhatsApp connection:

```prisma
whatsappInstanceId    String?   // Evolution instance ID (e.g., "corretor_user123")
whatsappPhone         String?   // Connected phone number
whatsappStatus        String    @default("disconnected") // Status: disconnected|scanning|connected
```

**Migration:** `npx prisma migrate dev --name add_whatsapp_fields`

### 2. API Routes

Four new API routes were created for managing Evolution API integration:

#### `/api/users/profile` (GET/PUT)
- **GET**: Returns current authenticated user's profile including WhatsApp status
- **PUT**: Updates user profile (name, email, phone, creci)
- **Authentication**: Requires valid session

#### `/api/evolution/qrcode` (POST)
- **Purpose**: Generate a WhatsApp QR code for user connection
- **Process**:
  1. Creates an Evolution instance named `corretor_${userId}`
  2. Returns base64-encoded QR code image
  3. Updates user status to "scanning"
- **Environment Variables Required**:
  - `EVOLUTION_API_URL`: Base URL (default: http://evolution:8080)
  - `EVOLUTION_API_KEY`: API key for authentication

#### `/api/evolution/status` (GET)
- **Purpose**: Check WhatsApp connection status
- **Returns**: Current status and connected phone number
- **Auto-updates**: If Evolution reports "open" status, updates database to "connected"

#### `/api/evolution/disconnect` (POST)
- **Purpose**: Disconnect WhatsApp from user account
- **Process**:
  1. Calls Evolution API to delete instance
  2. Clears WhatsApp fields from user database
  3. Sets status to "disconnected"

### 3. Profile Page (`/src/app/(app)/profile/page.tsx`)

New user profile page with three sections:

#### Personal Information Section
- Display: Name, Email, Phone, CRECI, Role
- Edit modal for updating profile data
- Email uniqueness validation

#### WhatsApp Section
- Status indicator (Desconectado/Conectando/Conectado)
- If disconnected: "Conectar WhatsApp" button
- If scanning: Display QR code with auto-refresh every 3 seconds
- If connected: Show phone number and "Desconectar" button
- Auto-refresh polls `/api/evolution/status` every 3 seconds until connection detected

#### Security Section
- "Alterar Senha" button opens password change modal
- Validates password requirements (6+ characters minimum)
- Current password verification

### 4. Updated Components

#### `AppHeader` (`/src/components/app-header.tsx`)
- Avatar now links to `/profile` page
- Click to navigate to user's profile
- Maintains existing logout functionality

#### Settings Page (`/src/app/(app)/settings/page.tsx`)
- Added **Automações n8n** section
- Fields for:
  - n8n Base URL (e.g., https://n8n.nexusinovacoesimobiliarias.com.br)
  - n8n API Key
  - Webhook URL display for configuration in n8n
- Status indicator for n8n connection
- Test connection and save buttons (MVP - no backend implementation yet)

## Environment Variables

For local development, add to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/nexus_crm"
AUTH_SECRET="nexus-crm-secret-key-change-in-production-2026"
AUTH_URL="http://localhost:3000"
EVOLUTION_API_URL="http://evolution:8080"  # Local Docker network
EVOLUTION_API_KEY="your-evolution-api-key-here"  # Set via environment variable
```

**IMPORTANT**: Never commit `.env.local` or expose `EVOLUTION_API_KEY`. Use environment variables on VPS.

For VPS deployment, set environment variables in Docker service:

```bash
docker service update \
  --env-add EVOLUTION_API_URL="http://evolution:8080" \
  --env-add EVOLUTION_API_KEY="<your-api-key>" \
  nexusimoveis-crm
```

## Testing

### Local Testing

1. **Start Dev Server**:
   ```bash
   npm run dev
   ```

2. **Login**:
   - Email: `carlos@nexusimoveis.com.br`
   - Password: `corretor123`

3. **Test Profile Page**:
   - Click avatar in app header → navigate to `/profile`
   - View personal information
   - Try editing profile fields

4. **Test WhatsApp Connection**:
   - Click "Conectar WhatsApp" button
   - QR code will display
   - Status will show "Conectando"
   - Will auto-refresh every 3 seconds

5. **Test Password Change**:
   - Click "Alterar Senha" in Security section
   - Enter current and new passwords
   - Verify password validation

### API Testing

```bash
# Test profile endpoint (requires authentication)
curl -X GET http://localhost:3000/api/users/profile

# Expected response (without session): 307 Redirect to login

# Test with valid session cookie - profile data should return
```

## Deployment to VPS

### Prerequisites

1. PostgreSQL running with database `nexus_crm`
2. Evolution API running on VPS at port 8080
3. Docker Swarm deployed

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git push origin master
   ```

2. **On VPS, pull latest code**:
   ```bash
   cd /path/to/nexus-crm
   git pull origin master
   ```

3. **Rebuild Docker image**:
   ```bash
   docker build -t nexusimoveis-crm:latest .
   ```

4. **Update Docker service** (zero-downtime):
   ```bash
   docker service update \
     --image nexusimoveis-crm:latest \
     --update-parallelism 1 \
     --update-delay 10s \
     nexusimoveis-crm
   ```

5. **Verify deployment**:
   ```bash
   docker service ps nexusimoveis-crm
   curl -s https://crm.nexusinovacoesimobiliarias.com.br/api/users/profile
   # Should redirect to login (307) if not authenticated
   ```

## Future Enhancements (Phase 2)

1. **n8n API Integration**:
   - Programmatically create and manage workflows
   - Validate webhook connections
   - Display active workflows in settings

2. **Webhook Configuration**:
   - Allow users to configure custom webhook URLs
   - Validate webhook endpoints
   - Log webhook events for debugging

3. **Enhanced QR Code UI**:
   - Show QR code generation progress
   - Better error handling for Evolution API failures
   - Retry logic for failed connections

4. **Admin Dashboard**:
   - Overview of all connected WhatsApp instances
   - Bulk operations for managing multiple users
   - Connection statistics

## Troubleshooting

### QR Code Not Generating

1. Verify Evolution API is running:
   ```bash
   curl http://evolution:8080/instance/list
   ```

2. Check API key in environment variables:
   ```bash
   echo $EVOLUTION_API_KEY
   ```

3. Check server logs for Evolution API errors

### Profile Page Not Loading

1. Verify user is authenticated:
   - Check NextAuth session
   - Ensure cookies are not blocked

2. Check database connection:
   ```bash
   npx prisma db execute --stdin < "SELECT COUNT(*) FROM users;"
   ```

### Database Migration Issues

1. Reset and reseed locally (development only):
   ```bash
   npx prisma migrate reset
   ```

2. For production, create explicit migration:
   ```bash
   npx prisma migrate deploy
   ```

## Files Changed/Created

### New Files
- `/src/app/(app)/profile/page.tsx` (profile page)
- `/src/app/api/users/profile/route.ts` (user profile API)
- `/src/app/api/evolution/qrcode/route.ts` (QR code generation)
- `/src/app/api/evolution/status/route.ts` (status checking)
- `/src/app/api/evolution/disconnect/route.ts` (disconnection)

### Modified Files
- `prisma/schema.prisma` (database schema)
- `src/components/app-header.tsx` (profile link)
- `src/app/(app)/settings/page.tsx` (n8n section)

### Database
- `prisma/migrations/*/migration.sql` (new migration for WhatsApp fields)

## Notes

- All API routes use NextAuth session-based authentication
- WhatsApp status polling is client-side (every 3 seconds) during QR scanning
- Environment variables should be stored securely on VPS
- The implementation follows existing code patterns from agents page
- Tailwind CSS v4 styling is consistent with the rest of the application
