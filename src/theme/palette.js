/**
 * The exact colour values from the original NOUS markup, kept in one place
 * so both the public site and the admin panel stay on the same palette.
 */
export const NOUS_COLORS = {
  background: '#f5f7fb',
  paper: '#ffffff',
  text: '#1f2937',
  textMuted: '#6b7280',
  dark: '#111827',
  darkHover: '#374151',
  accent: '#2563eb',
  accentSoft: '#eff6ff',
  accentLight: '#60a5fa',
  border: '#e5e7eb',
  borderHover: '#93c5fd',
  rowHover: '#f8fbff',
  danger: '#dc2626',
  success: '#16a34a',
};

export const NOUS_FONT = 'Arial, Helvetica, sans-serif';

/** Accents used to tell courses, levels and chapter sections apart at a glance. */
export const NOUS_ACCENTS = [
  { soft: '#eff6ff', mid: '#dbeafe', strong: '#2563eb' },
  { soft: '#f5f3ff', mid: '#ede9fe', strong: '#7c3aed' },
  { soft: '#ecfdf5', mid: '#d1fae5', strong: '#059669' },
  { soft: '#fff7ed', mid: '#ffedd5', strong: '#ea580c' },
  { soft: '#fdf2f8', mid: '#fce7f3', strong: '#db2777' },
  { soft: '#f0fdfa', mid: '#ccfbf1', strong: '#0d9488' },
];

export function nousAccent(index = 0) {
  return NOUS_ACCENTS[Math.abs(index) % NOUS_ACCENTS.length];
}
