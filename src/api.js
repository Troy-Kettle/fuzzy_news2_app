/**
 * API Module for communication with the Fuzzy NEWS-2 API
 * 
 * This module provides functions for interacting with the API.
 * It's not used directly in the renderer process, as API calls
 * are proxied through the main process for security reasons.
 */

const axios = require('axios');

class API {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000
    });
  }

  /**
   * Set the base URL for API requests
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    this.client = axios.create({
      baseURL: url,
      timeout: 10000
    });
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Calculate NEWS-2 score
   */
  async calculateScore(vitals) {
    try {
      const response = await this.client.post('/api/calculate', vitals);
      return response.data;
    } catch (error) {
      console.error('Calculate score failed:', error);
      throw new Error(`Calculate score failed: ${error.message}`);
    }
  }

  /**
   * Get patient history
   */
  async getPatientHistory(patientId, limit = 10) {
    try {
      const response = await this.client.get(`/api/history/${patientId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get patient history failed:', error);
      throw new Error(`Get patient history failed: ${error.message}`);
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStatistics(patientId, days = 7) {
    try {
      const response = await this.client.get(`/api/statistics/${patientId}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Get patient statistics failed:', error);
      throw new Error(`Get patient statistics failed: ${error.message}`);
    }
  }
}

module.exports = API;
