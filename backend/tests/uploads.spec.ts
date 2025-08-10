import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { executeWithRetry } from '../../db';
import { authService } from '../src/services/auth.service';

describe('Upload API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    testUserId = 'test-user-uploads';
    authToken = authService.generateToken({
      userId: testUserId,
      email: 'test@example.com',
    });
  });

  afterAll(async () => {
    await executeWithRetry(async (client) => {
      await client.from('proofs').delete().eq('user_id', testUserId);
    });
  });

  describe('POST /api/uploads', () => {
    it('should upload a valid image file', async () => {
      const testFile = Buffer.from('fake image data');

      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFile, 'test-image.jpg')
        .expect(200);

      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body).toHaveProperty('fileId');
      expect(response.body).toHaveProperty('mimeType', 'image/jpeg');
    });

    it('should reject invalid file types', async () => {
      const testFile = Buffer.from('text file content');

      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFile, 'test.txt')
        .expect(400);

      expect(response.body.error).toContain('Invalid file type');
    });

    it('should reject oversized files', async () => {
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFile, 'large-file.jpg')
        .expect(400);

      expect(response.body.error).toContain('File size exceeds 10MB limit');
    });

    it('should require authentication', async () => {
      const testFile = Buffer.from('test image data');

      const response = await request(app)
        .post('/api/uploads')
        .attach('file', testFile, 'test.jpg')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should upload from URL', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          url: 'https://github.com/example/repo/blob/main/README.md',
        })
        .expect(200);

      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body).toHaveProperty('fileId');
      expect(response.body).toHaveProperty('mimeType', 'application/url');
    });

    it('should store file metadata in database', async () => {
      const testFile = Buffer.from('test image data');

      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFile, 'metadata-test.jpg')
        .expect(200);

      const fileId = response.body.fileId;

      const fileData = await executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('proofs')
          .select('*')
          .eq('file_id', fileId)
          .eq('user_id', testUserId)
          .single();

        if (error) throw error;
        return data;
      });

      expect(fileData).toBeDefined();
      expect(fileData.user_id).toBe(testUserId);
      expect(fileData.mime_type).toBe('image/jpeg');
    });
  });

  describe('GET /api/uploads/:fileId', () => {
    let testFileId: string;

    beforeAll(async () => {
      const testFile = Buffer.from('test image data');

      const response = await request(app)
        .post('/api/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFile, 'get-test.jpg');

      testFileId = response.body.fileId;
    });

    it('should retrieve file metadata', async () => {
      const response = await request(app)
        .get(`/api/uploads/${testFileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('fileId', testFileId);
      expect(response.body).toHaveProperty('uploadUrl');
      expect(response.body).toHaveProperty('mimeType');
    });

    it('should return 404 for non-existent files', async () => {
      const response = await request(app)
        .get('/api/uploads/non-existent-file')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('File not found');
    });
  });
});
