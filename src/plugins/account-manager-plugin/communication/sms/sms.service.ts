import { Injectable } from '@nestjs/common';
import axios from 'axios';
import 'dotenv/config';

@Injectable()
export class SmsService {
  private api_key: string = process.env.SMS_API_KEY || '';

  async sendOtpSms(phoneNumber: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const message = { 
      text: `Your OTP is ${otp}`
    }
    console.log(message)
    try {
      // Construct the SMS API endpoint
      const smsApiEndpoint = `https://sms.arkesel.com/sms/api?action=send-sms&${this.api_key}=&to=${phoneNumber}&from=spareOTP&sms=${message.text}`;
      // Send the SMS using Axios or your preferred HTTP client
      const result = await axios.get(smsApiEndpoint);
      console.log(result.data)
      return result.data;
    } catch (error) {
      console.error('Failed to send OTP SMS:', error);
      return { success: false, message: 'Failed to send OTP SMS' };
    }
  }
}

