import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import jsQR from 'jsqr';

@Injectable()
export class QRCodeService {
  async generateQRCode(text: string): Promise<string> {
    try {
      const qr = await QRCode.toDataURL(text);
      return qr;
    } catch (err) {
      throw new Error('Error generating QR code');
    }
  }

  async scanQRCode(imagePath: string): Promise<string> {
    try {
      const img = await loadImage(imagePath);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);

      if (code) {
        return code.data;
      } else {
        throw new Error('No QR code found');
      }
    } catch (err) {
      throw new Error('Error processing QR code');
    }
  }
}
