import { dinero, toDecimal } from 'dinero.js';

/**
 * Formats a numeric value as a currency string based on the provided currency code.
 *
 * @param {TransformerOptions<number, string>} options - The transformer options.
 * @param {number} options.value - The numeric value to format.
 * @param {string} options.currency - The currency code.
 * @returns {string} The formatted currency string.
 */
// function transformer({ value, currency }: TransformerOptions<number, string>) {
//   const locale = currency.code === 'SEK' ? 'sv-SE' : currency.code === 'NOK' ? 'nb-NO' : 'fi-FI';

//   // For EUR, only show decimals if they're not .00
//   const numericValue = Number(value);
//   const hasNonZeroDecimals = currency.code === 'EUR' && (numericValue * 100) % 100 !== 0;

//   const options =
//     currency.code === 'EUR'
//       ? {
//           minimumFractionDigits: hasNonZeroDecimals ? 2 : 0,
//           maximumFractionDigits: hasNonZeroDecimals ? 2 : 0,
//         }
//       : { minimumFractionDigits: 0, maximumFractionDigits: 0 };

//   return numericValue.toLocaleString(locale, {
//     style: 'currency',
//     currency: currency.code,
//     ...options,
//   });
// }

/**
 * Formats a numeric amount as a currency string based on the provided currency code and locale.
 *
 * @param {number} amount - The numeric amount to format.
 * @param {string} currencyCode - The currency code.
 * @param {string} locale - The locale for formatting (e.g., 'se', 'no', 'fi', 'en').
 * @returns {string} The formatted currency string.
 */
export const getAmount = (amount: number, currencyCode: string, _locale: string = 'en') => {
  try {
    const money = dinero({
      amount: Math.round(amount),
      currency: {
        code: currencyCode,
        base: 10,
        exponent: 2,
      },
    });

    // Format all currencies to show amount followed by currency code
    const numericValue = Number(toDecimal(money));

    // Determine the appropriate locale for number formatting
    let numberLocale = 'en-US';
    if (currencyCode === 'SEK') {
      numberLocale = 'sv-SE';
    } else if (currencyCode === 'NOK') {
      numberLocale = 'nb-NO';
    } else if (currencyCode === 'EUR') {
      numberLocale = 'fi-FI';
    }

    const formattedNumber = new Intl.NumberFormat(numberLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);

    // Return formatted as "amount currency" (e.g., "690 USD", "690 EUR", "690 SEK")
    return `${formattedNumber} ${currencyCode}`;

    // return toDecimal(money, transformer);
  } catch {
    return '—';
  }
};
