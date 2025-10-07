# Meta WhatsApp Business API Setup Guide

This guide will help you set up Meta WhatsApp Business API for OTP verification in your AIADMK membership form.

## Prerequisites

1. **Meta Business Account**: You need a Meta Business Manager account
2. **WhatsApp Business Account**: Set up through Meta Business Manager
3. **Phone Number**: A business phone number for WhatsApp Business API

## Step 1: Create Meta Business Manager Account

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Create a new business account or use existing one
3. Verify your business information

## Step 2: Set Up WhatsApp Business API

1. In Meta Business Manager, go to **WhatsApp Manager**
2. Click **Get Started** and follow the setup process
3. Add your business phone number
4. Complete phone number verification

## Step 3: Create a Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Business** as app type
4. Fill in app details and create the app

## Step 4: Add WhatsApp Product

1. In your Meta app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select your WhatsApp Business Account
4. Choose your phone number

## Step 5: Get API Credentials

### Important: Getting the Correct Phone Number ID

The error you're seeing (`Object with ID 'XXXXXXXXX' does not exist`) means you're using an incorrect Phone Number ID. Here's how to get the correct one:

1. **Go to WhatsApp Manager**: [business.facebook.com/wa/manage](https://business.facebook.com/wa/manage)
2. **Select your WhatsApp Business Account**
3. **Go to Phone Numbers tab**
4. **Find your verified phone number**
5. **Copy the Phone Number ID** (it's a long number, different from your actual phone number)

### Access Token
1. In WhatsApp > Getting Started
2. Copy the **Temporary Access Token** (for testing)
3. For production, create a **System User** with WhatsApp permissions

### Phone Number ID
1. In WhatsApp > Getting Started
2. Find your phone number and copy the **Phone Number ID** (NOT your actual phone number)
3. **IMPORTANT**: The Phone Number ID is a unique identifier assigned by Meta, not your actual phone number

### Business Account ID
1. In WhatsApp > Getting Started
2. Copy the **WhatsApp Business Account ID**

## Step 6: Create Message Templates

WhatsApp requires pre-approved templates for business messages:

1. Go to **WhatsApp Manager** > **Message Templates**
2. Click **Create Template**
3. Create an OTP template like this:

```
Template Name: otp_verification
Category: AUTHENTICATION
Language: English

Template Content:
Your AIADMK membership verification code is {{1}}. This code will expire in 5 minutes. Do not share this code with anyone.
```

4. Submit for approval (usually takes 24-48 hours)

## Step 7: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your credentials:

```env
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token_here
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
```

## Step 8: Update Template Name

In `src/services/whatsappAPI.ts`, update the template name:

```typescript
template: {
  name: 'otp_verification', // Your approved template name
  language: {
    code: 'en'
  },
  // ...
}
```

## Step 9: Test the Integration

1. Start your development server: `npm run dev`
2. Enter a valid WhatsApp number (with country code)
3. Click "Send WhatsApp OTP"
4. Check your WhatsApp for the OTP message
5. Enter the OTP to verify

## Production Considerations

### Security
- Never expose access tokens in frontend code
- Use a backend API to handle WhatsApp API calls
- Implement rate limiting for OTP requests
- Store OTPs securely (not in localStorage)

### Webhook Setup
Set up webhooks to receive message delivery status:

1. In your Meta app, go to WhatsApp > Configuration
2. Add your webhook URL
3. Subscribe to message events
4. Verify webhook with your verify token

### Rate Limits
- WhatsApp has rate limits for message sending
- Implement proper error handling for rate limit responses
- Consider implementing exponential backoff for retries

### Template Management
- Keep templates simple and compliant
- Have backup templates approved
- Monitor template status and performance

## Troubleshooting

### Common Issues

1. **"Object with ID 'XXXXXXXXX' does not exist" error**
   - You're using the wrong Phone Number ID
   - Go to WhatsApp Manager > Phone Numbers and copy the correct Phone Number ID
   - Make sure you're using the Phone Number ID, not your actual phone number
   - Ensure your phone number is verified in WhatsApp Business Account

1. **"Template not found" error**
   - Ensure template is approved
   - Check template name spelling
   - Verify template language code

2. **"Phone number not registered" error**
   - Ensure phone number is added to WhatsApp Business Account
   - Check phone number format (include country code)

3. **"Access token expired" error**
   - Generate new access token
   - For production, use System User tokens

4. **"Rate limit exceeded" error**
   - Implement rate limiting in your app
   - Wait before retrying
   - Consider using different phone numbers for testing

### Testing Tips

- **Demo Mode**: The app automatically falls back to demo mode if API credentials are missing or invalid
- **Check Console**: Look at browser console for demo OTP codes when testing
- Use WhatsApp Business API Test Numbers for development
- Test with different phone number formats
- Verify OTP expiration logic
- Test error scenarios (invalid OTP, expired OTP, etc.)

## Support

- [Meta WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business API Support](https://business.whatsapp.com/support)
- [Meta Business Help Center](https://www.facebook.com/business/help)

## Demo Mode

The current implementation includes a demo mode that works without real API credentials. When you're ready to go live:

1. Replace placeholder credentials with real ones
2. Remove demo mode logic from `whatsappService.sendOTP()`
3. Implement proper backend API for security
4. Set up webhook handling for message status updates