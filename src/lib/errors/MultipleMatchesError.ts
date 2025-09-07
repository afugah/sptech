import { type IVoyado } from '@/src/lib/framework/Voyado/types/IVoyado';

export class MultipleMatchesError extends Error {
  constructor(
    message: string,
    public readonly matches: string[],
  ) {
    super(message);
  }
}

export const isMultipleMatchesError = (err: unknown): err is IVoyado.MultipleMatchesError =>
  !!err &&
  typeof err === 'object' &&
  'errorCode' in err &&
  err.errorCode === 'MultipleMatches' &&
  'messageDetails' in err &&
  typeof err.messageDetails === 'object' &&
  err.messageDetails !== null &&
  'multipleMatchesFound' in err.messageDetails &&
  Array.isArray(err.messageDetails.multipleMatchesFound);
