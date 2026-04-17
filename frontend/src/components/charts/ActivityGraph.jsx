import { useMemo } from 'react';

const INTENSITY = [
  'bg-surface-800',      // 0 - no activity
  'bg-emerald-900/60',   // 1 - low
  'bg-emerald-700/70',   // 2 - medium
  'bg-emerald-500/80',   // 3 - high
  'bg-emerald-400',      // 4 - very high
];

export default function ActivityGraph({ activityLog = [], className = '' }) {
  const data = useMemo(() => {
    const today = new Date();
    const weeks = [];
    const days = [];

    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = activityLog.find(a => a.date === dateStr);
      const count = entry ? entry.actions : 0;

      days.push({
        date: dateStr,
        count,
        dayOfWeek: date.getDay(),
        intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4,
      });
    }

    // Group into weeks (columns)
    let week = new Array(7).fill(null);
    days.forEach((day, i) => {
      week[day.dayOfWeek] = day;

      if (day.dayOfWeek === 6 || i === days.length - 1) {
        weeks.push([...week]);
        week = new Array(7).fill(null);
      }
    });

    return { weeks, totalActions: days.reduce((sum, d) => sum + d.count, 0) };
  }, [activityLog]);

  const months = useMemo(() => {
    const labels = [];
    const monthNames = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
    let lastMonth = -1;

    data.weeks.forEach((week, i) => {
      const firstDay = week.find(d => d !== null);
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          labels.push({ index: i, label: monthNames[month] });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [data.weeks]);

  const dayLabels = ['', 'Пн', '', 'Ср', '', 'Пт', ''];

  return (
    <div className={className}>
      <div className="flex gap-0.5 relative">
        {/* Day labels (sticky left) */}
        <div className="flex flex-col gap-0.5 mr-1 pt-[22px] sticky left-0 bg-surface-900 z-10 pr-1 border-r border-surface-800">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[11px] flex items-center">
              <span className="text-[10px] text-surface-500 w-5 text-right">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable area for months and grid */}
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="w-max pl-1">
            {/* Month labels */}
            <div className="relative h-4 mb-1.5">
              {months.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] text-surface-500 absolute"
                  style={{ left: `${m.index * 13}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {data.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`
                        w-[11px] h-[11px] rounded-sm
                        ${day ? INTENSITY[day.intensity] : 'bg-transparent'}
                        ${day ? 'hover:ring-1 hover:ring-surface-500 cursor-pointer' : ''}
                        transition-colors duration-100
                      `}
                      title={day ? `${day.date}: ${day.count} дій` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-surface-500 justify-end">
        <span>Менше</span>
        {INTENSITY.map((cls, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-sm ${cls}`} />
        ))}
        <span>Більше</span>
      </div>
    </div>
  );
}
