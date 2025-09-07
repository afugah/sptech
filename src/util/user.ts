export const getDisplayName = (
  email: string,
  { firstName, lastName }: { firstName?: string | null; lastName?: string | null },
): string => {
  if (!firstName && !lastName) return email;

  return `${firstName} ${lastName}`;
};
