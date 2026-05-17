'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name?: string;
    role: 'APPLICANT' | 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    completeSocialLogin: (token: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    
                    // Optional: Proactively verify session
                    await api.get('/auth/profile', storedToken);
                } catch (err) {
                    console.error('Invalid session or token expired', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        
        initializeAuth();
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post<{ access_token: string, user: User }>('/auth/login', credentials);
        const { access_token } = response;

        // For now, we'll decode the token or fetch profile. 
        // Since the login response currently only returns access_token in our NestJS implementation,
        // we should update NestJS or fetch profile immediately.
        // simpler: fetch profile.

        localStorage.setItem('token', access_token);
        setToken(access_token);

        // Fetch user profile
        const profile = await api.get<User>('/auth/profile', access_token);
        localStorage.setItem('user', JSON.stringify(profile));
        setUser(profile);

        router.push('/dashboard'); // or redirect to home
    };

    const register = async (details: any) => {
        // Register usually returns the created user (without token) or token. 
        // consistently, we'll auto-login or ask to login.
        // Let's assume auto-login for UX.
        await api.post('/auth/register', details);

        // Auto login
        await login({ email: details.email, password: details.password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const completeSocialLogin = async (accessToken: string) => {
        setIsLoading(true);
        try {
            localStorage.setItem('token', accessToken);
            setToken(accessToken);

            // Fetch user profile
            const profile = await api.get<User>('/auth/profile', accessToken);
            localStorage.setItem('user', JSON.stringify(profile));
            setUser(profile);

            router.push('/dashboard');
        } catch (err) {
            console.error('Social login completion failed', err);
            router.push('/login?error=social_failed');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        const storedToken = localStorage.getItem('token') || token;
        if (!storedToken) return;

        try {
            const profile = await api.get<User>('/auth/profile', storedToken);
            localStorage.setItem('user', JSON.stringify(profile));
            setUser(profile);
        } catch (err) {
            console.error('Failed to refresh profile', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, completeSocialLogin, refreshProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
