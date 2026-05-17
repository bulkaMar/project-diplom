'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './callback.module.css';

function AuthCallbackContent() {
    const { completeSocialLogin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return;
        
        const token = searchParams.get('token');
        if (token) {
            hasCalled.current = true;
            completeSocialLogin(token);
        } else {
            router.push('/login?error=no_token');
        }
    }, [searchParams, completeSocialLogin, router]);

    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
            <p className={styles.text}>Авторизація через Google...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loader}></div>
                <p className={styles.text}>Завантаження...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}

