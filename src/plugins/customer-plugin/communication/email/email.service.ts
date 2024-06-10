import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import 'dotenv/config';

@Injectable()
export class EmailService {
  async sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { success: false, message: 'Failed to send OTP email' };
    }
  }
}
