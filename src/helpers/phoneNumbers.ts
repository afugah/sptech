export const validatePhoneNumber = (phone: string, locale: string): boolean => {
  let regex: RegExp;

  switch (locale) {
    case 'no': // Norway
      regex = /^(?:\+47)?(?:4\d{7}|9\d{7}|[5-8]\d{7})$/;
      break;
    case 'fi': // Finland
      regex = /^(?:\+358)?(?:4\d{8}|50\d{7}|3[0-5]\d{6})$/;
      break;
    case 'sv': // Sweden
      regex = /^(?:\+46)?(?:7\d{8}|1\d{6,8}|[2-9]\d{6,7})$/;
      break;
    default:
      return false;
  }

  return regex.test(phone);
};
