import { useLayoutEffect, useRef, useState } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  /** Etiqueta accesible del grupo de tabs */
  label: string;
}

export function Tabs({ tabs, active, onChange, label }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicador, setIndicador] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const recalcular = () => {
      const el = tabRefs.current[active];
      const container = containerRef.current;
      if (!el || !container) return;
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicador({ left: elRect.left - containerRect.left, width: elRect.width });
    };
    recalcular();
    window.addEventListener('resize', recalcular);
    return () => window.removeEventListener('resize', recalcular);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, tabs]);

  return (
    <div className={styles.tabs} role="tablist" aria-label={label} ref={containerRef}>
      {indicador && (
        <span
          className={styles.indicador}
          style={{ transform: `translateX(${indicador.left}px)`, width: indicador.width }}
          aria-hidden="true"
        />
      )}
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => {
            tabRefs.current[tab.id] = el;
          }}
          role="tab"
          aria-selected={active === tab.id}
          className={active === tab.id ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
