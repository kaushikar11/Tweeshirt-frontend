# Twitter API Setup Guide

## Issue: "Twitter API access is not available"

This error occurs when your Twitter app doesn't have the correct permissions to read tweets. Follow these steps to fix it:

### Step 1: Update Twitter App Permissions

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app (the one you're using for Tweeshirt)
3. Click on **"Settings"** or **"User authentication settings"**
4. Under **"App permissions"**, select **"Read"** (not just "Read and write")
5. Under **"Type of App"**, make sure it's set to **"Web App, Automated App or Bot"**
6. Under **"Callback URI / Redirect URL"**, ensure it includes:
   - `http://localhost:3000/api/auth/callback/twitter` (for development)
   - `https://yourdomain.com/api/auth/callback/twitter` (for production)
7. Click **"Save"**

### Step 2: Re-authenticate

After updating permissions, you need to sign out and sign in again to get new tokens with the correct scopes:

1. **Sign out** from Tweeshirt
2. **Clear your browser cookies** for localhost (optional but recommended)
3. **Sign in again** with Twitter
4. When Twitter asks for permissions, make sure to **approve** the request

### Step 3: Verify OAuth 2.0 Scopes

The app is configured to request these scopes:
- `tweet.read` - To read your tweets
- `users.read` - To read your user info
- `offline.access` - To refresh tokens

If Twitter still denies access, check:
- Your Twitter Developer account is approved (not in review)
- Your app is not suspended
- You have the correct OAuth 2.0 credentials (Client ID and Secret)

### Alternative: Manual Tweet Entry

If you don't want to configure Twitter API access, you can always:
1. Select **"From Tweet"** option
2. Click **"Fetch My Tweets"** (it will show an error)
3. **Manually paste your tweet** in the text field below
4. Continue with design generation

The manual entry works exactly the same way - it just doesn't fetch tweets automatically.

### Troubleshooting

**Error: "Twitter API access denied"**
- Your app permissions are not set to "Read"
- You haven't re-authenticated after changing permissions
- Your Twitter Developer account needs approval

**Error: "Unauthorized"**
- Your access token expired - sign out and sign in again
- Your Twitter app credentials are incorrect

**Error: "CLIENT_FETCH_ERROR"**
- This is usually harmless and can be ignored
- It happens when NextAuth tries to fetch session before the API is ready
- The app should still work normally

