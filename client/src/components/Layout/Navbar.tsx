'use client';
import Link from 'next/link';
import { AppBar, Toolbar, Container, Button, useTheme, useMediaQuery, Box, Typography } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Hide navbar on lesson pages
    if (pathname?.includes('/dashboard/lessons/')) {
        return null;
    }

    return (
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
                                    onClick={logout}
                                    sx={{ color: '#fff', textTransform: 'none', fontWeight: 600, px: 2 }}
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
    );
}
