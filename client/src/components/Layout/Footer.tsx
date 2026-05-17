'use client';
import { Container, Typography, Box, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on lesson pages
    if (pathname?.includes('/dashboard/lessons/')) {
        return null;
    }
    return (
        <Box component="footer" sx={{
            py: 2,
            mt: 'auto',
            bgcolor: 'background.default',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <Container maxWidth="lg">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CodeIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                            C++ Платформа
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                        maxWidth: 700,
                        fontStyle: 'italic',
                        opacity: 0.8
                    }}>
                        З КНУ Інженерія програмного забезпечення ти станеш кращим, почни свій шлях зараз
                    </Typography>
                </Box>
                <Divider sx={{ my: 1.5, opacity: 0.1 }} />
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                    © {new Date().getFullYear()} C++ Платформа. Всі права захищено.
                </Typography>
            </Container>
        </Box>
    );
}
