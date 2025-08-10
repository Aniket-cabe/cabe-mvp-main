import React from 'react';
import type { HeatmapData, SkillArea } from '../types';

interface ActivityHeatmapProps {
  data: HeatmapData[];
  skill: SkillArea;
}

export default function ActivityHeatmap({ data, skill }: ActivityHeatmapProps) {
  // Generate calendar data for the last 90 days
  const generateCalendarData = () => {
    const calendarData: Array<{
      date: string;
      count: number;
      dayOfWeek: number;
    }> = [];
    const today = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();

      const dataPoint = data.find((item) => item.date === dateString);
      const count = dataPoint ? dataPoint.count : 0;

      calendarData.push({ date: dateString, count, dayOfWeek });
    }
    return calendarData;
  };

  const calendarData = generateCalendarData();

  // Group by weeks
  const weeks: Array<
    Array<{ date: string; count: number; dayOfWeek: number }>
  > = [];
  let currentWeek: Array<{ date: string; count: number; dayOfWeek: number }> =
    [];

  calendarData.forEach((day) => {
    if (currentWeek.length === 0 || day.dayOfWeek === 0) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [day];
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getColorIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count >= 3) return `bg-${skill.color.replace('-500', '')}-600`;
    if (count >= 2) return `bg-${skill.color.replace('-500', '')}-500`;
    if (count >= 1) return `bg-${skill.color.replace('-500', '')}-400`;
    return `bg-${skill.color.replace('-500', '')}-300`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto" data-testid="activity-heatmap">
      <div className="inline-block min-w-full">
        {/* Day labels */}
        <div className="flex mb-2">
          <div className="w-8"></div>
          {dayNames.map((day, index) => (
            <div key={day} className="w-3 text-xs text-gray-500 text-center">
              {index % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex space-x-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getColorIntensity(day.count)}`}
                  title={`${formatDate(day.date)}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${formatDate(day.date)}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
