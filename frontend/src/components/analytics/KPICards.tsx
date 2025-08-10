
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface KPIData {
  dailyAudits: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  avgReviewTime: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  criticalDeviationRate: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface KPICardsProps {
  data: KPIData;
  className?: string;
}

export default function KPICards({ data, className = '' }: KPICardsProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      case 'stable':
        return <Minus size={16} className="text-gray-500" />;
    }
  };

  const getTrendColor = (
    trend: 'up' | 'down' | 'stable',
    isPositive: boolean = true
  ) => {
    if (trend === 'stable') return 'text-gray-500';

    // For some metrics, up is good (dailyAudits), for others down is good (avgReviewTime, criticalDeviationRate)
    if (isPositive) {
      return trend === 'up' ? 'text-green-500' : 'text-red-500';
    } else {
      return trend === 'up' ? 'text-red-500' : 'text-green-500';
    }
  };

  const formatValue = (
    value: number,
    type: 'audits' | 'time' | 'percentage'
  ) => {
    switch (type) {
      case 'audits':
        return value.toLocaleString();
      case 'time':
        return `${value.toFixed(1)}m`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const formatChange = (
    change: number,
    type: 'audits' | 'time' | 'percentage'
  ) => {
    const sign = change >= 0 ? '+' : '';
    switch (type) {
      case 'audits':
        return `${sign}${change.toFixed(1)}%`;
      case 'time':
        return `${sign}${change.toFixed(1)}%`;
      case 'percentage':
        return `${sign}${change.toFixed(1)}pp`;
      default:
        return `${sign}${change}`;
    }
  };

  const kpiItems = [
    {
      title: 'Daily Audits',
      value: data.dailyAudits.value,
      change: data.dailyAudits.change,
      trend: data.dailyAudits.trend,
      type: 'audits' as const,
      icon: <FileText className="text-blue-500" size={24} />,
      description: 'Total audits completed today',
      isPositive: true, // Higher is better
    },
    {
      title: 'Avg Review Time',
      value: data.avgReviewTime.value,
      change: data.avgReviewTime.change,
      trend: data.avgReviewTime.trend,
      type: 'time' as const,
      icon: <Clock className="text-purple-500" size={24} />,
      description: 'Average time per review',
      isPositive: false, // Lower is better
    },
    {
      title: 'Critical Deviation Rate',
      value: data.criticalDeviationRate.value,
      change: data.criticalDeviationRate.change,
      trend: data.criticalDeviationRate.trend,
      type: 'percentage' as const,
      icon: <AlertTriangle className="text-orange-500" size={24} />,
      description: 'Reviews with critical issues',
      isPositive: false, // Lower is better
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {kpiItems.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {item.description}
                </p>
              </div>
            </div>
            {getTrendIcon(item.trend)}
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(item.value, item.type)}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${getTrendColor(item.trend, item.isPositive)}`}
              >
                {formatChange(item.change, item.type)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                vs last period
              </span>
            </div>
          </div>

          {/* Progress indicator for some metrics */}
          {item.type === 'percentage' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Target: &lt;2%</span>
                <span>Current: {formatValue(item.value, item.type)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.value <= 2
                      ? 'bg-green-500'
                      : item.value <= 5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(item.value * 10, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
