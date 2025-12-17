// API Configuration
export const API_BASE_URL = 'http://be-inlab.ns1.sanoh.co.id';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count: number;
  data: T;
}

export interface ProdHeader {
  id: number;
  prod_index: string;
  prod_no: string;
  planning_date: string;
  item: string;
  old_partno: string;
  description: string;
  mat_desc: string;
  customer: string;
  model: string;
  unique_no: string;
  sanoh_code: string;
  snp: number;
  sts: number;
  status: string;
  qty_order: number;
  qty_delivery: number;
  qty_os: number;
  warehouse: string;
  divisi: string;
  created_at: string;
  updated_at: string;
}

export interface PrintableLabel {
  label_id: number;
  lot_no: string;
  customer: string;
  model: string;
  unique_no: string;
  part_no: string;
  description: string;
  date: string;
  qty: number;
  lot_date: string;
  lot_qty: number;
  print_data: string;
}

export interface PrintableLabelsResponse {
  success: boolean;
  message: string;
  count: number;
  prod_header: {
    prod_no: string;
    prod_index: string;
    sts: number;
  };
  data: PrintableLabel[];
}

// Fetch function with error handling and timeout
export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      mode: 'cors', // Enable CORS
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Check for 401 Unauthorized
      if (response.status === 401) {
        // Dispatch custom event to trigger logout
        window.dispatchEvent(new CustomEvent('unauthorized'));
        throw new Error('Unauthorized - Session expired or invalid');
      }

      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Server tidak merespons dalam 30 detik');
      }
      console.error('API fetch error:', error);
      throw error;
    }
    
    throw new Error('Terjadi kesalahan yang tidak diketahui');
  }
}

// Specific API endpoints
export const labelAPI = {
  // Get all prod headers with optional prod_index filter
  getProdHeaders: async (prodIndex?: string): Promise<ApiResponse<ProdHeader[]>> => {
    const queryParam = prodIndex ? `?prod_index=${prodIndex}` : '';
    return fetchAPI<ProdHeader[]>(`/api/labels/prod-headers${queryParam}`);
  },

  // Get printable labels for a specific prod_no
  getPrintableLabels: async (prodNo: string): Promise<PrintableLabelsResponse> => {
    const response = await fetchAPI<any>(`/api/labels/printable?prod_no=${prodNo}`);
    return response as PrintableLabelsResponse;
  },

  // Mark labels as printed
  markPrinted: async (labelIds: number[]): Promise<ApiResponse<any>> => {
    return fetchAPI<any>('/api/labels/mark-printed', {
      method: 'POST',
      body: JSON.stringify({ label_ids: labelIds }),
    });
  },
};
