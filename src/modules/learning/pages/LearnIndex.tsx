import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/CourseCard';
import ProofUploader from '../components/ProofUploader';
import { useToast } from '../../../hooks/useToast';
import type { Course, CourseCategory } from '../types';

const COURSES_PER_PAGE = 10;

const CATEGORIES: CourseCategory[] = [
  { id: 'all', label: 'All', color: 'bg-gray-100 text-gray-800' },
  { id: 'ai-ml', label: 'AI/ML', color: 'bg-purple-100 text-purple-800' },
  { id: 'cloud-devops', label: 'Cloud/DevOps', color: 'bg-blue-100 text-blue-800' },
  { id: 'data-analytics', label: 'Data Analytics', color: 'bg-green-100 text-green-800' },
  { id: 'fullstack-dev', label: 'Full-Stack', color: 'bg-orange-100 text-orange-800' },
];

export default function LearnIndex() {
  const { courses, loading, error } = useCourses();
  const { showToast } = useToast();

  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showProofUploader, setShowProofUploader] = useState(false);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'all' || course.category === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Handle course selection
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  // Handle proof upload
  const handleProofUpload = (courseId: string, proofData: any) => {
    // TODO: Implement proof upload logic
    console.log('Proof uploaded for course:', courseId, proofData);
    showToast('Proof uploaded successfully!', 'success');
    setShowProofUploader(false);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            data-testid="loading-spinner"
          ></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to load courses
          </h2>
          <p className="text-gray-600 mb-4" data-testid="error-message">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Learning Center
              </h1>
              <p className="text-gray-600 mt-1">
                Master new skills and advance your career
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filteredCourses.length} courses available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2" role="tablist">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? `${category.color} shadow-sm`
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                role="tab"
                aria-selected={selectedCategory === category.id}
                aria-controls={`tabpanel-${category.id}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredCourses.length)} of{' '}
              {filteredCourses.length} courses
            </p>
          </div>

          {/* Course Cards */}
          {currentCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-testid="course-grid"
            >
              {currentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                  onStartCourse={() => setShowProofUploader(true)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-2 mt-8"
              data-testid="pagination"
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          data-testid="course-modal"
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        CATEGORIES.find((c) => c.id === selectedCourse.category)
                          ?.color || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {
                        CATEGORIES.find((c) => c.id === selectedCourse.category)
                          ?.label
                      }
                    </span>
                    {selectedCourse.source &&
                      ['fiverr', 'internshala'].includes(
                        selectedCourse.source
                      ) && (
                        <div
                          className="flex items-center gap-1 text-xs text-gray-500"
                          title="Synced from Fiverr ✔️"
                        >
                          <span>🔄</span>
                          <span>Synced</span>
                        </div>
                      )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedCourse.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Difficulty
                      </p>
                      <p className="text-gray-900">
                        {selectedCourse.difficulty}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Duration
                      </p>
                      <p className="text-gray-900">{selectedCourse.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Required Rank
                      </p>
                      <p className="text-gray-900">
                        {selectedCourse.requiredRank}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Progress
                      </p>
                      <p className="text-gray-900">
                        {selectedCourse.progress || 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCourse(null);
                    setShowProofUploader(true);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Course
                </button>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof Uploader */}
      {showProofUploader && (
        <ProofUploader
          course={selectedCourse}
          onClose={() => setShowProofUploader(false)}
          onSubmit={handleProofUpload}
        />
      )}
    </div>
  );
}
