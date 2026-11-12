const P: Record<string, JSX.Element> = {
  run: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="14.5" cy="4.5" r="2" /><path d="M8 21l3-6 3 2v5M6 11l3-3h5l2 3 3 1M11 8l-1 5" /></g>,
  lift: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 6v12M3.5 9v6M17.5 6v12M20.5 9v6M6.5 12h11" /></g>,
  flame: <path fill="currentColor" d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" />,
  play: <path fill="currentColor" d="M7 4.5v15l13-7.5z" />,
  check: <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />,
  home: <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" />,
  cal: <g fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></g>,
  chart: <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 15l4-4 3 3 5-6" />,
  user: <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" /></g>,
  chev: <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />,
  back: <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />,
  x: <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />,
  trophy: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5" /></g>,
  moon: <path fill="currentColor" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  edit: <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  info: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></g>,
  swap: <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 4L4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7" />,
  timer: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></g>,
};

export function Icon({ n, size }: { n: keyof typeof P | string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {P[n] ?? null}
    </svg>
  );
}
