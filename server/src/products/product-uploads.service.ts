import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UTApi, UTFile } from 'uploadthing/server';

@Injectable()
export class ProductUploadsService {
  private createClient() {
    const token = process.env.UPLOADTHING_TOKEN;

    if (!token) {
      throw new InternalServerErrorException('UPLOADTHING_TOKEN sozlanmagan');
    }

    return new UTApi({ token });
  }

  async uploadProductImage(file: Express.Multer.File) {
    try {
      const uploadClient = this.createClient();
      const fileBytes = Uint8Array.from(file.buffer);
      const uploadFile = new UTFile([fileBytes], this.buildFileName(file.originalname), {
        type: file.mimetype,
        lastModified: Date.now(),
      });
      const result = await uploadClient.uploadFiles(uploadFile, {
        contentDisposition: 'inline',
      });

      if (result.error || !result.data?.url) {
        throw new InternalServerErrorException(
          result.error?.message || 'Rasmni UploadThing ga yuklab bo‘lmadi',
        );
      }

      return {
        key: result.data.key,
        url: result.data.url,
        name: result.data.name,
        size: result.data.size,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Noma’lum yuklash xatosi';
      console.error('UploadThing image upload failed:', error);
      throw new InternalServerErrorException(`UploadThing xatosi: ${message}`);
    }
  }

  private buildFileName(originalName: string) {
    const cleanName = originalName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${Date.now()}-${cleanName || 'product-image'}`;
  }
}
