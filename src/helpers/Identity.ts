'use server';

import { di } from '../lib/di';
import { VoyadoService } from '../lib/framework/Voyado/services/VoyadoService';

const pattern = /^\d{6}(\d{2})?[+-]?\d{4}$/;

const hasCorrectChecksum = (input: string) => {
  const sum = input
    .split('')
    .reverse()
    .map(Number)
    .map((x, i) => (i % 2 ? x * 2 : x))
    .map((x) => (x > 9 ? x - 9 : x))
    .reduce((x, y) => x + y);

  return sum % 10 === 0;
};

const hasValidDate = (input: string) => {
  const match = /^(\d{2})(\d{2})(\d{2})/.exec(input);

  if (!match) {
    return false;
  }

  const [_, yearStr, monthStr, dayStr] = match;

  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  let day = Number(dayStr);

  if (day > 60) {
    day -= 60;
  }

  const date = new Date(year, month, day);

  const yearIsValid = String(date.getFullYear()).substr(-2) === yearStr;
  const monthIsValid = date.getMonth() === month;
  const dayIsValid = date.getDate() === day;

  return yearIsValid && monthIsValid && dayIsValid;
};

export const isValidSSN = async (input: string) => {
  if (!pattern.test(input)) {
    return false;
  }

  const cleaned = input.replace(/[+-]/, '').slice(-10);

  return hasCorrectChecksum(cleaned) && hasValidDate(cleaned);
};

export const checkVoyadoEmailIsMember = async (email: string): Promise<boolean> => {
  const voyadoService = di.resolve(VoyadoService);

  try {
    const contact = await voyadoService.getContactByEmail(email);

    return contact?.meta?.contactType.toLowerCase() === 'member';
  } catch {
    return false;
  }
};
