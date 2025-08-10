import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { TaskDistributionPieChartProps } from '../../types';

export default function TaskDistributionPieChart({
  data,
  className = '',
}: TaskDistributionPieChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">
            Count:{' '}
            <span className="font-medium text-blue-600">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{' '}
            <span className="font-medium text-green-600">
              {data.percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={entry.value} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
            <span className="text-sm font-medium text-gray-900">
              {data[index]?.percentage}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Task Distribution
        </h3>
        <p className="text-sm text-gray-600">Breakdown of tasks by category</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed breakdown */}
      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="font-medium text-gray-900">{item.category}</div>
                <div className="text-sm text-gray-600">{item.count} tasks</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.percentage}%
              </div>
              <div className="text-sm text-gray-600">of total</div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-medium text-gray-600">Total Tasks</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalCount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Categories</div>
            <div className="text-2xl font-bold text-purple-600">
              {data.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
