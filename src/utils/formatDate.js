export function FormatDate(dateString) {
  if (!dateString) return 'n/a';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};