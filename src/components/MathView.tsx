import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Pure LaTeX renderer using KaTeX for crisp, publication-grade mathematical equations.
 */
export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    if (!math) return '';
    try {
      return katex.renderToString(math.trim(), {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return '';
    }
  }, [math, block]);

  if (!html) {
    return <span className={`font-mono ${className}`}>{math}</span>;
  }

  if (block) {
    return (
      <div
        className={`katex-block my-1.5 overflow-x-auto custom-scrollbar py-1 text-cyan-300 font-semibold ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`katex-inline inline-flex items-center text-cyan-300 font-medium ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
