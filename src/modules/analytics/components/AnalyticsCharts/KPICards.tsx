import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPICardsProps } from '../../types';

export default function KPICards({ data, className = '' }: KPICardsProps) {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeBgColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'bg-green-50';
      case 'decrease':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {data.map((kpi, index) => (
        <div
          key={kpi.title}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
            <div
              className={`p-2 rounded-full ${getChangeBgColor(kpi.changeType)}`}
            >
              {getChangeIcon(kpi.changeType)}
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {kpi.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">{kpi.unit}</div>
            </div>

            <div
              className={`flex items-center gap-1 ${getChangeColor(kpi.changeType)}`}
            >
              {getChangeIcon(kpi.changeType)}
              <span className="text-sm font-medium">
                {kpi.change > 0 ? '+' : ''}
                {kpi.change.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>vs last period</span>
              <span className={getChangeColor(kpi.changeType)}>
                {kpi.change > 0 ? '+' : ''}
                {kpi.change.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  kpi.changeType === 'increase'
                    ? 'bg-green-500'
                    : kpi.changeType === 'decrease'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                }`}
                style={{
                  width: `${Math.min(Math.abs(kpi.change) * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Additional context based on KPI type */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {kpi.title === 'Daily Audits' && (
              <div className="text-xs text-gray-500">
                Target: 150 reviews/day
              </div>
            )}
            {kpi.title === 'Avg Review Time' && (
              <div className="text-xs text-gray-500">
                Target: &lt; 10 minutes
              </div>
            )}
            {kpi.title === 'Critical Deviation Rate' && (
              <div className="text-xs text-gray-500">Target: &lt; 5%</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
