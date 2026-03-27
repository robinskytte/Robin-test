import React from 'react';

interface SimulatedDataTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function SimulatedDataText({ children, className = '', style }: SimulatedDataTextProps) {
  return (
    <span className={`text-red-400 opacity-75 ${className}`} style={style}>
      {children}
    </span>
  );
}
