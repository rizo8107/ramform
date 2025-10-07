import { membershipService } from './membershipService';
// Meta WhatsApp Business API Service
interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

interface SendMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

interface WhatsAppError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = 'https://graph.facebook.com/v19.0';

  constructor() {
    // Meta WhatsApp API credentials from n8n workflow
    this.config = {
      accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      webhookVerifyToken: import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''
    };
    
    // Debug log to check what phone number ID is being used
    console.log('WhatsApp Phone Number ID:', this.config.phoneNumberId);
  }

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via WhatsApp
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; otp?: string; messageId?: string; error?: string }> {
    try {
      // Validate credentials
      if (!this.config.accessToken || !this.config.phoneNumberId) {
        return { 
          success: false, 
          error: 'WhatsApp API credentials not configured. Please check your environment variables.' 
        };
      }

      // Remove any non-digit characters and ensure proper format
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`;
      
      const otp = this.generateOTP();
      
      // Store OTP in database instead of localStorage
      const storeResult = await membershipService.storeOTP(formattedPhoneNumber, otp);
      if (!storeResult.success) {
        return { success: false, error: storeResult.error };
      }

      const messageData = {
        messaging_product: 'whatsapp',
        to: formattedPhoneNumber,
        type: 'template',
        template: {
          name: 'auth1',
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            }
          ]
        }
      };

      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData as WhatsAppError;
        console.error('WhatsApp API Error:', error);
        
        let errorMessage = 'Failed to send WhatsApp OTP';
        
        if (error.error?.code === 100 && error.error?.error_subcode === 33) {
          errorMessage = 'Invalid Phone Number ID. Please check your WhatsApp Business API configuration.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return { 
          success: false, 
          error: errorMessage 
        };
      }

      const successResponse = responseData as SendMessageResponse;
      console.log('WhatsApp OTP sent successfully:', successResponse);

      return {
        success: true,
        messageId: successResponse.messages[0]?.id
      };

    } catch (error) {
      console.error('Error sending WhatsApp OTP:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      };
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<{ success: boolean; error?: string }> {
    // Use database-based OTP verification
    return await membershipService.verifyOTP(phoneNumber, enteredOTP);
  }

  // Send a simple text message (for notifications)
  async sendTextMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      const formattedPhoneNumber = cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`;

      const messageData = {
        messaging_product: 'whatsapp',
        to: formattedPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData as WhatsAppError;
        console.error('WhatsApp API Error:', error);
        return { 
          success: false, 
          error: error.error?.message || 'Failed to send WhatsApp message' 
        };
      }

      const successResponse = responseData as SendMessageResponse;
      return {
        success: true,
        messageId: successResponse.messages[0]?.id
      };

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
export default WhatsAppService;