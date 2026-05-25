import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the JWT token if available
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('drista_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const eventService = {
    // Verify if the event code exists and is active on the backend
    verifyEventCode: async (shortCode: string) => {
        const response = await apiClient.get(`/public/events/register/${shortCode}`);
        return response.data;
    },
    
    // Upload image to scan card
    scanCard: async (shortCode: string, imageBlob: Blob) => {
        const formData = new FormData();
        formData.append('file', imageBlob, 'business_card.jpg');
        const response = await apiClient.post(`/public/events/register/${shortCode}/scan-card`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    // Confirm the details and create registration
    confirmCard: async (shortCode: string, payload: any) => {
        const response = await apiClient.post(`/public/events/register/${shortCode}/confirm-card`, payload);
        return response.data;
    },

    // Plain registration (manual entry fallback)
    register: async (shortCode: string, payload: any) => {
        const response = await apiClient.post(`/public/events/register/${shortCode}`, payload);
        return response.data;
    },

    getDashboardMetrics: async (shortCode: string, date?: string) => {
        const params: any = {};
        if (date) params.date = date;
        const response = await apiClient.get(`/public/events/register/${shortCode}/dashboard`, { params });
        return response.data;
    },
    
    getVisitors: async (shortCode: string, search?: string, page?: number, limit?: number) => {
        const params: any = {};
        if (search) params.search = search;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        const response = await apiClient.get(`/public/events/register/${shortCode}/visitors`, { params });
        return response.data;
    },

    getVolunteers: async (shortCode: string) => {
        const response = await apiClient.get(`/public/events/register/${shortCode}/volunteers`);
        return response.data;
    },

    getAnalytics: async (shortCode: string) => {
        const response = await apiClient.get(`/public/events/register/${shortCode}/analytics`);
        return response.data;
    },

    toggleCheckIn: async (registrationId: string) => {
        const response = await apiClient.patch(`/public/events/registrations/${registrationId}/check-in`);
        return response.data;
    },

    // Admin Login using the core platform's auth
    adminLogin: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    }
};
