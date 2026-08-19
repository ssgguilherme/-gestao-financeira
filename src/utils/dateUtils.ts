/**
 * Utility functions for date and time formatting matching pt-BR standards.
 */

/**
 * Formats a date string (YYYY-MM-DD or ISO string) to Brazilian format (DD/MM/YYYY).
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '';
  const raw = dateStr.trim();
  // If already in DD/MM/YYYY format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    return raw;
  }

  try {
    // Handle YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
    const cleanDate = raw.includes('T') ? raw.split('T')[0] : raw;
    const parts = cleanDate.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
  } catch (err) {
    console.error('Error formatting date:', err);
  }

  return dateStr;
}

/**
 * Formats an ISO date-time string into "DD/MM/YYYY às HH:mm" or "DD/MM/YYYY, HH:mm"
 */
export function formatDateTimeBR(dateTimeStr?: string | null, includeSeconds = false): string {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds ? { second: '2-digit' } : {})
      });
      return `${datePart} às ${timePart}`;
    }
  } catch (err) {
    console.error('Error formatting datetime:', err);
  }
  return formatDateBR(dateTimeStr);
}

/**
 * Formats time string (HH:mm:ss or ISO) to "HH:mm"
 */
export function formatTimeBR(timeStr?: string | null): string {
  if (!timeStr) return '';
  const raw = timeStr.trim();
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  try {
    if (raw.includes('T')) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    }
    const parts = raw.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
  } catch (err) {
    console.error('Error formatting time:', err);
  }
  return timeStr;
}

/**
 * Formats a month key (YYYY-MM) into month name and year in Portuguese (e.g., "Agosto de 2026")
 */
export function formatMonthYearBR(monthKey?: string | null): string {
  if (!monthKey) return '';
  try {
    const [year, month] = monthKey.split('-');
    if (year && month) {
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
      return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
    }
  } catch (err) {
    console.error('Error formatting month/year:', err);
  }
  return monthKey;
}

/**
 * Returns a greeting string based on the current device time (Bom dia / Boa tarde / Boa noite).
 */
export function getDeviceGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Returns the current device date formatted nicely in Portuguese (e.g. "Quarta-feira, 5 de Agosto de 2026").
 */
export function getDeviceFormattedDate(): string {
  const now = new Date();
  const formatted = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Returns current device time formatted in HH:mm.
 */
export function getDeviceFormattedTime(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Returns current local date in YYYY-MM-DD format for input[type="date"] defaults.
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

