// import React from 'react';
import { useAnalytics, useUserPermissions } from './hooks/useAnalytics';

export default function TestAnalytics() {
  const { data, loading, error, refetch, exportUserData } = useAnalytics();
  const { user, canViewAdminAnalytics } = useUserPermissions();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Permissions</h2>
          <p>User: {user.name}</p>
          <p>Rank: {user.rank}</p>
          <p>
            Can view admin analytics: {canViewAdminAnalytics ? 'Yes' : 'No'}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Analytics Data</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          <p>Data available: {data ? 'Yes' : 'No'}</p>
        </div>

        {data && (
          <div>
            <h2 className="text-lg font-semibold">User Summary</h2>
            <p>Total Points: {data.user.summary.totalPoints}</p>
            <p>Tasks Completed: {data.user.summary.tasksCompleted}</p>
            <p>Current Streak: {data.user.summary.streak} days</p>
            <p>Top Skill: {data.user.summary.topSkill}</p>
          </div>
        )}

        <div className="space-x-2">
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button
            onClick={() => exportUserData('csv')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
