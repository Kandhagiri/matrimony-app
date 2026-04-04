/**
 * Data sanitization utilities to prevent IPC cloning errors
 * Ensures all data is serializable before sending via IPC
 */

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Check if an object is serializable
 * @param {any} obj - Object to check
 * @returns {boolean} True if serializable
 */
function isSerializable(obj) {
  if (obj === null || typeof obj !== 'object') {
    return true;
  }

  if (obj instanceof Date) {
    return true;
  }

  if (obj instanceof Array) {
    return obj.every(item => isSerializable(item));
  }

  if (typeof obj === 'object') {
    return Object.values(obj).every(value => isSerializable(value));
  }

  return true;
}

/**
 * Sanitize photos array
 * @param {Array} photos - Array of photo objects
 * @returns {Array} Sanitized photos array
 */
function sanitizePhotosArray(photos) {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos.map(photo => {
    if (typeof photo === 'object' && photo !== null) {
      return {
        id: String(photo.id || ''),
        data: String(photo.data || ''),
        name: String(photo.name || ''),
        size: Number(photo.size) || 0,
      };
    }
    return photo;
  });
}

/**
 * Sanitize horoscope data
 * @param {Object} horoscope - Horoscope object
 * @returns {Object} Sanitized horoscope object
 */
function sanitizeHoroscopeData(horoscope) {
  if (!horoscope || typeof horoscope !== 'object') {
    return {};
  }

  const sanitized = {
    rasi: String(horoscope.rasi || ''),
    natchathiram: String(horoscope.natchathiram || ''),
    patham: String(horoscope.patham || ''),
    birthDate: String(horoscope.birthDate || ''),
    birthTime: String(horoscope.birthTime || ''),
    disai: String(horoscope.disai || ''),
    iruppu: String(horoscope.iruppu || ''),
    grahas: Array.isArray(horoscope.grahas) ? horoscope.grahas.map(g => Array.isArray(g) ? [...g] : []) : [],
  };

  return sanitized;
}

/**
 * Sanitize profile data before sending via IPC
 * @param {Object} formData - Form data object
 * @returns {Object} Sanitized profile data
 */
export function sanitizeProfileData(formData) {
  if (!formData || typeof formData !== 'object') {
    return {};
  }

  const sanitized = {
    Name: String(formData.Name || ''),
    DateOfBirth: String(formData.DateOfBirth || ''),
    Gender: String(formData.Gender || ''),
    SkinComplexion: String(formData.SkinComplexion || ''),
    Widower: Boolean(formData.Widower || false),
    Divorcee: Boolean(formData.Divorcee || false),
    Height: String(formData.Height || ''),
    FatherName: String(formData.FatherName || ''),
    MotherName: String(formData.MotherName || ''),
    Education: String(formData.Education || ''),
    EducationDetails: String(formData.EducationDetails || ''),
    Occupation: String(formData.Occupation || ''),
    OccupationDetails: String(formData.OccupationDetails || ''),
    Salary: String(formData.Salary || ''),
    Address: String(formData.Address || ''),
    ContactNumber: String(formData.ContactNumber || ''),
    Photos: sanitizePhotosArray(formData.Photos),
    Horoscope: sanitizeHoroscopeData(formData.Horoscope),
  };

  return sanitized;
}

export { deepClone, isSerializable, sanitizePhotosArray, sanitizeHoroscopeData };



