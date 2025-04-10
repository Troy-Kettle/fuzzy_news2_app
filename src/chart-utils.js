/**
 * Chart utilities for the Fuzzy NEWS-2 Electron app
 * 
 * This module provides helper functions for creating and managing Chart.js charts.
 * It requires Chart.js to be included in the application.
 */

/**
 * Create a line chart for patient vital signs history
 * 
 * @param {string} chartId - ID of the canvas element
 * @param {Array} data - Array of data points
 * @param {string} valueKey - Key for the value in each data point
 * @param {string} labelKey - Key for the label in each data point (timestamp)
 * @param {Object} options - Additional options
 * @returns {Object} Chart instance
 */
function createVitalsLineChart(chartId, data, valueKey, labelKey, options = {}) {
  const ctx = document.getElementById(chartId).getContext('2d');
  
  const {
    label = 'Value',
    borderColor = '#2563eb',
    backgroundColor = 'rgba(37, 99, 235, 0.1)',
    fillArea = true,
    showPoints = true,
    yAxisMin = null,
    yAxisMax = null,
    isDarkTheme = false
  } = options;
  
  // Format timestamps
  const labels = data.map(item => {
    const date = new Date(item[labelKey]);
    return date.toLocaleDateString();
  });
  
  // Extract values
  const values = data.map(item => item[valueKey]);
  
  // Determine min/max
  const min = yAxisMin !== null ? yAxisMin : Math.min(...values) - 1;
  const max = yAxisMax !== null ? yAxisMax : Math.max(...values) + 1;
  
  // Text color based on theme
  const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: showPoints ? 3 : 0,
        pointHoverRadius: 5,
        fill: fillArea
      }]
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
          min: min,
          max: max,
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
  });
}

/**
 * Create a multi-line chart comparing multiple values
 * 
 * @param {string} chartId - ID of the canvas element
 * @param {Array} data - Array of data points
 * @param {Array} series - Array of series configurations
 * @param {string} labelKey - Key for the label in each data point (timestamp)
 * @param {Object} options - Additional options
 * @returns {Object} Chart instance
 */
function createMultiLineChart(chartId, data, series, labelKey, options = {}) {
  const ctx = document.getElementById(chartId).getContext('2d');
  
  const {
    yAxisMin = null,
    yAxisMax = null,
    isDarkTheme = false
  } = options;
  
  // Format timestamps
  const labels = data.map(item => {
    const date = new Date(item[labelKey]);
    return date.toLocaleDateString();
  });
  
  // Process each series
  const datasets = series.map(s => {
    return {
      label: s.label,
      data: data.map(item => item[s.valueKey]),
      borderColor: s.borderColor,
      backgroundColor: s.backgroundColor,
      tension: 0.1,
      borderWidth: 2,
      pointRadius: s.showPoints ? 3 : 0,
      pointHoverRadius: 5,
      fill: s.fillArea
    };
  });
  
  // Calculate overall min/max if not provided
  let min = yAxisMin;
  let max = yAxisMax;
  
  if (min === null || max === null) {
    const allValues = datasets.flatMap(dataset => dataset.data);
    min = min !== null ? min : Math.min(...allValues) - 1;
    max = max !== null ? max : Math.max(...allValues) + 1;
  }
  
  // Text color based on theme
  const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
  
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
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
          min: min,
          max: max,
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
  });
}

/**
 * Create a bar chart for NEWS-2 parameter scores
 * 
 * @param {string} chartId - ID of the canvas element
 * @param {Object} parameterScores - Parameter scores object
 * @param {Object} options - Additional options
 * @returns {Object} Chart instance
 */
function createParameterScoresChart(chartId, parameterScores, options = {}) {
  const ctx = document.getElementById(chartId).getContext('2d');
  
  const {
    isDarkTheme = false
  } = options;
  
  // Extract parameters and scores (excluding total)
  const parameters = [];
  const scores = [];
  
  for (const [param, score] of Object.entries(parameterScores)) {
    if (param !== 'total') {
      // Format parameter name
      const formattedParam = param
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      
      parameters.push(formattedParam);
      scores.push(score);
    }
  }
  
  // Parameter colors based on scores
  const colors = scores.map(score => {
    if (score === 0) return '#10b981'; // Green for 0
    if (score === 1) return '#f59e0b'; // Yellow for 1
    if (score === 2) return '#f97316'; // Orange for 2
    if (score === 3) return '#ef4444'; // Red for 3
    return '#3b82f6'; // Blue default
  });
  
  // Text color based on theme
  const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: parameters,
      datasets: [{
        label: 'Parameter Score',
        data: scores,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1
      }]
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
          max: 3,
          ticks: {
            stepSize: 1,
            color: textColor
          },
          grid: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(context) {
              return `Score: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

/**
 * Update chart with new data
 * 
 * @param {Object} chart - Chart instance
 * @param {Array} data - New data array
 * @param {string} valueKey - Key for the value in each data point
 * @param {string} labelKey - Key for the label in each data point
 */
function updateChart(chart, data, valueKey, labelKey) {
  // Format timestamps
  const labels = data.map(item => {
    const date = new Date(item[labelKey]);
    return date.toLocaleDateString();
  });
  
  // Extract values
  const values = data.map(item => item[valueKey]);
  
  // Update chart data
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  
  // Update y-axis scale
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  
  chart.options.scales.y.min = min;
  chart.options.scales.y.max = max;
  
  // Update chart
  chart.update();
}

/**
 * Apply theme to all charts
 * 
 * @param {Array} charts - Array of chart instances
 * @param {boolean} isDarkTheme - Whether dark theme is active
 */
function applyThemeToCharts(charts, isDarkTheme) {
  const textColor = isDarkTheme ? '#f9fafb' : '#1f2937';
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  charts.forEach(chart => {
    if (!chart) return;
    
    // Update grid lines
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
    
    // Update text colors
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    
    if (chart.options.plugins.legend.labels) {
      chart.options.plugins.legend.labels.color = textColor;
    }
    
    // Update chart
    chart.update();
  });
}

module.exports = {
  createVitalsLineChart,
  createMultiLineChart,
  createParameterScoresChart,
  updateChart,
  applyThemeToCharts
};
