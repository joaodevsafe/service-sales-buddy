import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-32',
    md: 'h-12 w-48',
    lg: 'h-16 w-64'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
        </linearGradient>
      </defs>
      
      {/* JP Letters - Bold and prominent */}
      <g className="font-bold">
        <text
          x="10"
          y="32"
          className="text-2xl font-bold"
          fill="url(#logoGradient)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="700"
        >
          JP
        </text>
      </g>
      
      {/* SOLUTECH text - Sleek and modern */}
      <g>
        <text
          x="50"
          y="32"
          className="text-lg"
          fill="hsl(var(--foreground))"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="18"
          fontWeight="300"
          letterSpacing="1px"
        >
          SOLUTECH
        </text>
      </g>
      
      {/* Accent line */}
      <line
        x1="10"
        y1="38"
        x2="170"
        y2="38"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
      />
    </svg>
  );
}