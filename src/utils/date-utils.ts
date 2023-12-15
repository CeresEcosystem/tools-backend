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

export function subtractHours(date: Date, hours: number): Date {
  date.setHours(date.getHours() - hours);

  return date;
}

export function addSeconds(date: Date, seconds: number): Date {
  date.setSeconds(date.getSeconds() + seconds);

  return date;
}

export function getDateOneMonthBefore(): Date {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() - 1);

  return currentDate;
}
