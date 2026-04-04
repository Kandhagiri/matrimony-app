/**
 * Date utility functions for converting between display format (dd/mm/yyyy) and storage format (yyyy-mm-dd)
 */

/**
 * Convert date from display format (dd/mm/yyyy) to storage format (yyyy-mm-dd)
 * @param {string} displayDate - Date in dd/mm/yyyy format
 * @returns {string} Date in yyyy-mm-dd format
 */
export function formatDateForStorage(displayDate) {
  if (!displayDate || displayDate.trim() === '') {
    return '';
  }

  // Already in storage format
  if (displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return displayDate;
  }

  // Convert from dd/mm/yyyy
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  return displayDate;
}

/**
 * Convert date from storage format (yyyy-mm-dd) to display format (dd/mm/yyyy)
 * @param {string} storageDate - Date in yyyy-mm-dd format
 * @returns {string} Date in dd/mm/yyyy format
 */
export function formatDateForDisplay(storageDate) {
  if (!storageDate || storageDate.trim() === '') {
    return '';
  }

  // Already in display format
  if (storageDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return storageDate;
  }

  // Convert from yyyy-mm-dd
  const parts = storageDate.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }

  return storageDate;
}

/**
 * Validate date in dd/mm/yyyy format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidDate(dateString) {
  if (!dateString || dateString.trim() === '') {
    return true; // Empty is allowed
  }

  // Check format
  if (!dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    return false;
  }

  const parts = dateString.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validate ranges
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  // Check if date is valid
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Format date input as user types (adds slashes automatically)
 * @param {string} value - Current input value
 * @returns {string} Formatted date string
 */
export function formatDateInput(value) {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
}

/**
 * Calculate age from date of birth
 * @param {string} dateOfBirth - Date in yyyy-mm-dd format
 * @returns {number} Age in years
 */
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}



