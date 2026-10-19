import React from 'react';
import katex from 'katex';

interface StackedFractionProps {
  math?: string;
  num?: number | string;
  den?: number | string;
  className?: string;
  displayMode?: boolean;
}

export const StackedFraction: React.FC<StackedFractionProps> = ({
  math,
  num,
  den,
  className = '',
  displayMode = false,
}) => {
  // If raw LaTeX/KaTeX string provided
  if (math) {
    try {
      const html = katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
      return (
        <span
          className={`inline-flex items-center align-middle font-mono ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      // Fallback below
    }
  }

  // Fallback pure CSS stacked fraction
  if (num !== undefined && den !== undefined) {
    return (
      <span className={`inline-flex flex-col items-center justify-center align-middle mx-1 font-mono text-sm ${className}`}>
        <span className="border-b border-current px-1 leading-tight text-center w-full">{num}</span>
        <span className="px-1 leading-tight text-center w-full">{den}</span>
      </span>
    );
  }

  return <span className={className}>{math}</span>;
};
