import { useState, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'right';
}

export function Tooltip({ content, children, side = 'right' }: TooltipProps): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);

  const sideClass =
    side === 'right'
      ? 'left-full top-1/2 ml-2 -translate-y-1/2'
      : 'bottom-full left-1/2 mb-2 -translate-x-1/2';

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-64 rounded bg-gray-900 px-3 py-2 text-xs leading-snug text-white shadow-lg ${sideClass}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
