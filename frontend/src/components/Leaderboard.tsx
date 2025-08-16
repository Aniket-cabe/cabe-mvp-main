import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  primary_skill: string;
  total_points: number;
  rank_level: string;
  rankBadge: string;
  created_at: string;
  last_activity: string;
}

interface LeaderboardProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  onUserClick?: (userId: string) => void;
  sortBy?: 'rank' | 'points' | 'skill' | 'activity';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  showFilters?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  users,
  currentUserId,
  onUserClick,
  sortBy = 'rank',
  sortOrder = 'asc',
  onSortChange,
  showFilters = true,
  className = '',
}) => {
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const getSkillIcon = (category: string) => {
    const icons = {
      'Full-Stack Software Development': '💻',
      'Cloud Computing & DevOps': '☁️',
      'Data Science & Analytics': '📊',
      'AI / Machine Learning': '🤖',
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const handleSort = (newSortBy: "points" | "skill" | "rank" | "activity") => {
    const newSortOrder = newSortBy === localSortBy && localSortOrder === 'asc' ? 'desc' : 'asc';
    setLocalSortBy(newSortBy);
    setLocalSortOrder(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  };

  const filteredUsers = users.filter(user => 
    skillFilter === 'all' || user.primary_skill === skillFilter
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (localSortBy) {
      case 'points':
        aValue = a.total_points;
        bValue = b.total_points;
        break;
      case 'skill':
        aValue = a.primary_skill;
        bValue = b.primary_skill;
        break;
      case 'activity':
        aValue = new Date(a.last_activity);
        bValue = new Date(b.last_activity);
        break;
      default:
        aValue = a.rank;
        bValue = b.rank;
    }

    if (localSortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortableHeader = ({ 
    label, 
    sortKey, 
    className = '' 
  }: { 
    label: string; 
    sortKey: "points" | "skill" | "rank" | "activity"; 
    className?: string;
  }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`flex items-center space-x-1 font-medium text-gray-700 hover:text-gray-900 transition-colors ${className}`}
    >
      <span>{label}</span>
      <div className="flex flex-col">
        <svg 
          className={`w-3 h-3 ${localSortBy === sortKey && localSortOrder === 'asc' ? 'text-blue-500' : 'text-gray-400'}`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <svg 
          className={`w-3 h-3 ${localSortBy === sortKey && localSortOrder === 'desc' ? 'text-blue-500' : 'text-gray-400'}`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Leaderboard</h2>
          <div className="flex items-center space-x-4">
            {showFilters && (
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Skills</option>
                <option value="Full-Stack Software Development">Full-Stack Software Development</option>
                <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="AI / Machine Learning">AI / Machine Learning</option>
              </select>
            )}
            <span className="text-sm text-gray-500">
              {sortedUsers.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortableHeader label="Rank" sortKey="rank" />
              </th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">
                <SortableHeader label="Skill" sortKey="skill" />
              </th>
              <th className="px-6 py-3 text-left">
                <SortableHeader label="Points" sortKey="points" />
              </th>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">
                <SortableHeader label="Last Active" sortKey="activity" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {sortedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`
                    hover:bg-gray-50 transition-colors cursor-pointer
                    ${user.id === currentUserId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  `}
                  onClick={() => onUserClick?.(user.id)}
                >
                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getRankColor(user.rank)}`}>
                        {getRankIcon(user.rank)}
                      </div>
                      {user.id === currentUserId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </td>

                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name || user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg text-gray-600">
                            {user.name?.charAt(0) || user.username?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Skill */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSkillIcon(user.primary_skill)}</span>
                      <span className="text-sm text-gray-700">{user.primary_skill}</span>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">
                      {user.total_points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </td>

                  {/* Rank Level */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{user.rankBadge}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {user.rank_level}
                      </span>
                    </div>
                  </td>

                  {/* Last Activity */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(user.last_activity).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(user.last_activity).toLocaleTimeString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedUsers.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
