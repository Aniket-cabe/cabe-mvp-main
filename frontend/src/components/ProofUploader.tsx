import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { uploadFile } from '../api/uploads';
import toast from 'react-hot-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadUrl?: string;
  fileId?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface ProofUploaderProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'application/pdf': ['.pdf'],
};

export const ProofUploader: React.FC<ProofUploaderProps> = ({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  className = '',
  disabled = false,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const uploadFileToServer = async (file: File): Promise<UploadedFile> => {
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    };

    if (file.type.startsWith('image/')) {
      uploadedFile.preview = URL.createObjectURL(file);
    }

    try {
      const result = await uploadFile(file, (progress) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
        );
      });

      return {
        ...uploadedFile,
        uploadUrl: result.uploadUrl,
        fileId: result.fileId,
        status: 'success',
        progress: 100,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setLastErrorMessage(message);
      toast.error(`❌ ${file.name} upload failed. Try again?`);
      return {
        ...uploadedFile,
        status: 'error',
        error: message,
      };
    }
  };

  const processFiles = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(true);

      for (const file of acceptedFiles) {
        const uploadedFile = await uploadFileToServer(file);

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? uploadedFile : f))
        );

        if (uploadedFile.status === 'success') {
          onUploadComplete?.(uploadedFile);
          toast.success(`✅ ${file.name} uploaded successfully!`);
        } else {
          onUploadError?.(uploadedFile.error || 'Upload failed');
          toast.error(`❌ ${file.name} upload failed. Try again?`);
        }
      }

      setIsUploading(false);
    },
    [disabled, onUploadComplete, onUploadError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            const msg = `${file.name} is too large. Max size is 10MB.`;
            setLastErrorMessage(msg);
            toast.error(`❌ ${msg}`);
          } else if (error.code === 'file-invalid-type') {
            const msg = `${file.name} is not a supported file type.`;
            setLastErrorMessage(msg);
            toast.error(`❌ ${msg}`);
          } else {
            const msg = `${file.name} cannot be uploaded.`;
            setLastErrorMessage(msg);
            toast.error(`❌ ${msg}`);
          }
        });
      });

      if (acceptedFiles.length > 0) {
        processFiles(acceptedFiles);
      }
    },
    [processFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled: disabled || isUploading,
  });

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const retryUpload = useCallback(
    async (fileId: string) => {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      const originalFile = new File([], file.name, { type: file.type });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'uploading', progress: 0, error: undefined }
            : f
        )
      );

      const uploadedFile = await uploadFileToServer(originalFile);

      setFiles((prev) => prev.map((f) => (f.id === fileId ? uploadedFile : f)));

      if (uploadedFile.status === 'success') {
        onUploadComplete?.(uploadedFile);
        toast.success(`✅ ${file.name} uploaded successfully!`);
      } else {
        onUploadError?.(uploadedFile.error || 'Upload failed');
        toast.error(`❌ ${file.name} upload failed. Try again?`);
      }
    },
    [files, onUploadComplete, onUploadError]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-label="Upload proof files by dragging and dropping or clicking to browse"
        data-testid="dropzone"
      >
        <input {...getInputProps()} />

        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {isDragActive ? 'Drop your proof here! 🎯' : 'Upload your proof'}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag & drop files here, or{' '}
            <span className="text-blue-600 dark:text-blue-400">browse</span>
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supports PNG, JPG, PDF • Max 10MB
          </p>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <div className="text-blue-600 dark:text-blue-400 font-medium">
              Drop to upload! 🚀
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-3" data-testid="file-list">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Uploaded Files ({files.length}/{maxFiles})
          </h3>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview of ${file.name}`}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-lg">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div
                      className="flex items-center space-x-2"
                      data-testid="upload-progress"
                    >
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.progress}%
                      </span>
                    </div>
                  )}

                  {file.status === 'success' && (
                    <CheckCircleIcon
                      className="w-5 h-5 text-green-500"
                      data-testid="upload-success"
                    />
                  )}

                  {file.status === 'error' && (
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      <button
                        onClick={() => retryUpload(file.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        aria-label={`Retry upload of ${file.name}`}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${file.name}`}
                    disabled={file.status === 'uploading'}
                    data-testid="remove-file"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="text-center" data-testid="upload-progress">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Uploading your proof...</span>
          </div>
        </div>
      )}

      {lastErrorMessage && (
        <div
          className="text-sm text-red-700"
          data-testid="error-toast"
          aria-live="polite"
        >
          {lastErrorMessage}
        </div>
      )}
    </div>
  );
};

export default ProofUploader;
