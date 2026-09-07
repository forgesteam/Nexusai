import { Fragment, type ReactNode } from 'react';

const superscript: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n' };
const subscript: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', 'ₙ': 'n' };
const greek: Record<string, string> = { alpha: 'α', beta: 'β', gamma: 'γ', theta: 'θ', pi: 'π', delta: 'δ', lambda: 'λ', mu: 'μ', sigma: 'σ', omega: 'ω' };
const naturalMath = /(\\frac\{[^{}]+\}\{[^{}]+\}|\\sqrt(?:\{[^{}]+\}|[A-Za-z0-9]+)|[A-Za-zα-ωΑ-Ω0-9]+(?:\^|_)(?:\{[^}]+\}|[A-Za-z0-9]+)|[A-Za-z0-9]+\/[A-Za-z0-9]+|√\s*[A-Za-z0-9]+|[A-Za-zα-ωΑ-Ω0-9]+[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+|[A-Za-zα-ωΑ-Ω0-9]+[₀₁₂₃₄₅₆₇₈₉ₙ]+)/g;

const normalize = (value: string) => value
  .replace(/\\(geq|ge)/g, '≥').replace(/\\(leq|le)/g, '≤').replace(/\\times/g, '×')
  .replace(/\\cdot/g, '·').replace(/\\pi/g, 'π').replace(/\\theta/g, 'θ')
  .replace(/\\(alpha|beta|gamma|delta|lambda|mu|sigma|omega)/g, (_, name: string) => greek[name] || name);

function MathExpression({ value }: { value: string }) {
  const input = normalize(value.trim());
  const fraction = input.match(/^\\frac\{([^{}]+)\}\{([^{}]+)\}$/) || input.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (fraction) return <span className="math-expression math-fraction" aria-label={`${fraction[1]} over ${fraction[2]}`}><span>{fraction[1]}</span><span>{fraction[2]}</span></span>;
  const root = input.match(/^(?:\\sqrt\{([^{}]+)\}|\\sqrt([A-Za-z0-9]+)|√\s*([A-Za-z0-9]+))$/);
  if (root) return <span className="math-expression math-root"><span>√</span><span>{root[1] || root[2] || root[3]}</span></span>;
  const scripted = input.match(/^(.+?)(\^|_)(?:\{([^}]+)\}|([A-Za-z0-9]+))$/);
  if (scripted) return <span className="math-expression">{scripted[1]}{scripted[2] === '^' ? <sup>{scripted[3] || scripted[4]}</sup> : <sub>{scripted[3] || scripted[4]}</sub>}</span>;
  const unicodeScript = input.match(/^(.+?)([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+|[₀₁₂₃₄₅₆₇₈₉ₙ]+)$/);
  if (unicodeScript) {
    const chars = unicodeScript[2];
    const map = chars[0] in superscript ? superscript : subscript;
    const content = [...chars].map(character => map[character]).join('');
    return <span className="math-expression">{unicodeScript[1]}{chars[0] in superscript ? <sup>{content}</sup> : <sub>{content}</sub>}</span>;
  }
  return <span className="math-expression">{input}</span>;
}

export default function MathText({ value }: { value: string }) {
  const nodes: ReactNode[] = [];
  const addNatural = (text: string, key: string) => {
    let last = 0;
    for (const match of text.matchAll(naturalMath)) {
      const start = match.index ?? 0;
      if (start > last) nodes.push(<Fragment key={`${key}-text-${last}`}>{text.slice(last, start)}</Fragment>);
      nodes.push(<MathExpression key={`${key}-math-${start}`} value={match[0]} />);
      last = start + match[0].length;
    }
    if (last < text.length) nodes.push(<Fragment key={`${key}-text-end`}>{text.slice(last)}</Fragment>);
  };
  let last = 0;
  const latex = /\$([^$]+)\$|\\\((.*?)\\\)|\\\[([\s\S]*?)\\\]/g;
  for (const match of value.matchAll(latex)) {
    const start = match.index ?? 0;
    if (start > last) addNatural(value.slice(last, start), `plain-${last}`);
    nodes.push(<MathExpression key={`latex-${start}`} value={match[1] || match[2] || match[3]} />);
    last = start + match[0].length;
  }
  if (last < value.length || nodes.length === 0) addNatural(value.slice(last), `plain-${last}`);
  return <>{nodes}</>;
}
