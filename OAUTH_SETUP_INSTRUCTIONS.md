# Google OAuth Setup Instructions

## Current Status: Development Mode Active

The authentication system is currently running in **development mode** with mock authentication. This allows you to test the login flow without Google Console access.

## Testing the Current Implementation

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Navigate to `http://localhost:5173`
   - You'll see the login screen with a "Development Mode" notice
   - Click "Sign in (Development)" to use the mock authentication
   - You'll be logged in as "Test User" with email `test.user@hippodigital.co.uk`

## Setting Up Google OAuth (When Ready)

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Sign in with your @hippodigital.co.uk account

2. **Create or Select Project**:
   - Create a new project or select existing one
   - Name suggestion: "Talking Talent App"

3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Talking Talent Web App"

5. **Configure Authorized Origins**:
   ```
   http://localhost:5173
   https://*.vercel.app
   https://your-production-domain.com
   ```

6. **Configure Authorized Redirect URIs**:
   ```
   http://localhost:5173
   https://*.vercel.app
   https://your-production-domain.com
   ```

7. **Copy Client ID**:
   - Save the generated Client ID
   - You'll need this for environment variables

### Step 2: Environment Configuration

1. **Create Local Environment File**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add Your Google Client ID**:
   ```bash
   # .env.local
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

### Step 3: Vercel Environment Variables (For Deployment)

1. **Vercel Dashboard**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"

2. **Add Environment Variable**:
   - Name: `VITE_GOOGLE_CLIENT_ID`
   - Value: Your Google Client ID
   - Apply to: Production, Preview, Development

3. **Redeploy**:
   - Push to your branch or redeploy manually
   - The preview deployment will now use real Google OAuth

### Step 4: Domain Verification (Optional)

For production domains, you may need to verify domain ownership:

1. **Google Search Console**:
   - Go to: https://search.google.com/search-console
   - Add and verify your domain

2. **Update OAuth Configuration**:
   - Add verified domains to authorized origins
   - Update redirect URIs accordingly

## Testing OAuth Integration

### Valid Test Cases ✅
- Try logging in with your @hippodigital.co.uk email
- Verify user info displays correctly in header
- Test logout functionality

### Invalid Test Cases ❌
- Try logging in with @gmail.com (should be rejected)
- Try logging in with @hippo-digital.co.uk (should be rejected)
- Verify error messages are clear and helpful

## Switching Between Modes

### Development Mode (Current)
- No Google Client ID configured
- Uses mock authentication
- Shows development mode indicator
- Perfect for testing without external dependencies

### Production Mode
- Google Client ID configured in environment
- Real Google OAuth flow
- Domain restrictions enforced
- Production-ready security

## Security Considerations

### Domain Restrictions
- Only `@hippodigital.co.uk` emails allowed
- Validation happens at multiple levels:
  1. Google OAuth configuration (primary)
  2. Client-side validation (user experience)
  3. Token claims validation (security)

### Token Security
- Tokens stored in localStorage with expiry
- Automatic cleanup on logout
- Session management handles token refresh

### HTTPS Requirements
- OAuth requires HTTPS in production
- Vercel provides automatic HTTPS
- Local development works with HTTP

## Troubleshooting

### Common Issues

1. **"OAuth Error: Invalid Domain"**
   - Check authorized origins in Google Console
   - Ensure domain matches exactly (include/exclude www)

2. **"Development Mode" Always Shows**
   - Verify environment variable is set: `VITE_GOOGLE_CLIENT_ID`
   - Restart development server after setting env vars
   - Check .env.local file exists and has correct format

3. **Login Popup Blocked**
   - Enable popups for your domain
   - Try different browser
   - Check browser console for errors

4. **"Access Denied" for Valid Emails**
   - Verify email domain is exactly `hippodigital.co.uk`
   - Check for typos in domain validation
   - Ensure user's Google account is verified

### Debug Mode
Check browser console for authentication logs:
- Authentication state changes
- OAuth flow progress
- Error messages with details

## Next Steps

1. **Current**: Test in development mode
2. **When ready**: Configure Google Console and environment variables
3. **Deploy**: Push to Vercel for preview testing
4. **Production**: Merge to main branch when satisfied

The system is designed to work seamlessly in both modes, so you can continue development and testing while waiting for Google Console access.