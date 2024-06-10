import { Injectable } from '@nestjs/common';
import axios from 'axios';
import 'dotenv/config';

@Injectable()
export class SmsService {
  private api_key: string = process.env.SMS_API_KEY || '';
  private senderId: string = 'SpePas';
  private url: string = 'https://sms.arkesel.com/sms/api';
  async sendSms(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const smsApiEndpoint = `${this.url}/?action=send-sms&api_key=${this.api_key}&to=${phoneNumber}&from=${this.senderId}&sms=${message}`;
      const result = await axios.get(smsApiEndpoint);
      
      return result.data;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return { success: false, message: 'Failed to send SMS' };
    }
  }
}
