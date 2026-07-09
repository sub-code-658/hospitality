// Replaced recharts with native HTML/CSS (Ponytail philosophy)
import React from "react";

const COLORS = ["#6366f1", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"];

export function StatsBarChart({ data, title }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex h-48 items-end gap-2 mt-4">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 group relative"
          >
            <div
              className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-400"
              style={{ height: `${(item.value / max) * 100}%` }}
              title={`${item.name}: ${item.value}`}
            ></div>
            <span className="text-xs text-gray-400 truncate w-full text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApplicationsPieChart({ data, title }) {
  // Simplified to a list of stats instead of complex SVG pie for minimalism
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              ></div>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventTrendChart({ data, title }) {
  // Simplified line chart using bar representation to avoid SVG paths bloat
  const maxEvents = Math.max(...data.map((d) => d.events), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-16">{item.month}</div>
            <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${(item.events / maxEvents) * 100}%` }}
              ></div>
            </div>
            <div className="w-8 text-right">{item.events}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChart({ data, title }) {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex h-48 items-end gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-green-500 rounded-t-sm"
              style={{ height: `${(item.revenue / maxRev) * 100}%` }}
              title={`NPR ${item.revenue}`}
            ></div>
            <span className="text-xs text-gray-400">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatingDistributionChart({ data, title }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-12 text-right">{item.stars} ⭐</div>
            <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <div className="w-8">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
