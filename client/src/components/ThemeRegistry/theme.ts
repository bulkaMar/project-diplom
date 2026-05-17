'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            '@media (min-width:600px)': {
                fontSize: '3.5rem',
            },
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
            '@media (min-width:600px)': {
                fontSize: '2.5rem',
            },
        },
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1', // Electric Indigo
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#06b6d4', // Vibrant Cyan
            light: '#22d3ee',
            dark: '#0891b2',
            contrastText: '#ffffff',
        },
        background: {
            default: '#0f172a', // Deep Slate
            paper: '#1e293b', // Slate 800
        },
        text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12,
                },
            },
        },
    },
});

export default theme;
