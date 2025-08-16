import { getAuthToken } from './auth';

interface UploadResponse {
  uploadUrl: string;
  fileId: string;
  mimeType: string;
}

interface UploadProgressCallback {
  (progress: number): void;
}

/**
 * Upload a file to the server
 */
export const uploadFile = async (
  file: File,
  onProgress?: UploadProgressCallback
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });

    // Configure and send request
    xhr.open('POST', '/api/uploads');
    xhr.timeout = 30000; // 30 second timeout

    // Add authorization header if available
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
};

/**
 * Upload a file from URL
 */
export const uploadFromUrl = async (url: string): Promise<UploadResponse> => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/uploads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  // Check file type
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please use PNG, JPG, or PDF',
    };
  }

  return { valid: true };
};

/**
 * Get file preview URL
 */
export const getFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    } else {
      reject(new Error('File type does not support preview'));
    }
  });
};

/**
 * Get upload status for a file
 * @param fileId - The file ID to check
 * @returns Promise with upload status
 */
export async function getUploadStatus(fileId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/uploads/${fileId}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get upload status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get upload status');
  }
}

/**
 * Delete an uploaded file
 * @param fileId - The file ID to delete
 * @returns Promise indicating success
 */
export async function deleteUpload(fileId: string): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/uploads/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete upload: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete upload');
  }
}

/**
 * Get list of user's uploads
 * @param limit - Maximum number of uploads to return
 * @param offset - Number of uploads to skip
 * @returns Promise with upload list
 */
export async function getUserUploads(
  limit: number = 20,
  offset: number = 0
): Promise<{
  uploads: Array<{
    fileId: string;
    uploadUrl: string;
    mimeType: string;
    fileName: string;
    fileSize: number;
    createdAt: string;
  }>;
  total: number;
}> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ''}/api/uploads?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get uploads: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get uploads');
  }
}

/**
 * Get file type icon and label
 * @param mimeType - The MIME type of the file
 * @returns Object with icon and label
 */
export function getFileTypeInfo(mimeType: string): {
  icon: string;
  label: string;
  color: string;
} {
  if (mimeType.startsWith('image/')) {
    return {
      icon: '🖼️',
      label: 'Image',
      color: 'text-blue-500',
    };
  }

  if (mimeType === 'application/pdf') {
    return {
      icon: '📄',
      label: 'PDF',
      color: 'text-red-500',
    };
  }

  return {
    icon: '📎',
    label: 'File',
    color: 'text-gray-500',
  };
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a URL is valid and allowed
 * @param url - The URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);

    // Check if it's a valid URL
    if (!urlObj.protocol.startsWith('http')) {
      return {
        isValid: false,
        error: 'URL must use HTTP or HTTPS protocol.',
      };
    }

    // Check for allowed domains (optional - can be configured)
    const allowedDomains = [
      'imgur.com',
      'i.imgur.com',
      'drive.google.com',
      'docs.google.com',
      'dropbox.com',
      'github.com',
      'raw.githubusercontent.com',
    ];

    const domain = urlObj.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith('.' + allowed)
    );

    if (!isAllowed) {
      return {
        isValid: false,
        error:
          'URL domain is not in the allowed list. Please use a supported file hosting service.',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format.',
    };
  }
}
