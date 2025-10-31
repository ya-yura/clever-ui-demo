// === 📁 src/services/api.ts ===
// API service for server communication

import axios, { AxiosInstance, AxiosError } from 'axios';
import { configService } from './configService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Update baseURL dynamically
    this.updateBaseURL();

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - trigger logout
          console.warn('⚠️ Unauthorized (401) - clearing auth');
          this.clearToken();
          
          // Trigger logout event for AuthContext
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Update baseURL from config
   */
  updateBaseURL() {
    try {
      if (configService.isConfigured()) {
        const serverUrl = configService.getServerUrl();
        this.client.defaults.baseURL = `${serverUrl}/MobileSMARTS/api/v1`;
        console.log('✅ API baseURL updated:', this.client.defaults.baseURL);
      }
    } catch (error) {
      console.warn('⚠️ Failed to update API baseURL:', error);
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get current baseURL
   */
  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Require authentication before making request
   */
  private requireAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required');
    }
  }

  // Generic request methods
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      this.updateBaseURL(); // Ensure baseURL is current
      const response = await this.client.get(url, { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Module-specific endpoints
  // Receiving
  async getReceivingDocument(id: string) {
    return this.get(`/receiving/${id}`);
  }

  async syncReceiving(data: any) {
    return this.post('/receiving/sync', data);
  }

  // Placement
  async getPlacementDocument(id: string) {
    return this.get(`/placement/${id}`);
  }

  async syncPlacement(data: any) {
    return this.post('/placement/sync', data);
  }

  // Picking
  async getPickingDocument(id: string) {
    return this.get(`/picking/${id}`);
  }

  async syncPicking(data: any) {
    return this.post('/picking/sync', data);
  }

  // Shipment
  async getShipmentDocument(id: string) {
    return this.get(`/shipment/${id}`);
  }

  async syncShipment(data: any) {
    return this.post('/shipment/sync', data);
  }

  // Return
  async syncReturn(data: any) {
    return this.post('/return/sync', data);
  }

  async syncWriteoff(data: any) {
    return this.post('/writeoff/sync', data);
  }

  // Inventory
  async getInventoryDocument(id: string) {
    return this.get(`/inventory/${id}`);
  }

  async syncInventory(data: any) {
    return this.post('/inventory/sync', data);
  }

  // Barcode collector
  async uploadBarcodes(barcodes: string[]) {
    return this.post('/barcodes/upload', { barcodes });
  }

  // Label printing
  async print(data: any) {
    return this.post('/print', data);
  }

  async getTemplates() {
    return this.get('/templates');
  }

  // ============================================================
  // OData API Methods (Cleverence Mobile SMARTS)
  // ============================================================

  /**
   * Get all document types
   * GET /api/v1/DocTypes
   */
  async getDocTypes() {
    return this.get('/DocTypes');
  }

  /**
   * Get documents by type
   * GET /api/v1/Docs/{DocType.uni}/
   * @param docTypeUni - Document type unique identifier
   */
  async getDocsByType(docTypeUni: string) {
    return this.get(`/Docs/${docTypeUni}`);
  }

  /**
   * Get single document by ID
   * GET /api/v1/Docs/{docId}
   */
  async getDocById(docId: string) {
    return this.get(`/Docs/${docId}`);
  }

  /**
   * Get products
   * GET /api/v1/Products
   */
  async getProducts(params?: any) {
    return this.get('/Products', params);
  }

  /**
   * Get cells (storage locations)
   * GET /api/v1/Cells
   */
  async getCells(params?: any) {
    return this.get('/Cells', params);
  }
}

export const api = new ApiService();
