import React from 'react';
import type { TrustBadgeProps } from '../types';

export function TrustBadge({ userEmail, companyDomain }: TrustBadgeProps) {
  // Extract domain from user email
  const userDomain = userEmail.split('@')[1]?.toLowerCase();
  const companyDomainLower = companyDomain.toLowerCase();

  // Check if domains match
  const isVerified = userDomain === companyDomainLower;

  if (!isVerified) return null;

  return (
    <div className="relative group">
      <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        Email verified with company domain
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
