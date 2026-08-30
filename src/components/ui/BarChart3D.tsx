import React, { useState } from 'react';

export interface Bar3DItem {
  name: string;
  bills: number;
}

interface BarChart3DProps {
  data: Bar3DItem[];
  colorScheme?: 'blue' | 'purple' | 'emerald';
}

export const BarChart3D: React.FC<BarChart3DProps> = ({ data, colorScheme = 'blue' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.bills), 1);
  const totalBills = data.reduce((sum, d) => sum + d.bills, 0);

  // Colors for 3D faces
  const palette = {
    blue: {
      front: 'url(#blueFront)',
      top: '#7dd3fc',
      side: '#0369a1',
      hoverFront: '#0284c7',
    },
    purple: {
      front: 'url(#purpleFront)',
      top: '#e9d5ff',
      side: '#6b21a8',
      hoverFront: '#7e22ce',
    },
    emerald: {
      front: 'url(#emeraldFront)',
      top: '#a7f3d0',
      side: '#047857',
      hoverFront: '#059669',
    },
  }[colorScheme];

  const chartHeight = 160;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingBottom = 40;
  const barDepth = 10; // 3D depth offset

  const availableWidth = chartWidth - paddingLeft - paddingRight;
  const barGap = availableWidth / data.length;
  const barWidth = Math.min(barGap * 0.45, 60);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-full h-[240px] sm:h-[270px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Front Face Gradients */}
            <linearGradient id="blueFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="purpleFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="emeraldFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Drop Shadow filter under 3D bars */}
            <filter id="bar3DShadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - ratio * (chartHeight - 30);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-extrabold fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render 3D Cuboid Bars */}
          <g filter="url(#bar3DShadow)">
            {data.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              const barH = (item.bills / maxVal) * (chartHeight - 30);
              const x = paddingLeft + idx * barGap + (barGap - barWidth) / 2;
              const y = chartHeight - barH;
              const liftY = isHovered ? -5 : 0;
              const pct = totalBills > 0 ? ((item.bills / totalBills) * 100).toFixed(0) : '0';

              return (
                <g
                  key={item.name}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-transform duration-200"
                  transform={`translate(0, ${liftY})`}
                >
                  {/* Front Face */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    fill={palette.front}
                    rx="3"
                  />

                  {/* Top Face Cap (3D Isometric Bevel) */}
                  {barH > 1 && (
                    <polygon
                      points={`
                        ${x},${y}
                        ${x + barDepth},${y - barDepth}
                        ${x + barWidth + barDepth},${y - barDepth}
                        ${x + barWidth},${y}
                      `}
                      fill={palette.top}
                    />
                  )}

                  {/* Right Side Face (3D Depth Wall) */}
                  {barH > 1 && (
                    <polygon
                      points={`
                        ${x + barWidth},${y}
                        ${x + barWidth + barDepth},${y - barDepth}
                        ${x + barWidth + barDepth},${chartHeight - barDepth}
                        ${x + barWidth},${chartHeight}
                      `}
                      fill={palette.side}
                      opacity={0.88}
                    />
                  )}

                  {/* Value Badge on Top of Bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - barDepth - 6}
                    textAnchor="middle"
                    className={`text-[12px] font-black transition-all ${
                      isHovered ? 'fill-sky-600 scale-110' : 'fill-slate-700'
                    }`}
                  >
                    {item.bills}
                  </text>

                  {/* Percentage Tag */}
                  <text
                    x={x + barWidth / 2}
                    y={y - barDepth - 20}
                    textAnchor="middle"
                    className="text-[10px] font-extrabold fill-slate-400"
                  >
                    {pct}%
                  </text>

                  {/* X-Axis Clean Horizontal Label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 22}
                    textAnchor="middle"
                    className={`text-[12px] font-extrabold transition-colors ${
                      isHovered ? 'fill-sky-700 font-black' : 'fill-slate-700'
                    }`}
                  >
                    {item.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
