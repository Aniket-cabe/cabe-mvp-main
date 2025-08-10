import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import type { SubmissionCalendarProps } from '../../types';

export default function SubmissionCalendar({
  data,
  className = '',
}: SubmissionCalendarProps) {
  // Transform data for react-calendar-heatmap
  const heatmapData = data.map((item) => ({
    date: item.date,
    count: item.count,
  }));

  // Custom color scale based on frequency
  const getColorScale = (count: number) => {
    if (count === 0) return '#ebedf0';
    if (count <= 2) return '#9be9a8';
    if (count <= 4) return '#40c463';
    if (count <= 6) return '#30a14e';
    if (count <= 8) return '#216e39';
    return '#0a4620';
  };

  // Custom tooltip
  const getTooltipDataAttrs = (value: any) => {
    if (!value || !value.date) {
      return null;
    }

    const date = new Date(value.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      'data-tip': `${date}: ${value.count} submission${value.count !== 1 ? 's' : ''}`,
    };
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Submission Activity
        </h3>
        <p className="text-sm text-gray-600">
          Your daily submission frequency over the last 30 days
        </p>
      </div>

      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          values={heatmapData}
          classForValue={(value) => {
            if (!value) {
              return 'color-empty';
            }
            return `color-scale-${Math.min(value.count, 9)}`;
          }}
          tooltipDataAttrs={getTooltipDataAttrs}
          showWeekdayLabels={true}
          weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
          monthLabels={[
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ]}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#ebedf0]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#9be9a8]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#40c463]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#30a14e]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#216e39]"></div>
          <div className="w-3 h-3 rounded-sm bg-[#0a4620]"></div>
        </div>
        <span>More</span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Submissions</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(
              (data.reduce((sum, item) => sum + item.count, 0) / 30) * 10
            ) / 10}
          </div>
          <div className="text-sm text-gray-600">Daily Average</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">
            {data.filter((item) => item.count > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Days</div>
        </div>
      </div>

      <style jsx>{`
        .color-empty {
          fill: #ebedf0;
        }
        .color-scale-0 {
          fill: #ebedf0;
        }
        .color-scale-1 {
          fill: #9be9a8;
        }
        .color-scale-2 {
          fill: #9be9a8;
        }
        .color-scale-3 {
          fill: #40c463;
        }
        .color-scale-4 {
          fill: #40c463;
        }
        .color-scale-5 {
          fill: #30a14e;
        }
        .color-scale-6 {
          fill: #30a14e;
        }
        .color-scale-7 {
          fill: #216e39;
        }
        .color-scale-8 {
          fill: #216e39;
        }
        .color-scale-9 {
          fill: #0a4620;
        }
      `}</style>
    </div>
  );
}
