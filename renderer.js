// Main renderer process script
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const elements = {
    // Navigation
    navButtons: document.querySelectorAll('.nav-button'),
    views: document.querySelectorAll('.view'),
    
    // API Status
    apiStatusIndicator: document.getElementById('api-status-indicator'),
    apiStatusText: document.getElementById('api-status-text'),
    apiInfoContent: document.getElementById('api-info-content'),
    
    // Theme Toggle
    themeToggle: document.getElementById('theme-toggle'),
    
    // Dashboard Elements
    recentPatientsList: document.getElementById('recent-patients-list'),
    quickAssessmentForm: document.getElementById('quick-assessment-form'),
    
    // Assessment Form Elements
    assessmentForm: document.getElementById('assessment-form'),
    assessmentResult: document.getElementById('assessment-result'),
    crispScore: document.getElementById('crisp-score'),
    fuzzyScore: document.getElementById('fuzzy-score'),
    riskCategory: document.getElementById('risk-category'),
    recommendedResponse: document.getElementById('recommended-response'),
    parameterScoresBody: document.getElementById('parameter-scores-body'),
    newAssessmentBtn: document.getElementById('new-assessment-btn'),
    viewHistoryBtn: document.getElementById('view-history-btn'),
    
    // History View Elements
    historyPatientId: document.getElementById('history-patient-id'),
    searchHistoryBtn: document.getElementById('search-history-btn'),
    patientData: document.getElementById('patient-data'),
    noPatientData: document.getElementById('no-patient-data'),
    historyTableBody: document.getElementById('history-table-body'),
    avgScore: document.getElementById('avg-score'),
    maxScore: document.getElementById('max-score'),
    trend: document.getElementById('trend'),
    assessmentCount: document.getElementById('assessment-count'),
    
    // Settings Form Elements
    settingsForm: document.getElementById('settings-form'),
    apiUrl: document.getElementById('api-url'),
    themeSelect: document.getElementById('theme-select'),
    testConnectionBtn: document.getElementById('test-connection-btn'),
    
    // Version Info
    nodeVersion: document.getElementById('node-version'),
    chromeVersion: document.getElementById('chrome-version'),
    electronVersion: document.getElementById('electron-version'),
    
    // About Link
    aboutLink: document.getElementById('about-link'),
    
    // Modal Elements
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    modalClose: document.getElementById('modal-close'),
    modalCancel: document.getElementById('modal-cancel'),
    modalConfirm: document.getElementById('modal-confirm'),
    
    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };
  
  // Current state
  const state = {
    currentView: 'dashboard-view',
    currentTheme: 'light',
    currentPatientId: null,
    apiConnected: false,
    chart: null
  };
  
  // Initialize the application
  async function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Load and apply theme
    await loadTheme();
    
    // Load API URL from settings
    await loadApiUrl();
    
    // Check API connection
    await checkApiConnection();
    
    // Load recent patients
    await loadRecentPatients();
    
    // Display version information
    displayVersionInfo();
    
    // Register IPC listeners
    registerIpcListeners();
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Navigation
    elements.navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const viewId = button.id.replace('nav-', '');
        navigateTo(viewId);
      });
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Quick assessment form
    elements.quickAssessmentForm.addEventListener('submit', handleQuickAssessment);
    
    // Main assessment form
    elements.assessmentForm.addEventListener('submit', handleAssessment);
    
    // New assessment button
    elements.newAssessmentBtn.addEventListener('click', resetAssessmentForm);
    
    // View history button
    elements.viewHistoryBtn.addEventListener('click', () => {
      navigateTo('history');
      if (state.currentPatientId) {
        elements.historyPatientId.value = state.currentPatientId;
        loadPatientHistory(state.currentPatientId);
      }
    });
    
    // Search history button
    elements.searchHistoryBtn.addEventListener('click', () => {
      const patientId = elements.historyPatientId.value.trim();
      if (patientId) {
        loadPatientHistory(patientId);
      } else {
        showToast('Please enter a patient ID', 'error');
      }
    });
    
    // Settings form
    elements.settingsForm.addEventListener('submit', handleSaveSettings);
    
    // Test connection button
    elements.testConnectionBtn.addEventListener('click', testApiConnection);
    
    // About link
    elements.aboutLink.addEventListener('click', showAboutModal);
    
    // Modal close button
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    
    // Theme select
    elements.themeSelect.addEventListener('change', handleThemeChange);
  }
  
  // Navigate to a view
  function navigateTo(viewName) {
    // Map view names to view IDs
    const viewMap = {
      'dashboard': 'dashboard-view',
      'new-assessment': 'assessment-view',
      'history': 'history-view',
      'settings': 'settings-view'
    };
    
    const viewId = viewMap[viewName] || viewName;
    
    // Update navigation buttons
    elements.navButtons.forEach(button => {
      if (button.id === `nav-${viewName}` || button.id === `nav-${viewId.replace('-view', '')}`) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Update views
    elements.views.forEach(view => {
      if (view.id === viewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });
    
    // Update current view
    state.currentView = viewId;
  }
  
  // Load theme from settings
  async function loadTheme() {
    try {
      const theme = await window.api.getTheme();
      state.currentTheme = theme;
      applyTheme(theme);
      elements.themeSelect.value = theme;
    } catch (error) {
      console.error('Error loading theme:', error);
      // Default to light theme
      applyTheme('light');
    }
  }
  
  // Apply theme
  function applyTheme(theme) {
    // Update theme toggle button
    elements.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update current theme
    state.currentTheme = theme;
  }
  
  // Toggle theme
  function toggleTheme() {
    const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    window.api.setTheme(newTheme);
    elements.themeSelect.value = newTheme;
  }
  
  // Handle theme change from settings
  async function handleThemeChange() {
    const theme = elements.themeSelect.value;
    await window.api.setTheme(theme);
    applyTheme(theme);
  }
  
  // Load API URL from settings
  async function loadApiUrl() {
    try {
      const apiUrl = await window.api.getApiUrl();
      elements.apiUrl.value = apiUrl;
    } catch (error) {
      console.error('Error loading API URL:', error);
      showToast('Error loading API URL', 'error');
    }
  }
  
  // Check API connection
  async function checkApiConnection() {
    try {
      updateApiStatus('checking', 'Checking API connection...');
      
      const healthData = await window.api.apiHealthCheck();
      
      updateApiStatus('online', 'API Connected');
      state.apiConnected = true;
      
      // Update API info
      if (elements.apiInfoContent) {
        elements.apiInfoContent.innerHTML = `
          <table class="info-table">
            <tr>
              <td><strong>Status:</strong></td>
              <td>${healthData.status}</td>
            </tr>
            <tr>
              <td><strong>Version:</strong></td>
              <td>${healthData.version}</td>
            </tr>
            <tr>
              <td><strong>Last Check:</strong></td>
              <td>${new Date().toLocaleTimeString()}</td>
            </tr>
          </table>
        `;
      }
      
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      updateApiStatus('offline', 'API Connection Failed');
      state.apiConnected = false;
      
      // Update API info
      if (elements.apiInfoContent) {
        elements.apiInfoContent.innerHTML = `
          <div class="error-message">
            <p>Failed to connect to the API. Please check your connection settings.</p>
            <button id="retry-connection" class="btn btn-primary">Retry Connection</button>
          </div>
        `;
        
        // Add event listener to retry button
        document.getElementById('retry-connection').addEventListener('click', checkApiConnection);
      }
      
      return false;
    }
  }
  
  // Update API status indicator
  function updateApiStatus(status, text) {
    if (elements.apiStatusIndicator) {
      elements.apiStatusIndicator.className = 'status-indicator ' + status;
    }
    
    if (elements.apiStatusText) {
      elements.apiStatusText.textContent = text;
    }
  }
  
  // Test API connection from settings
  async function testApiConnection() {
    const apiUrl = elements.apiUrl.value.trim();
    
    if (!apiUrl) {
      showToast('Please enter an API URL', 'error');
      return;
    }
    
    // Update API URL temporarily
    await window.api.setApiUrl(apiUrl);
    
    // Check connection
    const success = await checkApiConnection();
    
    if (success) {
      showToast('API connection successful', 'success');
    } else {
      showToast('API connection failed', 'error');
    }
  }
  
  // Load recent patients
  async function loadRecentPatients() {
    try {
      const recentPatients = await window.api.getRecentPatients();
      
      if (recentPatients && recentPatients.length > 0) {
        let html = '';
        
        recentPatients.forEach(patientId => {
          html += `
            <div class="patient-item" data-patient-id="${patientId}">
              <div class="patient-id">${patientId}</div>
            </div>
          `;
        });
        
        elements.recentPatientsList.innerHTML = html;
        
        // Add event listeners to patient items
        document.querySelectorAll('.patient-item').forEach(item => {
          item.addEventListener('click', () => {
            const patientId = item.dataset.patientId;
            navigateTo('history');
            elements.historyPatientId.value = patientId;
            loadPatientHistory(patientId);
          });
        });
      } else {
        elements.recentPatientsList.innerHTML = '<p class="empty-message">No recent patients</p>';
      }
    } catch (error) {
      console.error('Error loading recent patients:', error);
      elements.recentPatientsList.innerHTML = '<p class="empty-message">Error loading patients</p>';
    }
  }
  
  // Add a patient to recent patients
  async function addRecentPatient(patientId) {
    try {
      await window.api.addRecentPatient(patientId);
      await loadRecentPatients();
    } catch (error) {
      console.error('Error adding recent patient:', error);
    }
  }
  
  // Handle quick assessment form submission
  async function handleQuickAssessment(event) {
    event.preventDefault();
    
    if (!state.apiConnected) {
      showToast('API is not connected. Please check your connection.', 'error');
      return;
    }
    
    const patientId = document.getElementById('quick-patient-id').value.trim();
    const respiratoryRate = parseInt(document.getElementById('quick-respiratory-rate').value);
    const oxygenSaturation = parseInt(document.getElementById('quick-oxygen-saturation').value);
    const systolicBp = parseInt(document.getElementById('quick-systolic-bp').value);
    const pulse = parseInt(document.getElementById('quick-pulse').value);
    const consciousness = document.getElementById('quick-consciousness').value;
    const temperature = parseFloat(document.getElementById('quick-temperature').value);
    const supplementalOxygen = document.getElementById('quick-supplemental-oxygen').checked;
    
    if (!patientId) {
      showToast('Please enter a patient ID', 'error');
      return;
    }
    
    const vitals = {
      patient_id: patientId,
      respiratory_rate: respiratoryRate,
      oxygen_saturation: oxygenSaturation,
      systolic_bp: systolicBp,
      pulse: pulse,
      consciousness: consciousness,
      temperature: temperature,
      supplemental_oxygen: supplementalOxygen
    };
    
    try {
      const result = await window.api.apiCalculate(vitals);
      
      // Add to recent patients
      await addRecentPatient(patientId);
      
      // Navigate to assessment result
      navigateTo('new-assessment');
      
      // Fill in assessment form
      document.getElementById('patient-id').value = patientId;
      document.getElementById('respiratory-rate').value = respiratoryRate;
      document.getElementById('oxygen-saturation').value = oxygenSaturation;
      document.getElementById('systolic-bp').value = systolicBp;
      document.getElementById('pulse').value = pulse;
      document.getElementById('consciousness').value = consciousness;
      document.getElementById('temperature').value = temperature;
      document.getElementById('supplemental-oxygen').checked = supplementalOxygen;
      
      // Display results
      displayAssessmentResult(result);
      
      // Save current patient ID
      state.currentPatientId = patientId;
      
      // Reset quick assessment form
      elements.quickAssessmentForm.reset();
    } catch (error) {
      console.error('Error calculating assessment:', error);
      showToast('Error calculating assessment', 'error');
    }
  }
  
  // Handle main assessment form submission
  async function handleAssessment(event) {
    event.preventDefault();
    
    if (!state.apiConnected) {
      showToast('API is not connected. Please check your connection.', 'error');
      return;
    }
    
    const patientId = document.getElementById('patient-id').value.trim();
    const respiratoryRate = parseInt(document.getElementById('respiratory-rate').value);
    const oxygenSaturation = parseInt(document.getElementById('oxygen-saturation').value);
    const systolicBp = parseInt(document.getElementById('systolic-bp').value);
    const pulse = parseInt(document.getElementById('pulse').value);
    const consciousness = document.getElementById('consciousness').value;
    const temperature = parseFloat(document.getElementById('temperature').value);
    const supplementalOxygen = document.getElementById('supplemental-oxygen').checked;
    
    if (!patientId) {
      showToast('Please enter a patient ID', 'error');
      return;
    }
    
    const vitals = {
      patient_id: patientId,
      respiratory_rate: respiratoryRate,
      oxygen_saturation: oxygenSaturation,
      systolic_bp: systolicBp,
      pulse: pulse,
      consciousness: consciousness,
      temperature: temperature,
      supplemental_oxygen: supplementalOxygen
    };
    
    try {
      const result = await window.api.apiCalculate(vitals);
      
      // Add to recent patients
      await addRecentPatient(patientId);
      
      // Display results
      displayAssessmentResult(result);
      
      // Save current patient ID
      state.currentPatientId = patientId;
    } catch (error) {
      console.error('Error calculating assessment:', error);
      showToast('Error calculating assessment', 'error');
    }
  }
  
  // Display assessment result
  function displayAssessmentResult(result) {
    // Show result section
    elements.assessmentResult.classList.remove('hidden');
    
    // Set scores
    elements.crispScore.textContent = result.crisp_score;
    elements.fuzzyScore.textContent = result.fuzzy_score.toFixed(1);
    
    // Set risk category with color
    elements.riskCategory.textContent = result.risk_category;
    elements.riskCategory.className = 'score risk-' + result.risk_category;
    
    // Set recommended response
    elements.recommendedResponse.textContent = result.recommended_response;
    
    // Set parameter scores
    let parameterHtml = '';
    
    const vitalValues = {
      respiratory_rate: document.getElementById('respiratory-rate').value,
      oxygen_saturation: document.getElementById('oxygen-saturation').value,
      systolic_bp: document.getElementById('systolic-bp').value,
      pulse: document.getElementById('pulse').value,
      consciousness: document.getElementById('consciousness').value,
      temperature: document.getElementById('temperature').value,
      supplemental_oxygen: document.getElementById('supplemental-oxygen').checked ? 'Yes' : 'No'
    };
    
    // Parameter names for display
    const parameterNames = {
      respiratory_rate: 'Respiratory Rate',
      oxygen_saturation: 'Oxygen Saturation',
      supplemental_oxygen: 'Supplemental Oxygen',
      systolic_bp: 'Systolic BP',
      pulse: 'Pulse',
      consciousness: 'Consciousness',
      temperature: 'Temperature'
    };
    
    // Units for parameters
    const parameterUnits = {
      respiratory_rate: 'breaths/min',
      oxygen_saturation: '%',
      supplemental_oxygen: '',
      systolic_bp: 'mmHg',
      pulse: 'bpm',
      consciousness: '',
      temperature: '°C'
    };
    
    // Map consciousness values
    const consciousnessMap = {
      'A': 'Alert',
      'V': 'Voice',
      'P': 'Pain',
      'U': 'Unresponsive'
    };
    
    for (const [param, score] of Object.entries(result.parameter_scores)) {
      if (param !== 'total') {
        let displayValue = vitalValues[param];
        
        if (param === 'consciousness') {
          displayValue = consciousnessMap[displayValue] || displayValue;
        }
        
        parameterHtml += `
          <tr>
            <td>${parameterNames[param] || param}</td>
            <td>${displayValue} ${parameterUnits[param]}</td>
            <td>${score}</td>
          </tr>
        `;
      }
    }
    
    elements.parameterScoresBody.innerHTML = parameterHtml;
    
    // Scroll to result
    elements.assessmentResult.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Reset assessment form
  function resetAssessmentForm() {
    elements.assessmentForm.reset();
    elements.assessmentResult.classList.add('hidden');
  }
  
  // Load patient history
  async function loadPatientHistory(patientId) {
    try {
      // Show loading state
      elements.patientData.classList.add('hidden');
      elements.noPatientData.textContent = 'Loading patient data...';
      elements.noPatientData.classList.remove('hidden');
      
      // Get history and statistics
      const [history, statistics] = await Promise.all([
        window.api.apiGetHistory(patientId, 20),
        window.api.apiGetStatistics(patientId, 30)
      ]);
      
      // Add to recent patients
      await addRecentPatient(patientId);
      
      // Save current patient ID
      state.currentPatientId = patientId;
      
      // Check if we have data
      if (history.length === 0) {
        elements.noPatientData.textContent = 'No history found for this patient';
        elements.noPatientData.classList.remove('hidden');
        elements.patientData.classList.add('hidden');
        return;
      }
      
      // Update statistics
      elements.avgScore.textContent = statistics.average_crisp_score ? 
        statistics.average_crisp_score.toFixed(1) : '--';
      elements.maxScore.textContent = statistics.max_crisp_score ?? '--';
      elements.trend.textContent = statistics.trend ?? '--';
      elements.assessmentCount.textContent = statistics.assessments_count ?? '--';
      
      // Update history table
      let tableHtml = '';
      
      history.forEach(record => {
        const date = new Date(record.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        tableHtml += `
          <tr>
            <td>${formattedDate}</td>
            <td>${record.crisp_score}</td>
            <td>${record.fuzzy_score.toFixed(1)}</td>
            <td class="risk-${record.risk_category}">${record.risk_category}</td>
            <td>${record.recommended_response}</td>
          </tr>
        `;
      });
      
      elements.historyTableBody.innerHTML = tableHtml;
      
      // Create chart
      createHistoryChart(history);
      
      // Show patient data
      elements.noPatientData.classList.add('hidden');
      elements.patientData.classList.remove('hidden');
    } catch (error) {
      console.error('Error loading patient history:', error);
      elements.noPatientData.textContent = 'Error loading patient data';
      elements.noPatientData.classList.remove('hidden');
      elements.patientData.classList.add('hidden');
      showToast('Error loading patient history', 'error');
    }
  }
  
  // Create history chart
  function createHistoryChart(history) {
    // Reverse history to show oldest first
    const chartData = [...history].reverse();
    
    // Prepare data
    const labels = chartData.map(record => {
      const date = new Date(record.timestamp);
      return date.toLocaleDateString();
    });
    
    const crispScores = chartData.map(record => record.crisp_score);
    const fuzzyScores = chartData.map(record => record.fuzzy_score);
    
    // Get chart context
    const ctx = document.getElementById('history-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (state.chart) {
      state.chart.destroy();
    }
    
    // Create new chart
    state.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Crisp Score',
            data: crispScores,
            borderColor: '#2563eb',
            backgroundColor: '#2563eb',
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
            backgroundColor: '#059669',
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
          y: {
            beginAtZero: true,
            max: Math.max(...crispScores, ...fuzzyScores) + 2
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  }
  
  // Handle save settings
  async function handleSaveSettings(event) {
    event.preventDefault();
    
    const apiUrl = elements.apiUrl.value.trim();
    const theme = elements.themeSelect.value;
    
    try {
      // Save API URL
      await window.api.setApiUrl(apiUrl);
      
      // Save theme
      await window.api.setTheme(theme);
      applyTheme(theme);
      
      // Check API connection
      await checkApiConnection();
      
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings', 'error');
    }
  }
  
  // Display version information
  function displayVersionInfo() {
    if (elements.nodeVersion) {
      elements.nodeVersion.textContent = window.versions.node();
    }
    
    if (elements.chromeVersion) {
      elements.chromeVersion.textContent = window.versions.chrome();
    }
    
    if (elements.electronVersion) {
      elements.electronVersion.textContent = window.versions.electron();
    }
  }
  
  // Register IPC listeners
  function registerIpcListeners() {
    // New assessment event
    window.api.onNewAssessment(() => {
      navigateTo('new-assessment');
      resetAssessmentForm();
    });
    
    // Open settings event
    window.api.onOpenSettings(() => {
      navigateTo('settings');
    });
  }
  
  // Show about modal
  function showAboutModal() {
    showModal(
      'About Fuzzy NEWS-2',
      `
        <div class="about-modal">
          <h3>Fuzzy NEWS-2 Desktop</h3>
          <p class="version">Version 0.1.0</p>
          <p>A desktop application for the Fuzzy NEWS-2 system.</p>
          <p>The National Early Warning Score 2 (NEWS-2) is a standardized system developed by the Royal College of Physicians for assessing acute illness severity.</p>
          <p>This application enhances the traditional NEWS-2 system with fuzzy logic, providing more nuanced risk assessment.</p>
          <hr>
          <p>&copy; 2025</p>
        </div>
      `,
      false
    );
  }
  
  // Show modal
  function showModal(title, content, showActions = true, onConfirm = null) {
    elements.modalTitle.textContent = title;
    elements.modalContent.innerHTML = content;
    
    if (showActions) {
      elements.modalCancel.classList.remove('hidden');
      elements.modalConfirm.classList.remove('hidden');
      
      if (onConfirm) {
        elements.modalConfirm.onclick = () => {
          onConfirm();
          closeModal();
        };
      }
    } else {
      elements.modalCancel.classList.add('hidden');
      elements.modalConfirm.classList.add('hidden');
    }
    
    elements.modalOverlay.classList.remove('hidden');
    elements.modalOverlay.classList.add('visible');
  }
  
  // Close modal
  function closeModal() {
    elements.modalOverlay.classList.remove('visible');
    setTimeout(() => {
      elements.modalOverlay.classList.add('hidden');
    }, 300);
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    // Add to container
    elements.toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      elements.toastContainer.removeChild(toast);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode === elements.toastContainer) {
        elements.toastContainer.removeChild(toast);
      }
    }, 5000);
  }
  
  // Initialize application
  init();
});
