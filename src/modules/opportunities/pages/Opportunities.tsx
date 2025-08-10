import React, { useState } from 'react';
import { useOpportunities } from '../hooks/useOpportunities';
import { OppCard } from '../components/OppCard';
import { ProofDrawer } from '../components/ProofDrawer';
import type { Opportunity, OpportunitiesFilters } from '../types';

export function Opportunities() {
  const {
    filteredOpportunities,
    filters,
    loading,
    error,
    setFilters,
    applyToOpportunity,
  } = useOpportunities();

  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [showProofDrawer, setShowProofDrawer] = useState(false);

  // Mock user data - in real app, this would come from auth context
  const userRank = 'Bronze';
  const userEmail = 'user@example.com';

  // Handle opportunity application
  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowProofDrawer(true);
  };

  // Handle proof submission
  const handleProofSubmit = async (proof: {
    cvLink?: string;
    portfolio?: string;
    coverLetter?: string;
  }) => {
    if (!selectedOpportunity) return;

    try {
      await applyToOpportunity(selectedOpportunity.id, proof);
      // Drawer will close automatically after success
    } catch (error) {
      console.error('Failed to apply:', error);
      // Error is handled in the drawer component
      throw error;
    }
  };

  // Close proof drawer
  const handleCloseProofDrawer = () => {
    setShowProofDrawer(false);
    setSelectedOpportunity(null);
  };

  // Filter options
  const typeOptions = [
    { value: 'gig', label: 'Gigs', icon: '💼' },
    { value: 'internship', label: 'Internships', icon: '🎓' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'design', label: 'Design', icon: '🎨' },
    { value: 'web', label: 'Web Development', icon: '💻' },
    { value: 'ai', label: 'AI & ML', icon: '🤖' },
    { value: 'writing', label: 'Writing', icon: '✍️' },
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'fiverr', label: 'Fiverr', icon: '🎨' },
    { value: 'internshala', label: 'Internshala', icon: '🎓' },
    { value: 'upwork', label: 'Upwork', icon: '💼' },
    { value: 'linkedin', label: 'LinkedIn', icon: '🔗' },
    { value: 'internal', label: 'Internal', icon: '🏢' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Opportunities
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Opportunities
              </h1>
              <p className="text-gray-600 mt-1">
                Find gigs and internships that match your skills and rank
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <span>⭐</span>
              <span>Current Rank: {userRank}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

          <div className="space-y-6">
            {/* Type Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type
              </label>
              <div className="flex gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setFilters({ type: option.value as 'gig' | 'internship' })
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      filters.type === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    data-testid={`type-tab-${option.value}`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setFilters({ category: option.value as any })
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.category === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    data-testid={`category-filter-${option.value}`}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Source
              </label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ source: option.value as any })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.source === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    data-testid={`source-filter-${option.value}`}
                  >
                    {option.icon && <span>{option.icon}</span>}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredOpportunities.length}{' '}
              {filters.type === 'gig' ? 'Gigs' : 'Internships'} Found
            </h2>

            {/* Sort options could go here */}
            <div className="text-sm text-gray-500">
              Showing opportunities for {userRank} rank and above
            </div>
          </div>

          {/* Opportunities Grid */}
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No opportunities found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or check back later for new
                opportunities.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="opportunities-grid"
            >
              {filteredOpportunities.map((opportunity) => (
                <OppCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  userRank={userRank}
                  userEmail={userEmail}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proof Submission Drawer */}
      <ProofDrawer
        isOpen={showProofDrawer}
        opportunity={selectedOpportunity}
        onClose={handleCloseProofDrawer}
        onSubmit={handleProofSubmit}
      />
    </div>
  );
}
