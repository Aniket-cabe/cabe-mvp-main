import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Clock, Ban, ArrowRight } from 'lucide-react';
import AppealForm from './AppealForm';
import type { ModerationModalProps, ModerationType } from '../types';

// Animation keyframes for shake effect
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;

// Animation keyframes for pulse glow
const pulseGlowKeyframes = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
  }
`;

const MODERATION_CONFIG = {
  review_pending: {
    message: 'Hold tight. Our bots are eye-balling your proof.',
    icon: '🟡',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    canClose: false,
    showAppeal: false,
    animation: 'animate-pulse-glow',
  },
  suspicious: {
    message: "Hmm… stuff's not adding up. We're digging deeper.",
    icon: '🟠',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    canClose: false,
    showAppeal: false,
    animation: 'animate-fade-in-zoom',
  },
  rejected: {
    message: 'Proof failed the vibe check. Lose 50 pts.',
    icon: '🔴',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    canClose: true,
    showAppeal: true,
    animation: 'animate-shake',
  },
};

export default function ModerationModal({
  isOpen,
  type,
  onClose,
  onAppeal,
}: ModerationModalProps) {
  const [showAppealForm, setShowAppealForm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const config = MODERATION_CONFIG[type];

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && config.canClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, config.canClose, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleAppeal = () => {
    setShowAppealForm(true);
  };

  const handleAppealSubmit = (reason: string) => {
    console.log('Appeal submitted:', reason);
    // Here you would typically send the appeal to your backend
    if (onAppeal) {
      onAppeal();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* CSS Animations */}
      <style>
        {shakeKeyframes}
        {pulseGlowKeyframes}
        {`
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s infinite;
          }
          .animate-fade-in-zoom {
            animation: fadeInZoom 0.3s ease-out;
          }
          @keyframes fadeInZoom {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={config.canClose ? onClose : undefined}
        />

        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`relative ${config.bgColor} ${config.borderColor} border-2 rounded-lg shadow-xl max-w-md w-full p-6 ${config.animation}`}
          role="dialog"
          aria-modal="true"
          aria-label="Moderation Notice"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 ${config.iconBg} rounded-lg flex items-center justify-center text-2xl`}
              >
                {config.icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Moderation Notice
                </h2>
                <p className="text-sm text-gray-600">System Review</p>
              </div>
            </div>
            {config.canClose && (
              <button
                data-testid="close-modal"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close moderation notice"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <p
              className={`text-base ${config.textColor} font-medium leading-relaxed`}
            >
              {config.message}
            </p>
          </div>

          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center`}
            >
              {type === 'review_pending' && (
                <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
              )}
              {type === 'suspicious' && (
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              )}
              {type === 'rejected' && <Ban className="h-8 w-8 text-red-600" />}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {config.showAppeal && (
              <button
                onClick={handleAppeal}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                data-testid="appeal-button"
              >
                <AlertTriangle className="h-4 w-4" />
                Appeal Decision
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {config.canClose && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Got it
              </button>
            )}
          </div>

          {/* Auto-close indicator for non-closable modals */}
          {!config.canClose && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <span>Processing...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appeal Form */}
      <AppealForm
        isOpen={showAppealForm}
        onClose={() => setShowAppealForm(false)}
        onSubmit={handleAppealSubmit}
      />
    </>
  );
}
