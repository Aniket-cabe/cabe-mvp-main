import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all components for better performance
const ArenaAuditDashboard = lazy(() => import('./pages/admin/ArenaAuditDashboard'));
const UserAnalytics = lazy(() => import('./pages/analytics'));
const AdminAnalytics = lazy(() => import('./pages/admin/analytics'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const FeedPage = lazy(() => import('./pages/feed/FeedPage'));
const Home = lazy(() => import('./pages/feed/Home'));
const Opportunities = lazy(() => import('./pages/opportunities/Opportunities'));
const LearnIndex = lazy(() => import('./pages/learning/LearnIndex'));
const SkillDashboard = lazy(() => import('./pages/skills/SkillDashboard'));
const Achievements = lazy(() => import('./pages/achievements/Achievements'));
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const TaskDetail = lazy(() => import('./pages/tasks/TaskDetail'));
const TaskSubmission = lazy(() => import('./pages/tasks/TaskSubmission'));
const Leaderboard = lazy(() => import('./pages/leaderboard/Leaderboard'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Help = lazy(() => import('./pages/help/Help'));
const About = lazy(() => import('./pages/about/About'));

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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/learn" element={<LearnIndex />} />
            <Route path="/skills" element={<SkillDashboard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/tasks/:id/submit" element={<TaskSubmission />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<UserAnalytics />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
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
            
            {/* Legacy Routes for Backward Compatibility */}
            <Route path="/dashboard-old" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
