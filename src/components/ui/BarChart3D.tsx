import React, { useState } from 'react';

export interface Bar3DItem {
  name: string;
  bills: number;
}

interface BarChart3DProps {
  data: Bar3DItem[];
  colorScheme?: 'blue' | 'purple';
}

export const BarChart3D: React.FC<BarChart3DProps> = ({ data, colorScheme = 'blue' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.bills), 1);

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
    }
  }[colorScheme];

  const chartHeight = 180;
  const chartWidth = 360;
  const paddingLeft = 30;
  const paddingBottom = 40;
  const barDepth = 8; // 3D depth offset X/Y

  const availableWidth = chartWidth - paddingLeft - 20;
  const barGap = availableWidth / data.length;
  const barWidth = Math.min(barGap * 0.55, 28);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-full h-[220px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`} className="w-full h-full overflow-visible">
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

            {/* Drop Shadow filter under 3D bars */}
            <filter id="bar3DShadow" x="-20%" y="-10%" width="140%" height="140%">
              <feDropShadow dx="2" dy="8" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = chartHeight - ratio * (chartHeight - 20);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - 10}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text x={paddingLeft - 6} y={y + 3} textAnchor="end" className="text-[9px] font-bold fill-slate-400">
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
              const liftY = isHovered ? -4 : 0;

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
                    rx="2"
                  />

                  {/* Top Face Cap (3D Isometric Bevel) */}
                  {barH > 2 && (
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
                  {barH > 2 && (
                    <polygon
                      points={`
                        ${x + barWidth},${y}
                        ${x + barWidth + barDepth},${y - barDepth}
                        ${x + barWidth + barDepth},${chartHeight - barDepth}
                        ${x + barWidth},${chartHeight}
                      `}
                      fill={palette.side}
                      opacity={0.85}
                    />
                  )}

                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <g transform={`translate(${x + barWidth / 2}, ${y - 18})`}>
                      <rect
                        x="-20"
                        y="-16"
                        width="40"
                        height="18"
                        rx="5"
                        fill="#0f172a"
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        className="text-[10px] font-black fill-white"
                      >
                        {item.bills}
                      </text>
                    </g>
                  )}

                  {/* X-Axis Label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 16}
                    textAnchor="end"
                    transform={`rotate(-30, ${x + barWidth / 2}, ${chartHeight + 16})`}
                    className={`text-[9px] font-bold ${isHovered ? 'fill-sky-700 font-extrabold' : 'fill-slate-500'}`}
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
