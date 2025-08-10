import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TaskTypeBarChartProps } from '../../types';

export default function TaskTypeBarChart({
  data,
  className = '',
}: TaskTypeBarChartProps) {
  // Transform data for bar chart
  const chartData = data.map((item) => ({
    taskType: item.taskType,
    totalPoints: item.totalPoints,
    count: item.count,
    averagePoints: Math.round(item.totalPoints / item.count),
  }));

  // Color palette for different task types
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Total Points:{' '}
            <span className="font-medium text-blue-600">
              {data.totalPoints}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Tasks Completed:{' '}
            <span className="font-medium text-green-600">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Average per Task:{' '}
            <span className="font-medium text-purple-600">
              {data.averagePoints}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const maxPoints = Math.max(...data.map((item) => item.totalPoints));

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Points by Task Type
        </h3>
        <p className="text-sm text-gray-600">
          Total points earned across different task categories
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="taskType"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="totalPoints"
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task type breakdown */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => (
          <div
            key={item.taskType}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div>
                <div className="font-medium text-gray-900">{item.taskType}</div>
                <div className="text-sm text-gray-600">
                  {item.count} task{item.count !== 1 ? 's' : ''} completed
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.totalPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                {item.averagePoints} avg per task
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-gray-600">
              Total Points
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {data
                .reduce((sum, item) => sum + item.totalPoints, 0)
                .toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Total Tasks</div>
            <div className="text-2xl font-bold text-green-600">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">
              Best Category
            </div>
            <div className="text-lg font-bold text-purple-600">
              {
                data.reduce((max, item) =>
                  item.totalPoints > max.totalPoints ? item : max
                ).taskType
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
