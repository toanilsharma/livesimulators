import React, { useMemo } from 'react';
import { MathView } from './MathView';

export interface RichMathTextProps {
  content?: string;
  children?: React.ReactNode;
  className?: string;
  as?: 'p' | 'div' | 'span';
  mathClassName?: string;
  boldClassName?: string;
}

interface Token {
  type: 'text' | 'math-block' | 'math-inline' | 'bold' | 'code';
  value: string;
}

/**
 * Tokenizes text containing:
 * - $$...$$ or \[...\] -> block math
 * - $...$ or \(...\) -> inline math
 * - **...** -> bold emphasis
 * - `...` -> inline code
 * - Standalone LaTeX commands starting with \ (e.g. \eta_{th}, \le, \ge, \omega_0, \approx)
 */
function tokenizeRichContent(rawText: string): Token[] {
  if (!rawText) return [];

  // Normalize \[...\] to $$...$$ and \(...\) to $...$
  let text = rawText
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  const tokens: Token[] = [];
  // Regex matches:
  // 1. $$ ... $$ (block math)
  // 2. $ ... $ (inline math)
  // 3. ** ... ** (bold)
  // 4. ` ... ` (code)
  // 5. Standalone LaTeX expression starting with \ (e.g. \eta_{th} = ..., \le, \ge, etc.)
  const pattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\\[a-zA-Z]+(?:\{[^}]*\}|_[a-zA-Z0-9{}]+|\^[a-zA-Z0-9{}]+)*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$')) {
      tokens.push({ type: 'math-block', value: matchedStr.slice(2, -2).trim() });
    } else if (matchedStr.startsWith('$')) {
      tokens.push({ type: 'math-inline', value: matchedStr.slice(1, -1).trim() });
    } else if (matchedStr.startsWith('**')) {
      tokens.push({ type: 'bold', value: matchedStr.slice(2, -2).trim() });
    } else if (matchedStr.startsWith('`')) {
      tokens.push({ type: 'code', value: matchedStr.slice(1, -1).trim() });
    } else if (matchedStr.startsWith('\\')) {
      tokens.push({ type: 'math-inline', value: matchedStr.trim() });
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens;
}

export const RichMathText: React.FC<RichMathTextProps> = ({
  content,
  children,
  className = '',
  as: Component = 'div',
  mathClassName = 'text-cyan-300 font-semibold',
  boldClassName = 'text-white font-bold',
}) => {
  const rawString = typeof children === 'string' ? children : content || '';

  const tokens = useMemo(() => {
    if (!rawString) return [];
    return tokenizeRichContent(rawString);
  }, [rawString]);

  if (!rawString && children) {
    return <Component className={className}>{children}</Component>;
  }

  if (tokens.length === 0) {
    return null;
  }

  return (
    <Component className={className}>
      {tokens.map((token, idx) => {
        switch (token.type) {
          case 'math-block':
            return (
              <MathView
                key={idx}
                math={token.value}
                block
                className={`my-2 py-1.5 px-3 bg-slate-900/90 rounded-lg border border-slate-800/80 ${mathClassName}`}
              />
            );
          case 'math-inline':
            return (
              <MathView
                key={idx}
                math={token.value}
                className={`mx-0.5 ${mathClassName}`}
              />
            );
          case 'bold':
            return (
              <strong key={idx} className={boldClassName}>
                {token.value}
              </strong>
            );
          case 'code':
            return (
              <code
                key={idx}
                className="font-mono text-cyan-300 font-bold bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 text-[11px] mx-0.5"
              >
                {token.value}
              </code>
            );
          case 'text':
          default:
            return <React.Fragment key={idx}>{token.value}</React.Fragment>;
        }
      })}
    </Component>
  );
};
