// src/shared/services/supabase/supabase.service.ts
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

  async uploadImage(file: Express.Multer.File, path: string) {
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
}
