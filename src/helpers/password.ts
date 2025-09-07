'use client';

export const validatePasswords = (
  password: string,
  repeatPassword: string,

  messages: {
    notMatch: string;
    requirements: string;
  },
  setErrorMessage: (message: string) => void,
) => {
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password !== repeatPassword) {
    setErrorMessage(messages.notMatch);
    return false;
  } else if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
    setErrorMessage(messages.requirements);
    return false;
  } else {
    setErrorMessage('');
    return true;
  }
};
