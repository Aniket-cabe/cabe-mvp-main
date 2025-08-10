
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ActivityBarChartProps {
  data: Array<{
    category: string;
    tasks: number;
    learning: number;
    gigs: number;
  }>;
  className?: string;
}

export default function ActivityBarChart({
  data,
  className = '',
}: ActivityBarChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}
            </p>
          ))}
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
          Activity Breakdown
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monthly completion across different activity types
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-600"
            />
            <XAxis
              dataKey="category"
              tick={{
                fill: '#6b7280',
                fontSize: 12,
              }}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              tick={{
                fill: '#6b7280',
                fontSize: 12,
              }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="tasks"
              fill="#3b82f6"
              name="Arena Tasks"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="learning"
              fill="#10b981"
              name="Learning Modules"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="gigs"
              fill="#f59e0b"
              name="Gig Projects"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Arena Tasks
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {data.reduce((sum, item) => sum + item.tasks, 0)}
          </div>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Learning
          </div>
          <div className="text-xl font-bold text-green-700 dark:text-green-300">
            {data.reduce((sum, item) => sum + item.learning, 0)}
          </div>
        </div>
        <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Gigs
          </div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {data.reduce((sum, item) => sum + item.gigs, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
