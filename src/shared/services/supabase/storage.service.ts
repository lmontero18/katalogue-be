import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async uploadImage(file: Express.Multer.File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('catalogue-assets')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    return this.supabase.storage
      .from('catalogue-assets')
      .getPublicUrl(data.path).data.publicUrl;
  }

  async deleteImageByUrl(url: string): Promise<void> {
    const parts = url.split('/storage/v1/object/public/');
    const path = parts[1]; // e.g. 'catalogue-assets/products/abc.jpg'

    if (!path || !path.startsWith('catalogue-assets/')) return;

    const objectPath = path.replace('catalogue-assets/', '');

    const { error } = await this.supabase.storage
      .from('catalogue-assets')
      .remove([objectPath]);

    if (error) throw error;
  }

  async deleteImagesByUrls(urls: string[]): Promise<void> {
    const paths = urls
      .map((url) => url.split('/storage/v1/object/public/')[1])
      .filter((path) => path?.startsWith('catalogue-assets/'))
      .map((path) => path.replace('catalogue-assets/', ''));

    if (paths.length === 0) return;

    const { error } = await this.supabase.storage
      .from('catalogue-assets')
      .remove(paths);

    if (error) throw error;
  }
}
