import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface FilterOptions {
  from: Date;
  to: Date;
  skill?: string;
  type?: 'arena' | 'learning' | 'gigs';
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterControlsProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  onFiltersChange,
  isLoading = false,
  className = '',
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const [availableSkills, setAvailableSkills] = useState<FilterOption[]>([]);
  const [availableTypes, setAvailableTypes] = useState<FilterOption[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [skillsResponse, typesResponse] = await Promise.all([
          fetch('/api/metrics/realtime/skills'),
          fetch('/api/metrics/realtime/types'),
        ]);

        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setAvailableSkills(skillsData.skills);
        }

        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          setAvailableTypes(typesData.types);
        }
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  const validateFilters = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (filters.from >= filters.to) {
      newErrors.dateRange = 'From date must be before to date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (errors[key as string]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleApplyFilters = () => {
    if (validateFilters()) {
      onFiltersChange(filters);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters: FilterOptions = {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
    };
    setFilters(defaultFilters);
    setErrors({});
    onFiltersChange(defaultFilters);
  };

  const handleClearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = filters.skill || filters.type;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Analytics Filters
          </h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Active
            </span>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          aria-expanded={isExpanded}
          aria-controls="filter-content"
        >
          <span>{isExpanded ? 'Hide' : 'Show'} filters</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div
        id="filter-content"
        className={`transition-all duration-200 ease-in-out ${
          isExpanded
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  From
                </label>
                <DatePicker
                  selected={filters.from}
                  onChange={(date: Date | null) =>
                    date && handleFilterChange('from', date)
                  }
                  selectsStart
                  startDate={filters.from}
                  endDate={filters.to}
                  maxDate={filters.to}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  dateFormat="MMM dd, yyyy"
                  aria-label="Select start date"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  To
                </label>
                <DatePicker
                  selected={filters.to}
                  onChange={(date: Date | null) =>
                    date && handleFilterChange('to', date)
                  }
                  selectsEnd
                  startDate={filters.from}
                  endDate={filters.to}
                  minDate={filters.from}
                  maxDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  dateFormat="MMM dd, yyyy"
                  aria-label="Select end date"
                />
              </div>
            </div>
            {errors.dateRange && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {errors.dateRange}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill
            </label>
            <div className="relative">
              <select
                value={filters.skill || ''}
                onChange={(e) =>
                  handleFilterChange('skill', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                aria-label="Select skill filter"
              >
                <option value="">All Skills</option>
                {availableSkills.map((skill) => (
                  <option key={skill.value} value={skill.value}>
                    {skill.label} ({skill.count})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task Type
            </label>
            <div className="relative">
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  handleFilterChange('type', e.target.value || undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
                aria-label="Select task type filter"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.count})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.skill && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Skill:{' '}
                  {
                    availableSkills.find((s) => s.value === filters.skill)
                      ?.label
                  }
                  <button
                    onClick={() => handleClearFilter('skill')}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    aria-label={`Remove skill filter: ${filters.skill}`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Type:{' '}
                  {availableTypes.find((t) => t.value === filters.type)?.label}
                  <button
                    onClick={() => handleClearFilter('type')}
                    className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                    aria-label={`Remove type filter: ${filters.type}`}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              disabled={isLoading}
            >
              Reset to Default
            </button>

            <button
              onClick={handleApplyFilters}
              disabled={isLoading || Object.keys(errors).length > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Apply filters"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Applying...</span>
                </div>
              ) : (
                'Apply Filters'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
