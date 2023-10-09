export function getDateFormatted(date: Date): string {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const dateFormatted = date.toISOString().slice(0, 10);

  return dateFormatted;
}

export function getTodayFormatted(): string {
  return getDateFormatted(new Date());
}

export function subtractDays(date: Date, days: number): Date {
  date.setDate(date.getDate() - days);

  return date;
}
