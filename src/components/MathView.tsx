import React, { useMemo } from 'react';
import katex from 'katex';
import { cleanLatexToPlainText } from '../utils/engineeringTheory';

interface MathViewProps {
  math: string;
  block?: boolean;
  displayMode?: boolean;
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Pure LaTeX renderer using KaTeX for crisp, publication-grade mathematical equations.
 * SEO & Scraper Optimized:
 * - Visual .katex-html span strictly uses aria-hidden="true" so screen readers and text scrapers ignore presentation spans.
 * - .katex-mathml outputs a single clean <annotation encoding="application/x-tex"> and aria-label so text scrapers & LLMs do not index triplicate gibberish math strings.
 */
export const MathView: React.FC<MathViewProps> = ({ math, block = false, displayMode = false, className = '' }) => {
  const isBlock = Boolean(block || displayMode);

  const cleanMath = useMemo(() => {
    if (!math) return '';
    let str = math.trim();
    if (str.startsWith('$$') && str.endsWith('$$') && str.length >= 4) {
      str = str.slice(2, -2).trim();
    } else if (str.startsWith('$') && str.endsWith('$') && str.length >= 2) {
      str = str.slice(1, -1).trim();
    }
    return str;
  }, [math]);

  const plain = useMemo(() => cleanLatexToPlainText(cleanMath || ''), [cleanMath]);

  const html = useMemo(() => {
    if (!cleanMath) return '';
    try {
      let raw = katex.renderToString(cleanMath, {
        displayMode: isBlock,
        throwOnError: false,
        strict: false,
        output: 'htmlAndMathml',
      });

      // Ensure visual .katex-html has aria-hidden="true"
      if (!raw.includes('class="katex-html" aria-hidden="true"')) {
        raw = raw.replace(/<span class="katex-html"/g, '<span class="katex-html" aria-hidden="true"');
      }

      // Sanitize .katex-mathml to output a single clean MathML with <annotation encoding="application/x-tex"> and aria-label
      // This prevents text scrapers & LLM bots from indexing triplicate strings (MathML tokens + LaTeX annotation + HTML spans)
      const cleanMathMl = `<span class="katex-mathml" aria-label="${escapeHtml(plain)}"><math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="${escapeHtml(plain)}"><semantics><annotation encoding="application/x-tex">${escapeHtml(cleanMath)}</annotation></semantics></math></span>`;

      const sanitized = raw.replace(/<span class="katex-mathml"><math[\s\S]*?<\/math><\/span>/, cleanMathMl);
      return sanitized;
    } catch {
      return '';
    }
  }, [cleanMath, isBlock, plain]);

  if (!html) {
    return <span className={`font-mono ${className}`}>{plain}</span>;
  }

  if (isBlock) {
    return (
      <div
        className={`katex-block my-1.5 overflow-x-auto custom-scrollbar py-1 text-cyan-300 font-semibold ${className}`}
        aria-label={plain}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`katex-inline inline-flex items-center text-cyan-300 font-medium ${className}`}
      aria-label={plain}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

