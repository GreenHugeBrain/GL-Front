// utils/api.js
const API_BASE_URL = 'http://5.83.153.81:25608';

/**
 * Fetches professionals from the API with error handling
 * @returns {Promise<Array>} Array of professionals or empty array on error
 */
export const fetchProfessionals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/professional_network`, {
      cache: 'no-store', // Disable caching for fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return [];
  }
};

/**
 * Filters professionals based on search term
 * @param {Array} professionals - Array of professional objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered array of professionals
 */
export const filterProfessionals = (professionals, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return professionals;
  }

  const term = searchTerm.toLowerCase().trim();
  
  return professionals.filter(person => {
    const name = person.name?.toLowerCase() || '';
    const role = person.role?.toLowerCase() || '';
    const job = person.job?.toLowerCase() || '';
    
    return name.includes(term) || role.includes(term) || job.includes(term);
  });
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};