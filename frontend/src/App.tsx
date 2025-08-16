import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all components for better performance
const ArenaAuditDashboard = lazy(() => import('./pages/admin/ArenaAuditDashboard'));
const UserAnalytics = lazy(() => import('./pages/analytics'));
const AdminAnalytics = lazy(() => import('./pages/admin/analytics'));
const Dashboard = lazy(() => import('./pages/dashboard'));

import TestAnalytics from './test-analytics';
import ProofUploader from './components/ProofUploader';

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense
          fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Dashboard />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<UserAnalytics />} />
            
            {/* Admin Routes */}
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/arena-audit" element={<ArenaAuditDashboard />} />
            
            {/* Development/Test Routes */}
            <Route path="/test" element={<TestAnalytics />} />
            <Route
              path="/test-upload"
              element={
                <div className="p-6 max-w-2xl mx-auto">
                  <ProofUploader />
                </div>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
