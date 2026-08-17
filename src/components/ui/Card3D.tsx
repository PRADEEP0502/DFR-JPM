import React, { useState, useRef } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  noTilt?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  onClick,
  glowColor = 'rgba(2, 132, 199, 0.12)',
  noTilt = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('none');
  const [shine, setShine] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (noTilt) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`);
    setShine({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.2
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
    setShine({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.18s cubic-bezier(0.1, 0.8, 0.2, 1), box-shadow 0.25s ease',
        transformStyle: 'preserve-3d',
        boxShadow: shine.opacity > 0
          ? `0 20px 35px -10px ${glowColor}, 0 12px 20px -8px rgba(0, 0, 0, 0.08)`
          : '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)'
      }}
      className={`relative rounded-2xl bg-white border border-slate-200/80 overflow-hidden cursor-pointer select-none ${className}`}
    >
      {/* Dynamic 3D Shine Reflection Overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          opacity: shine.opacity,
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 60%)`
        }}
      />
      {children}
    </div>
  );
};
