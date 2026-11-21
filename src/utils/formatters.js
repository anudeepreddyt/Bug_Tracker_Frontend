export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateInput);
  }
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const cleaned = name.trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}
