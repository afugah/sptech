export const isFutureDate = (releaseDate?: string): boolean => {
  if (!releaseDate) {
    return false; // Treat undefined or empty as not a future date
  }

  // Parse the string into a Date object
  const parsedDate = new Date(releaseDate);

  // Validate if parsedDate is a valid Date object
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date string');
  }

  const currentDate = new Date(); // Get the current date

  // currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight
  // parsedDate.setHours(0, 0, 0, 0); // Normalize parsed date to midnight

  return parsedDate > currentDate; // Compare dates
};
