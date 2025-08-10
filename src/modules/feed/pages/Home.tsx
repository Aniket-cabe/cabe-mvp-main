import React from 'react';
import FeedPage from './FeedPage';

/**
 * Home page component that serves as the main task feed route.
 * This is the entry point for the AI-powered task recommendation system.
 *
 * Route: /home
 * Features:
 * - Personalized task recommendations based on user skills and rank
 * - Swipe-to-dismiss functionality on mobile
 * - Infinite scroll for seamless task loading
 * - AI-powered relevance scoring and explanations
 */
export default function Home() {
  return <FeedPage />;
}
