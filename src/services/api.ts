// === 📁 src/services/api.ts ===
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@/types/common';
import serverConfig from '@/config/server.json';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: serverConfig.apiBaseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
          // Handle unauthorized
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
  }

  // Auth
  async login(username: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const { data } = await this.client.post('/auth/login', { username, password });
    return data;
  }

  // Receiving
  async getReceivingDocuments(): Promise<ApiResponse<any[]>> {
    const { data } = await this.client.get('/receiving/documents');
    return data;
  }

  async getReceivingDocument(id: string): Promise<ApiResponse<any>> {
    const { data } = await this.client.get(`/receiving/documents/${id}`);
    return data;
  }

  async syncReceiving(documentId: string, items: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/receiving/sync', { documentId, items });
    return data;
  }

  async completeReceiving(documentId: string): Promise<ApiResponse<any>> {
    const { data } = await this.client.post(`/receiving/documents/${documentId}/complete`);
    return data;
  }

  // Placement
  async getPlacementDocuments(): Promise<ApiResponse<any[]>> {
    const { data } = await this.client.get('/placement/documents');
    return data;
  }

  async syncPlacement(documentId: string, items: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/placement/sync', { documentId, items });
    return data;
  }

  // Picking
  async getPickingDocuments(): Promise<ApiResponse<any[]>> {
    const { data } = await this.client.get('/picking/documents');
    return data;
  }

  async syncPicking(documentId: string, items: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/picking/sync', { documentId, items });
    return data;
  }

  // Shipment
  async getShipmentDocuments(): Promise<ApiResponse<any[]>> {
    const { data } = await this.client.get('/shipment/documents');
    return data;
  }

  async syncShipment(documentId: string, items: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/shipment/sync', { documentId, items });
    return data;
  }

  // Return & Write-off
  async syncReturn(documentId: string, data: any): Promise<ApiResponse<any>> {
    const { data: response } = await this.client.post('/return-sync', { documentId, ...data });
    return response;
  }

  async syncWriteoff(documentId: string, data: any): Promise<ApiResponse<any>> {
    const { data: response } = await this.client.post('/writeoff-sync', { documentId, ...data });
    return response;
  }

  // Inventory
  async getInventoryDocuments(): Promise<ApiResponse<any[]>> {
    const { data } = await this.client.get('/inventory/documents');
    return data;
  }

  async syncInventory(documentId: string, items: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/inventory/sync', { documentId, items });
    return data;
  }

  // Barcodes
  async uploadBarcodes(barcodes: any[]): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/barcodes/upload', { barcodes });
    return data;
  }

  // Printing
  async print(labelData: any): Promise<ApiResponse<any>> {
    const { data } = await this.client.post('/print', labelData);
    return data;
  }

  // Check connection
  async ping(): Promise<boolean> {
    try {
      await this.client.get('/ping');
      return true;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();



