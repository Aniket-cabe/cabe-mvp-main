import React, { useState, useEffect, useRef } from 'react';
import type { ProofDrawerProps } from '../types';

export function ProofDrawer({
  isOpen,
  opportunity,
  onClose,
  onSubmit,
}: ProofDrawerProps) {
  const [cvLink, setCvLink] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const drawerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setCvLink('');
      setPortfolio('');
      setCoverLetter('');
      setErrors({});
      setIsSubmitted(false);

      // Focus first input after animation
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!cvLink.trim() && !portfolio.trim()) {
      newErrors.proof = 'Please provide either a CV link or portfolio URL';
    }

    if (cvLink.trim() && !isValidUrl(cvLink)) {
      newErrors.cvLink = 'Please enter a valid URL';
    }

    if (portfolio.trim() && !isValidUrl(portfolio)) {
      newErrors.portfolio = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        cvLink: cvLink.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
        coverLetter: coverLetter.trim() || undefined,
      });

      setIsSubmitted(true);

      // Show success message
      // In a real app, you'd use a toast library
      console.log('Application submitted successfully!');

      // Close drawer after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="proof-drawer-title"
    >
      <div
        ref={drawerRef}
        className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2
              id="proof-drawer-title"
              className="text-lg font-semibold text-gray-900"
            >
              Submit Application
            </h2>
            {opportunity && (
              <p className="text-sm text-gray-600 mt-1">
                {opportunity.title} at {opportunity.company}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close application form"
            data-testid="close-proof-drawer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Application Submitted! ✅
              </h3>
              <p className="text-gray-600">
                Your application has been sent successfully. We'll review it and
                get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CV Link */}
              <div>
                <label
                  htmlFor="cv-link"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  CV/Resume Link
                </label>
                <input
                  ref={firstInputRef}
                  type="url"
                  id="cv-link"
                  value={cvLink}
                  onChange={(e) => setCvLink(e.target.value)}
                  placeholder="https://drive.google.com/your-cv"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.cvLink ? 'border-red-300' : 'border-gray-300'
                  }`}
                  data-testid="cv-link-input"
                />
                {errors.cvLink && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvLink}</p>
                )}
              </div>

              {/* Portfolio */}
              <div>
                <label
                  htmlFor="portfolio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://your-portfolio.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.portfolio ? 'border-red-300' : 'border-gray-300'
                  }`}
                  data-testid="portfolio-input"
                />
                {errors.portfolio && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.portfolio}
                  </p>
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label
                  htmlFor="cover-letter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cover Letter (Optional)
                </label>
                <textarea
                  id="cover-letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this opportunity..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  data-testid="cover-letter-input"
                />
              </div>

              {/* General error */}
              {errors.proof && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.proof}</p>
                </div>
              )}

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
                data-testid="submit-application-btn"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
