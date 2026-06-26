import { type ReactNode } from 'react';
import styles from './ReportView.module.css';

// Render de un subconjunto de markdown (##, ###, **bold**, listas, ---).
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={i}>{m[1]}</strong> : <span key={i}>{part}</span>;
  });
}

function renderMarkdown(md: string): ReactNode {
  const out: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = (key: string) => {
    if (list.length) {
      out.push(<ul key={`ul-${key}`}>{list}</ul>);
      list = [];
    }
  };
  md.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return flush(String(i));
    if (/^-{3,}$/.test(t)) {
      flush(String(i));
      out.push(<hr key={i} />);
    } else if (t.startsWith('### ')) {
      flush(String(i));
      out.push(<h3 key={i}>{renderInline(t.slice(4))}</h3>);
    } else if (t.startsWith('## ')) {
      flush(String(i));
      out.push(<h2 key={i}>{renderInline(t.slice(3))}</h2>);
    } else if (t.startsWith('- ')) {
      list.push(<li key={i}>{renderInline(t.slice(2))}</li>);
    } else {
      flush(String(i));
      out.push(<p key={i}>{renderInline(t)}</p>);
    }
  });
  flush('end');
  return out;
}

/** Tarjeta con el informe de scouting renderizado desde markdown. */
export function ReportView({ markdown }: { markdown: string }) {
  return <article className={styles.informe}>{renderMarkdown(markdown)}</article>;
}
