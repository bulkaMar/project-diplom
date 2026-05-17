'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import DifficultyTabs from './DifficultyTabs';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ModuleContentProps {
    moduleId: string;
}

export default function ModuleContent({ moduleId }: ModuleContentProps) {
    const { token, isLoading: authLoading } = useAuth();
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            if (authLoading || !token) return;
            try {
                const response = await axios.get(`${API_URL}/lessons/module/${moduleId}/difficulty-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatusData(response.data);
            } catch (err) {
                console.error('Failed to load difficulty status:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [moduleId, token, authLoading]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error || !statusData) {
        return (
            <Typography color="error" variant="body2" sx={{ p: 2 }}>
                Не вдалося завантажити уроки модуля.
            </Typography>
        );
    }

    return (
        <Box sx={{ p: 0 }}>
            <DifficultyTabs data={statusData} />
        </Box>
    );
}
