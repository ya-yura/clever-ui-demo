/**
 * Cleverence Logo Component
 * Orange forklift logo
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 120, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Orange hexagon background */}
        <path
          d="M100 10L180 55V145L100 190L20 145V55L100 10Z"
          fill="url(#orangeGradient)"
        />
        
        {/* Forklift icon */}
        <g transform="translate(50, 60)">
          {/* Fork body */}
          <path
            d="M15 40 L15 15 C15 10 20 5 30 5 L55 5 C60 5 65 10 65 15 L65 40 L75 45 L75 70 L15 70 L15 40 Z"
            fill="white"
            stroke="white"
            strokeWidth="3"
          />
          
          {/* Windshield */}
          <path
            d="M25 15 L25 35 L55 35 L55 15 Z"
            fill="#ff8800"
            opacity="0.3"
          />
          
          {/* Mast */}
          <rect x="70" y="5" width="8" height="75" fill="white" rx="2" />
          
          {/* Fork */}
          <rect x="10" y="65" width="25" height="4" fill="white" rx="1" />
          
          {/* Wheels */}
          <circle cx="25" cy="78" r="6" fill="white" stroke="#ff8800" strokeWidth="2" />
          <circle cx="55" cy="78" r="6" fill="white" stroke="#ff8800" strokeWidth="2" />
          
          {/* Letter "L" */}
          <text x="85" y="55" fill="white" fontSize="48" fontWeight="bold" fontFamily="Arial, sans-serif">L</text>
        </g>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff8800" />
            <stop offset="100%" stopColor="#ff6600" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;

