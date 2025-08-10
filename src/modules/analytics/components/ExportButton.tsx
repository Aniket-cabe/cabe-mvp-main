import React, { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';
import {
  exportToCSV,
  exportToJSON,
  generateFilename,
} from '../utils/exportCSV';
import type { ExportButtonProps } from '../types';

export default function ExportButton({
  data,
  filename,
  format,
  className = '',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const generatedFilename = generateFilename(filename);

      if (format === 'csv') {
        exportToCSV(data, generatedFilename);
      } else {
        exportToJSON(data, generatedFilename);
      }

      // Show success feedback
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const getIcon = () => {
    if (isExporting) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      );
    }

    return format === 'csv' ? (
      <FileText className="h-4 w-4" />
    ) : (
      <FileJson className="h-4 w-4" />
    );
  };

  const getButtonText = () => {
    if (isExporting) {
      return 'Exporting...';
    }

    return format === 'csv' ? 'Download CSV' : 'Download JSON';
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
        ${
          isExporting || data.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md'
        }
        ${className}
      `}
      aria-label={`Export data as ${format.toUpperCase()}`}
    >
      {getIcon()}
      <span>{getButtonText()}</span>
    </button>
  );
}
