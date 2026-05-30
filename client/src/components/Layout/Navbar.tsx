'use client';
import Link from 'next/link';
import { AppBar, Toolbar, Container, Button, useTheme, useMediaQuery, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Hide navbar on lesson pages
    if (pathname?.includes('/dashboard/lessons/')) {
        return null;
    }

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    top: 0,
                    zIndex: 1100,
                    bgcolor: '#020617',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: 'none'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                        {/* Logo */}
                        <Link 
                            href={
                                !user ? "/" : 
                                user.role === 'ADMIN' ? "/dashboard/admin" : 
                                user.role === 'TEACHER' ? "/dashboard/editor" : 
                                "/dashboard"
                            } 
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CodeIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: -0.5 }}>
                                    C++ Платформа
                                </Typography>
                            </Box>
                        </Link>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', gap: 4, ml: 8, flexGrow: 1 }}>
                                {/* Navigation links removed by user request */}
                            </Box>
                        )}

                        {/* Auth Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {user ? (
                                <>
                                    {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                                        <Button
                                            component={Link}
                                            href={user.role === 'ADMIN' ? "/dashboard/admin" : "/dashboard/editor"}
                                            sx={{ 
                                                color: '#fbbf24', 
                                                textTransform: 'none', 
                                                fontWeight: 800, 
                                                px: 2,
                                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.1)' }
                                            }}
                                        >
                                            {user.role === 'ADMIN' ? 'Адмін-панель' : 'Редактор'}
                                        </Button>
                                    )}
                                    <Button
                                        component={Link}
                                        href="/dashboard/profile"
                                        sx={{ 
                                            color: '#fff', 
                                            textTransform: 'none', 
                                            fontWeight: 600, 
                                            px: 2,
                                            '&:hover': { color: '#3b82f6' }
                                        }}
                                    >
                                        Профіль
                                    </Button>
                                    <Button
                                        onClick={() => setShowLogoutModal(true)}
                                        startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                                        sx={{ 
                                            color: '#94a3b8', 
                                            textTransform: 'none', 
                                            fontWeight: 600, 
                                            px: 2,
                                            borderRadius: 2,
                                            '&:hover': { 
                                                color: '#f87171',
                                                bgcolor: 'rgba(248, 113, 113, 0.08)'
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Вийти
                                    </Button>
                                    {user.role !== 'ADMIN' && user.role !== 'TEACHER' && (
                                        <Button
                                            component={Link}
                                            href="/dashboard"
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#4f46e5',
                                                color: '#fff',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                borderRadius: 2.5,
                                                px: 3,
                                                '&:hover': { bgcolor: '#4338ca' }
                                            }}
                                        >
                                            Моя дошка
                                        </Button>
                                    )}
                                </>
                            ) : (
                                // Only show login/register in header if NOT on home page
                                pathname !== '/' && (
                                    <>
                                        <Button
                                            component={Link}
                                            href="/login"
                                            sx={{ color: '#fff', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Увійти
                                        </Button>
                                        <Button
                                            component={Link}
                                            href="/register"
                                            variant="contained"
                                            sx={{
                                                bgcolor: '#3b82f6',
                                                borderRadius: 2.5,
                                                textTransform: 'none',
                                                fontWeight: 700
                                            }}
                                        >
                                            Реєстрація
                                        </Button>
                                    </>
                                )
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Logout Confirmation Modal */}
            <Dialog
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 3,
                        minWidth: 340,
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(248,113,113,0.1)',
                            border: '1px solid rgba(248,113,113,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <LogoutIcon sx={{ color: '#f87171', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' }}>
                            Вийти з акаунту?
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pb: 1 }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Ви впевнені, що хочете вийти? Ваш прогрес збережено і ви зможете увійти знову у будь-який час.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                    <Button
                        onClick={() => setShowLogoutModal(false)}
                        fullWidth
                        sx={{
                            color: '#94a3b8',
                            bgcolor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.2,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                        }}
                    >
                        Ні, залишитись
                    </Button>
                    <Button
                        onClick={() => { setShowLogoutModal(false); logout(); }}
                        fullWidth
                        sx={{
                            bgcolor: '#ef4444',
                            color: '#fff',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            py: 1.2,
                            '&:hover': { bgcolor: '#dc2626' }
                        }}
                    >
                        Так, вийти
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
