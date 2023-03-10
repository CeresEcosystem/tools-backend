export function getTodayFormatted(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const todayFormatted = now.toISOString().slice(0, 10);

  return todayFormatted;
}
