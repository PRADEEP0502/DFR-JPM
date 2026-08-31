import React, { useState } from 'react';

export interface Bar3DItem {
  name: string;
  bills: number;
}

interface BarChartProps {
  data: Bar3DItem[];
  colorScheme?: 'blue' | 'purple' | 'emerald';
}

export const BarChart3D: React.FC<BarChartProps> = ({ data, colorScheme = 'purple' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.bills), 1);
  const totalBills = data.reduce((sum, d) => sum + d.bills, 0);

  // Gradient themes for crisp modern bars
  const themes = {
    purple: {
      gradientId: 'modernPurpleGrad',
      startColor: '#818cf8',
      endColor: '#4f46e5',
      hoverColor: '#6366f1',
      glow: 'rgba(79, 70, 229, 0.25)',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    blue: {
      gradientId: 'modernBlueGrad',
      startColor: '#38bdf8',
      endColor: '#0284c7',
      hoverColor: '#0369a1',
      glow: 'rgba(2, 132, 199, 0.25)',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    emerald: {
      gradientId: 'modernEmeraldGrad',
      startColor: '#34d399',
      endColor: '#059669',
      hoverColor: '#047857',
      glow: 'rgba(5, 150, 105, 0.25)',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  }[colorScheme];

  const svgHeight = 240;
  const svgWidth = 800;
  const paddingTop = 45;
  const paddingBottom = 45;
  const paddingLeft = 45;
  const paddingRight = 35;

  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const colGap = chartWidth / data.length;
  const barWidth = Math.min(colGap * 0.48, 54);

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 select-none">
      <div className="w-full h-[250px] sm:h-[290px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Crisp Linear Gradient */}
            <linearGradient id={themes.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themes.startColor} />
              <stop offset="100%" stopColor={themes.endColor} />
            </linearGradient>

            {/* Ambient Drop Shadow on Bars */}
            <filter id="barShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>

            {/* Hover Glow */}
            <filter id="hoverGlow" x="-30%" y="-20%" width="160%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor={themes.hoverColor} floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-Axis Scale */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-bold fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#e2e8f0"
            strokeWidth="2"
          />

          {/* Modern Flat-Bottom Vertical Bars */}
          {data.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            const percentage = totalBills > 0 ? ((item.bills / totalBills) * 100).toFixed(0) : '0';
            const barH = Math.max(item.bills > 0 ? (item.bills / maxVal) * chartHeight : 3, 3);
            const x = paddingLeft + idx * colGap + (colGap - barWidth) / 2;
            const y = paddingTop + chartHeight - barH;
            const radius = Math.min(8, barWidth / 2);

            // Path for flat-bottom, rounded-top bar
            const barPath = `
              M ${x},${paddingTop + chartHeight}
              L ${x},${y + radius}
              A ${radius},${radius} 0 0 1 ${x + radius},${y}
              L ${x + barWidth - radius},${y}
              A ${radius},${radius} 0 0 1 ${x + barWidth},${y + radius}
              L ${x + barWidth},${paddingTop + chartHeight}
              Z
            `;

            return (
              <g
                key={item.name}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Vertical Bar */}
                <path
                  d={barPath}
                  fill={`url(#${themes.gradientId})`}
                  filter={isHovered ? 'url(#hoverGlow)' : 'url(#barShadow)'}
                  className="transition-all duration-300"
                  transform={isHovered ? `scale(1.02) translate(${-x * 0.02}, ${-y * 0.02 - 3})` : ''}
                />

                {/* Floating Numeric Value Badge */}
                <g
                  transform={`translate(${x + barWidth / 2}, ${y - 12})`}
                  className="transition-all duration-200"
                >
                  <rect
                    x={-22}
                    y={-18}
                    width={44}
                    height={20}
                    rx={6}
                    fill={isHovered ? '#0f172a' : '#ffffff'}
                    stroke={isHovered ? '#0f172a' : '#e2e8f0'}
                    strokeWidth={1}
                    filter="url(#barShadow)"
                  />
                  <text
                    x={0}
                    y={-4}
                    textAnchor="middle"
                    className={`text-[11px] font-black transition-colors ${
                      isHovered ? 'fill-white' : 'fill-slate-900'
                    }`}
                  >
                    {item.bills}
                  </text>
                </g>

                {/* Percentage Label */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-black ${
                    isHovered ? 'fill-indigo-600' : 'fill-slate-400'
                  }`}
                >
                  {percentage}%
                </text>

                {/* X-Axis Category / Stage Name */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 34}
                  textAnchor="middle"
                  className={`text-[12px] font-extrabold tracking-tight transition-colors ${
                    isHovered ? 'fill-slate-900 font-black' : 'fill-slate-700'
                  }`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
