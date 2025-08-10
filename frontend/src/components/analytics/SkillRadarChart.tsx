import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillRadarChartProps {
  data: Array<{
    skill: string;
    points: number;
    fullMark: number;
  }>;
  className?: string;
}

export default function SkillRadarChart({
  data,
  className = '',
}: SkillRadarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-blue-300 dark:text-blue-600">
            Points: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Skill Distribution
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Points earned across different skill areas
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          >
            <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: '#6b7280',
                fontSize: 12,
                textAnchor: 'middle',
              }}
              className="text-gray-500 dark:text-gray-400"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#9ca3af',
                fontSize: 10,
              }}
              className="text-gray-400 dark:text-gray-500"
            />
            <Radar
              name="Points"
              dataKey="points"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#3b82f6',
                strokeWidth: 2,
                stroke: '#ffffff',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((skill, index) => (
          <div key={skill.skill} className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {skill.skill}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {skill.points}pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
