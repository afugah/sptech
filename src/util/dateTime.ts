export const toLocalISOString = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  localDate.setSeconds(0);
  localDate.setMilliseconds(0);

  return localDate.toISOString().slice(0, 16);
};
