import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { QRCodeService } from '../services/qr-code.service';

@Resolver()
export class QRCodeResolver {
  constructor(private readonly qrCodeService: QRCodeService) {}

  @Query(() => String)
  async generateQRCode(@Args('text') text: string): Promise<string> {
    return this.qrCodeService.generateQRCode(text);
  }

  @Mutation(() => String)
  async scanQRCode(
    @Args('file') file: any
  ): Promise<string> {
    const { createReadStream, filename } = file;
    const path = `./uploads/${filename}`;
    const stream = createReadStream();
    const out = require('fs').createWriteStream(path);
    stream.pipe(out);
    await new Promise((resolve) => out.on('finish', resolve));

    return this.qrCodeService.scanQRCode(path);
  }
}
