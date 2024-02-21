import { Injectable, NestMiddleware } from '@nestjs/common';
import multer from 'multer';

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: any, res: any, next: () => void) {
    // Create a Multer instance with the desired configuration
    const upload = multer({ dest: 'uploads/' }).single('file');

    // Use the created Multer instance as middleware
    upload(req, res, (err: any) => {
      if (err) {
        console.log(err)
        return res.status(500).json({
          message: 'Error uploading file',
          error: err
        });
      }
      next();
    });
  }
}
