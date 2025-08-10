import React, { useState } from 'react';
import {
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Shield,
} from 'lucide-react';
import UserAnalytics from '../pages/UserAnalytics';
import AdminAnalytics from '../pages/AdminAnalytics';

type DemoView = 'user' | 'admin' | 'components';

export default function AnalyticsDemo() {
  const [currentView, setCurrentView] = useState<DemoView>('user');
  const [userRank, setUserRank] = useState<'gold' | 'platinum'>('platinum');

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Submission Heatmap',
      description:
        'Visual calendar showing daily submission frequency with color-coded intensity',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Skill Radar Chart',
      description:
        'Multi-dimensional view of points across Design, Web, Writing, and AI skills',
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      title: 'Task Distribution',
      description:
        'Breakdown of tasks by type: Arena, Learning, Gigs, and Special Projects',
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Data Export',
      description:
        'Export analytics data in CSV or JSON format for external analysis',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Admin Insights',
      description:
        'Platform-wide metrics, reviewer performance, and audit data (Platinum only)',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'RBAC Security',
      description:
        'Role-based access control ensures admin features are restricted to Platinum users',
    },
  ];

  const navItems = [
    {
      id: 'user',
      label: 'User Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      id: 'admin',
      label: 'Admin Analytics',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: 'components',
      label: 'Components',
      icon: <PieChart className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Analytics Demo
                </h1>
                <p className="text-sm text-gray-600">
                  Dual-layer analytics for users and admins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* RBAC Demo Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Demo User Rank:
                </label>
                <select
                  value={userRank}
                  onChange={(e) =>
                    setUserRank(e.target.value as 'gold' | 'platinum')
                  }
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="gold">Gold (No Admin Access)</option>
                  <option value="platinum">Platinum (Admin Access)</option>
                </select>
              </div>

              {/* Navigation */}
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as DemoView)}
                    className={`
                      inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        currentView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {currentView === 'components' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Analytics Components
            </h2>
            <p className="text-gray-600">
              Comprehensive analytics suite with dual-layer access control and
              rich data visualizations
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  User Analytics Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • Submission calendar heatmap with react-calendar-heatmap
                  </li>
                  <li>• Skill radar chart with recharts</li>
                  <li>• Task type bar chart with animations</li>
                  <li>• CSV/JSON export functionality</li>
                  <li>• Responsive design for all devices</li>
                  <li>• Dark mode compatibility</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Admin Analytics Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• RBAC check: Platinum rank required</li>
                  <li>• KPI cards with trend indicators</li>
                  <li>• Top reviewers performance table</li>
                  <li>• Task distribution pie chart</li>
                  <li>• Full audit dataset export</li>
                  <li>• Platform-wide insights dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'user' && (
        <div data-cy="demo-user-analytics">
          <UserAnalytics />
        </div>
      )}

      {currentView === 'admin' && (
        <div data-cy="demo-admin-analytics">
          {userRank === 'platinum' ? (
            <AdminAnalytics />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Access Denied
                </h2>
                <p className="text-gray-600 mb-4">
                  Admin analytics requires Platinum rank. Currently simulating{' '}
                  {userRank} user.
                </p>
                <p className="text-sm text-gray-500">
                  Change the demo user rank to "Platinum" above to access admin
                  features.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Demo Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Analytics Module Demo • Built with React + TypeScript +
              TailwindCSS + Recharts
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Current View: {currentView}</span>
              <span>•</span>
              <span>User Rank: {userRank}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
