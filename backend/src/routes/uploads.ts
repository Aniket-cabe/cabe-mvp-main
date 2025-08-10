import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { executeWithRetry } from '../../db';
import { envWithHelpers } from '../config/env';
import logger from '../utils/logger';
import { authService } from '../services/auth.service';

const router = Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          'Invalid file type. Only PNG, JPG, and PDF files are allowed.'
        )
      );
    }
    cb(null, true);
  },
});

// Zod schema for URL upload
const urlUploadSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

/**
 * POST /api/uploads
 * Upload a file or URL
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyToken(token);

    // Handle file upload
    if (req.file) {
      const file = req.file;

      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }

      // Generate unique file ID
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In a real implementation, you would upload to cloud storage here
      // For now, we'll simulate the upload
      const uploadUrl = `${envWithHelpers.BASE_URL}/uploads/${fileId}`;

      // Store file metadata in database
      await executeWithRetry(async (client) => {
        const { error } = await client.from('proofs').insert({
          file_id: fileId,
          user_id: userId,
          upload_url: uploadUrl,
          mime_type: file.mimetype,
          file_size: file.size,
          original_name: file.originalname,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      });

      logger.info(`✅ File uploaded successfully: ${fileId} by user ${userId}`);

      res.json({
        uploadUrl,
        fileId,
        mimeType: file.mimetype,
        size: file.size,
      });
    }
    // Handle URL upload
    else if (req.body.url) {
      const validation = urlUploadSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid URL format',
          details: validation.error.errors,
        });
      }

      const { url } = validation.data;

      // Validate URL domain (optional security measure)
      const urlObj = new URL(url);
      const allowedDomains = [
        'github.com',
        'gitlab.com',
        'bitbucket.org',
        'gist.github.com',
      ];
      if (!allowedDomains.some((domain) => urlObj.hostname.includes(domain))) {
        return res.status(400).json({ error: 'URL domain not allowed' });
      }

      // Generate unique file ID for URL
      const fileId = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store URL metadata in database
      await executeWithRetry(async (client) => {
        const { error } = await client.from('proofs').insert({
          file_id: fileId,
          user_id: userId,
          upload_url: url,
          mime_type: 'application/url',
          file_size: 0,
          original_name: url,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      });

      logger.info(`✅ URL uploaded successfully: ${fileId} by user ${userId}`);

      res.json({
        uploadUrl: url,
        fileId,
        mimeType: 'application/url',
      });
    } else {
      return res.status(400).json({ error: 'No file or URL provided' });
    }
  } catch (error) {
    logger.error('❌ Upload error:', error);

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ error: 'File upload error' });
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid file type')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Invalid or expired token')) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
    }

    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

/**
 * GET /api/uploads/:fileId
 * Get file metadata
 */
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyToken(token);

    // Get file metadata from database
    const fileData = await executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('proofs')
        .select('*')
        .eq('file_id', fileId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    });

    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      fileId: fileData.file_id,
      uploadUrl: fileData.upload_url,
      mimeType: fileData.mime_type,
      size: fileData.file_size,
      originalName: fileData.original_name,
      createdAt: fileData.created_at,
    });
  } catch (error) {
    logger.error('❌ Get file error:', error);

    if (
      error instanceof Error &&
      error.message.includes('Invalid or expired token')
    ) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    res.status(500).json({ error: 'Failed to retrieve file information' });
  }
});

/**
 * DELETE /api/uploads/:fileId
 * Delete a file
 */
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const { userId } = authService.verifyToken(token);

    // Delete file from database
    await executeWithRetry(async (client) => {
      const { error } = await client
        .from('proofs')
        .delete()
        .eq('file_id', fileId)
        .eq('user_id', userId);

      if (error) throw error;
    });

    // In a real implementation, you would also delete from cloud storage here

    logger.info(`✅ File deleted successfully: ${fileId} by user ${userId}`);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('❌ Delete file error:', error);

    if (
      error instanceof Error &&
      error.message.includes('Invalid or expired token')
    ) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
