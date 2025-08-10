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
import type { SkillRadarChartProps } from '../../types';

export default function SkillRadarChart({
  data,
  className = '',
}: SkillRadarChartProps) {
  // Transform data for radar chart
  const chartData = data.map((item) => ({
    skill: item.skill,
    points: item.points,
    maxPoints: item.maxPoints,
    percentage: Math.round((item.points / item.maxPoints) * 100),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.skill}</p>
          <p className="text-sm text-gray-600">
            {data.points} / {data.maxPoints} points
          </p>
          <p className="text-sm text-blue-600 font-medium">
            {data.percentage}% complete
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label component for outside positioning
  const CustomPolarAngleAxis = (props: any) => {
    const { payload, cx, cy, radius } = props;
    const angle = (payload.coordinate * 180) / Math.PI;
    const x = cx + (radius + 20) * Math.cos(((angle - 90) * Math.PI) / 180);
    const y = cy + (radius + 20) * Math.sin(((angle - 90) * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-medium fill-gray-700"
      >
        {payload.value}
      </text>
    );
  };

  const maxPoints = Math.max(...data.map((item) => item.maxPoints));

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Skill Distribution
        </h3>
        <p className="text-sm text-gray-600">
          Your points across different skill areas
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
          >
            <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxPoints]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Radar
              name="Points"
              dataKey="points"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Skill breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {chartData.map((item, index) => (
          <div
            key={item.skill}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium text-gray-900">{item.skill}</div>
              <div className="text-sm text-gray-600">
                {item.points} / {item.maxPoints} points
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {item.percentage}%
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">
              Total Points
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {data
                .reduce((sum, item) => sum + item.points, 0)
                .toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-900">
              Average Completion
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                (data.reduce(
                  (sum, item) => sum + item.points / item.maxPoints,
                  0
                ) /
                  data.length) *
                  100
              )}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
