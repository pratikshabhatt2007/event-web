export const fmtDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const fmtDay = (iso) => {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: 'numeric' }),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
  };
};

export const isPast = (iso) => new Date(iso) < new Date();

/** ISO string -> value for <input type="datetime-local"> in local time */
export function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const COLORS = ['#4285f4', '#ea4335', '#f9ab00', '#34a853'];
export function categoryColor(name = '') {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
}
