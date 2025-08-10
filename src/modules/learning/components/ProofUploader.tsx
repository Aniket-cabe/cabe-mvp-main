import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, Link, CheckCircle, AlertCircle } from 'lucide-react';
import type { Course } from '../types';

interface ProofUploaderProps {
  course: Course | null;
  onClose: () => void;
  onSubmit: (courseId: string, proofData: any) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
];

export default function ProofUploader({
  course,
  onClose,
  onSubmit,
}: ProofUploaderProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setErrors([]);

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(['Please select a valid file type (PNG, JPG, or PDF)']);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setErrors(['File size must be less than 10MB']);
      return;
    }

    setSelectedFile(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileSelect(file);
        }
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: string[] = [];

    if (uploadMethod === 'file' && !selectedFile) {
      newErrors.push('Please select a file to upload');
    }

    if (uploadMethod === 'link' && !externalLink.trim()) {
      newErrors.push('Please enter a valid link');
    }

    if (
      uploadMethod === 'link' &&
      externalLink.trim() &&
      !isValidUrl(externalLink)
    ) {
      newErrors.push('Please enter a valid URL');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!course || !validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Prepare proof data
      const proofData = {
        courseId: course.id,
        file: selectedFile,
        externalLink: externalLink.trim() || undefined,
        notes: notes.trim() || undefined,
        uploadedAt: new Date().toISOString(),
      };

      // Submit proof
      onSubmit(course.id, proofData);
    } catch (error) {
      setErrors(['Failed to upload proof. Please try again.']);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:items-center"
      data-testid="proof-uploader"
    >
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Submit Proof</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {course && (
          <div className="p-4">
            {/* Course Info */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
              <p className="text-sm text-gray-600">
                {course.category} • {course.difficulty}
              </p>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <File className="h-4 w-4 inline mr-2" />
                File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('link')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'link'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Link className="h-4 w-4 inline mr-2" />
                External Link
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              {uploadMethod === 'file' && (
                <div
                  ref={dropRef}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : selectedFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Drag and drop a file here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, or PDF up to 10MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* External Link */}
              {uploadMethod === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External Link
                  </label>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://example.com/proof"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to your portfolio, GitHub, or other proof of completion
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you learned or any additional context..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-red-700"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Submit Proof'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
