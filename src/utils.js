/**
 * Utility functions for the Fuzzy NEWS-2 Electron app
 */

/**
 * Format a date for display
 * 
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = true) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const dateStr = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  if (!includeTime) return dateStr;
  
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${dateStr} ${timeStr}`;
}

/**
 * Truncate a string to a certain length
 * 
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated string
 */
function truncateString(str, maxLength = 50, suffix = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format a number with commas for thousands
 * 
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Validate a patient ID
 * 
 * @param {string} patientId - Patient ID to validate
 * @returns {boolean} Whether the patient ID is valid
 */
function validatePatientId(patientId) {
  if (!patientId) return false;
  
  // Patient ID must be at least 3 characters
  if (patientId.length < 3) return false;
  
  // Patient ID can only contain letters, numbers, hyphens, and underscores
  return /^[A-Za-z0-9\-_]+$/.test(patientId);
}

/**
 * Get color for risk category
 * 
 * @param {string} riskCategory - Risk category
 * @returns {string} CSS color variable
 */
function getRiskColor(riskCategory) {
  switch (riskCategory) {
    case 'Low':
      return 'var(--low-risk)';
    case 'Low-Medium':
      return 'var(--low-medium-risk)';
    case 'Medium':
      return 'var(--medium-risk)';
    case 'High':
      return 'var(--high-risk)';
    default:
      return 'var(--text-color)';
  }
}

/**
 * Generate chart configuration for patient history
 * 
 * @param {Array} history - Patient history data
 * @param {boolean} isDarkTheme - Whether dark theme is active
 * @returns {Object} Chart.js configuration
 */
function generateHistoryChartConfig(history, isDarkTheme) {
  // Reverse history to show oldest first
  const chartData = [...history].reverse();
  
  // Prepare data
  const labels = chartData.map(record => {
    const date = new Date(record.timestamp);
    return date.toLocaleDateString();
  });
  
  const crispScores = chartData.map(record => record.crisp_score);
  const fuzzyScores = chartData.map(record => record.fuzzy_score);
  
  // Text color based on theme
  const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
  
  return {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Crisp Score',
          data: crispScores,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false
        },
        {
          label: 'Fuzzy Score',
          data: fuzzyScores,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: textColor
          }
        },
        y: {
          beginAtZero: true,
          max: Math.max(...crispScores, ...fuzzyScores) + 2,
          grid: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: textColor
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  };
}

/**
 * Get system theme preference
 * 
 * @returns {string} 'dark' or 'light'
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

module.exports = {
  formatDate,
  truncateString,
  formatNumber,
  validatePatientId,
  getRiskColor,
  generateHistoryChartConfig,
  getSystemTheme
};
