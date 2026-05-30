const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
    token?: string;
}

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(status: number, message: string, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...init } = options;

    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...init,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Handle 401 Unauthorized (likely expired/invalid token)
        if (response.status === 401 && token) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Force a hard reload to clear any in-memory state
                window.location.href = '/login';
                // Stop further execution to prevent cascading errors
                return {} as T;
            }
        }
        // NestJS ValidationPipe returns message as array — normalize to string
        const rawMessage = data.message;
        const normalizedMessage = Array.isArray(rawMessage)
            ? rawMessage.join(' • ')
            : rawMessage || 'An error occurred';
        throw new ApiError(response.status, normalizedMessage, data);
    }

    return data as T;
}

export const api = {
    get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'GET', token }),
    post: <T>(endpoint: string, body: any, token?: string) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), token }),
    patch: <T>(endpoint: string, body: any, token?: string) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), token }),
    put: <T>(endpoint: string, body: any, token?: string) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), token }),
    delete: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'DELETE', token }),
};
