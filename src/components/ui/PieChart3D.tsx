import React, { useState } from 'react';

export interface Pie3DSlice {
  name: string;
  value: number;
  color: string;
  darkColor: string;
}

interface PieChart3DProps {
  data: Pie3DSlice[];
  totalBills: number;
}

export const PieChart3D: React.FC<PieChart3DProps> = ({ data, totalBills }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  // Calculate slice angles in 3D
  const cx = 150;
  const cy = 120;
  const rx = 100; // horizontal radius for isometric ellipse
  const ry = 60;  // vertical radius for 3D tilt
  const depth = 22; // 3D extrusion height

  let startAngle = -90; // start top

  const slices = data.map((d, index) => {
    const angle = (d.value / total) * 360;
    const endAngle = startAngle + angle;

    const sliceData = {
      ...d,
      startAngle,
      endAngle,
      angle,
      index
    };

    startAngle = endAngle;
    return sliceData;
  });

  // Helper to get ellipse point
  const getPoint = (angleDeg: number, radiusX: number, radiusY: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radiusX * Math.cos(rad),
      y: cy + radiusY * Math.sin(rad)
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="relative w-full max-w-[320px] h-[200px] flex items-center justify-center">
        <svg viewBox="0 0 300 240" className="w-full h-full overflow-visible">
          <defs>
            {/* Soft drop shadow filter under 3D pie */}
            <filter id="pie3DShadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.15" />
            </filter>

            {/* Radial bevel highlights */}
            <radialGradient id="topShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g filter="url(#pie3DShadow)">
            {/* Render 3D Side Walls (Extrusions) */}
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              const midAngle = (slice.startAngle + slice.endAngle) / 2;
              const shiftX = isHovered ? Math.cos((midAngle * Math.PI) / 180) * 8 : 0;
              const shiftY = isHovered ? Math.sin((midAngle * Math.PI) / 180) * 5 : 0;

              // Top & bottom arc points
              const p1Top = getPoint(slice.startAngle, rx, ry);
              const p2Top = getPoint(slice.endAngle, rx, ry);
              const p1Bot = { x: p1Top.x, y: p1Top.y + depth };
              const p2Bot = { x: p2Top.x, y: p2Top.y + depth };

              const largeArcFlag = slice.angle > 180 ? 1 : 0;

              // Outer 3D side wall path
              const sidePath = `
                M ${p1Top.x} ${p1Top.y}
                A ${rx} ${ry} 0 ${largeArcFlag} 1 ${p2Top.x} ${p2Top.y}
                L ${p2Bot.x} ${p2Bot.y}
                A ${rx} ${ry} 0 ${largeArcFlag} 0 ${p1Bot.x} ${p1Bot.y}
                Z
              `;

              return (
                <path
                  key={`side-${slice.index}`}
                  d={sidePath}
                  fill={slice.darkColor}
                  transform={`translate(${shiftX}, ${shiftY})`}
                  className="transition-transform duration-200"
                />
              );
            })}

            {/* Render 3D Top Faces */}
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              const midAngle = (slice.startAngle + slice.endAngle) / 2;
              const shiftX = isHovered ? Math.cos((midAngle * Math.PI) / 180) * 8 : 0;
              const shiftY = isHovered ? Math.sin((midAngle * Math.PI) / 180) * 5 : 0;

              const p1 = getPoint(slice.startAngle, rx, ry);
              const p2 = getPoint(slice.endAngle, rx, ry);
              const largeArcFlag = slice.angle > 180 ? 1 : 0;

              // Sector path from center
              const topPath = `
                M ${cx} ${cy}
                L ${p1.x} ${p1.y}
                A ${rx} ${ry} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}
                Z
              `;

              return (
                <g
                  key={`top-${slice.index}`}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-transform duration-200"
                  transform={`translate(${shiftX}, ${shiftY})`}
                >
                  <path
                    d={topPath}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Subtle Top Shine Layer */}
                  <path
                    d={topPath}
                    fill="url(#topShine)"
                    style={{ mixBlendMode: 'overlay' }}
                  />
                </g>
              );
            })}

            {/* Inner 3D Donut Hole cutout (3D Cylinder Center) */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx * 0.45}
              ry={ry * 0.45}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
          </g>

          {/* Central 3D Stats Badge */}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            className="text-base font-black fill-slate-900"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="text-[9px] font-extrabold uppercase fill-slate-400 tracking-wider"
          >
            Active Bills
          </text>
        </svg>
      </div>

      {/* 3D Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[11px] font-bold">
        {data.map((d, idx) => (
          <div
            key={d.name}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer border transition ${
              hoveredIndex === idx
                ? 'bg-slate-100 border-slate-300 scale-105 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-2xs"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-800">{d.name}</span>
            <span className="text-slate-500 font-extrabold">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
