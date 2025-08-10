import { executeWithRetry } from '../../db';
import { v4 as uuidv4 } from 'uuid';

export interface StoredProofMeta {
  fileId: string;
  userId: string;
  uploadUrl: string;
  storagePath?: string;
  mimeType: string;
  fileSize: number;
  originalName: string;
  createdAt: string;
}

export class UploadsService {
  static async saveProofMeta(
    meta: Omit<StoredProofMeta, 'createdAt'>
  ): Promise<StoredProofMeta> {
    const createdAt = new Date().toISOString();
    await executeWithRetry(async (client) => {
      const { error } = await client.from('proofs').insert({
        file_id: meta.fileId,
        user_id: meta.userId,
        upload_url: meta.uploadUrl,
        storage_path: meta.storagePath || null,
        mime_type: meta.mimeType,
        file_size: meta.fileSize,
        original_name: meta.originalName,
        created_at: createdAt,
      });
      if (error) throw error;
    });
    return { ...meta, createdAt };
  }
}

export default UploadsService;
