'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './callback.module.css';
import { useT } from '@/lib/i18n';

function AuthCallbackContent() {
    const tr = useT();
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
            <p className={styles.text}>{tr('Авторизація через Google...', 'Signing in with Google...')}</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    const tr = useT();
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loader}></div>
                <p className={styles.text}>{tr('Завантаження...', 'Loading...')}</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}

