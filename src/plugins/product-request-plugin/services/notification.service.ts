import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificationService {
  constructor(/* Add any dependencies or configuration needed */) {}

  async sendNotificationToSeller(
    seller: any,
    productRequest: {ProductRequestId?: string; ProductName?: string},
  ): Promise<void> {
    const notificationMessage = `New product request: ${productRequest}`;

    // Send the notification to the seller's device
    try {
      // Example: sending a notification using Firebase Cloud Messaging (FCM)
      const fcmToken = seller.deviceToken; // Assuming deviceToken is stored in the Seller entity
    //   const response = await firebaseAdmin.messaging().sendToDevice(fcmToken, {
    //     notification: {
    //       title: 'New Product Request',
    //       body: notificationMessage
    //     }
    //   });

      // Handle the response (log errors, etc.)
      console.log('Notification sent to seller:');
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new Error('Failed to send push notification');
    }
  }
}
