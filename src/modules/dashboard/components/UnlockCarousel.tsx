import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
import type { UnlockCarouselProps } from '../types';

export default function UnlockCarousel({
  unlockables,
  autoSlide = true,
  slideInterval = 6000,
}: UnlockCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || unlockables.length <= 1) return;

    const startAutoSlide = () => {
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex((prev) => (prev + 1) % unlockables.length);
        }
      }, slideInterval);
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSlide, slideInterval, unlockables.length, isPaused]);

  // Pause auto-slide on hover/focus
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? unlockables.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % unlockables.length);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(unlockables.length - 1);
        break;
    }
  };

  if (unlockables.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No upcoming unlocks</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Upcoming unlocks carousel"
      aria-live="polite"
    >
      {/* Carousel container */}
      <div className="relative h-48">
        {unlockables.map((unlockable, index) => (
          <div
            key={unlockable.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            }`}
            aria-hidden={index !== currentIndex}
          >
            <div className="p-6 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3
                    className="font-semibold text-gray-900"
                    data-testid={`unlock-title-${index}`}
                  >
                    {unlockable.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Unlock at {unlockable.rankRequired}
                  </p>
                </div>
              </div>

              <p
                className="text-sm text-gray-700 mb-3 line-clamp-2"
                data-testid={`unlock-description-${index}`}
              >
                {unlockable.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {unlockable.category}
                  </span>
                  <span>{unlockable.pointsRequired} points required</span>
                </div>

                <div className="text-xs text-gray-400">
                  {index + 1} of {unlockables.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {unlockables.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Previous unlock"
            data-testid="carousel-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Next unlock"
            data-testid="carousel-next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {unlockables.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {unlockables.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              data-testid={`carousel-dot-${index}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {autoSlide && unlockables.length > 1 && (
        <div className="absolute top-3 right-3">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isPaused ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
            }`}
          />
        </div>
      )}
    </div>
  );
}
