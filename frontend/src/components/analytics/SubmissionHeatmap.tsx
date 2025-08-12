interface SubmissionHeatmapProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  className?: string;
}

export default function SubmissionHeatmap({
  data,
  className = '',
}: SubmissionHeatmapProps) {
  // Create a simplified heatmap visualization using CSS Grid
  const generateHeatmapData = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 365);

    const heatmapData = [];
    const dataMap = new Map(data.map((item) => [item.date, item.count]));

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      heatmapData.push({ date: dateStr, count });
    }

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600';
    if (count === 3) return 'bg-emerald-600 dark:bg-emerald-500';
    return 'bg-emerald-800 dark:bg-emerald-400';
  };

  const getTooltipText = (date: string, count: number) => {
    const formattedDate = new Date(date).toLocaleDateString();
    return `${formattedDate}: ${count} submission${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Submission Activity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Daily task submissions over the past year
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-800"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-800 dark:bg-emerald-400"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Simplified Heatmap Grid */}
      <div className="mb-4">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Sun
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Mon
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tue
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Wed
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Thu
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Fri
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Sat
          </div>
        </div>

        {/* Heatmap squares - simplified grid */}
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.slice(0, 350).map((item, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${getColorClass(item.count)} hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer`}
              title={getTooltipText(item.date, item.count)}
            />
          ))}
        </div>
      </div>

      {/* Month labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );
}
