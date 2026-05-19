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
    // We will verify the event code first
    verifyEventCode: async (shortCode: string) => {
        // Here we could hit a public endpoint to verify if the event code exists
        // E.g. GET /public/events/:shortCode
        // For now, we will just simulate success if they hit 'confirm' in the UI
        return { success: true, shortCode };
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

    getDashboardMetrics: async (shortCode: string) => {
        const response = await apiClient.get(`/public/events/register/${shortCode}/dashboard`);
        return response.data;
    },

    // Admin Login using the core platform's auth
    adminLogin: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    }
};
