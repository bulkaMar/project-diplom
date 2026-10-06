'use client';
import { Container, Typography, Box } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n';

export default function Footer() {
    const pathname = usePathname();
    const en = useLang((s) => s.lang) === 'en';

    // Hide footer on lesson pages
    if (pathname?.includes('/dashboard/lessons/')) {
        return null;
    }
    return (
        <Box component="footer" sx={{
            py: 4,
            mt: 'auto',
            bgcolor: '#050a18',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
            <Container maxWidth="lg">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: { xs: 'center', md: 'left' },
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 30, height: 30, borderRadius: '9px',
                            display: 'grid', placeItems: 'center',
                            background: 'linear-gradient(135deg, #3b6bff 0%, #8b3dff 100%)'
                        }}>
                            <CodeIcon sx={{ fontSize: 18, color: '#fff' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                                {en ? 'C++ Platform' : 'C++ Платформа'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6b7699' }}>
                                {en
                                    ? 'Software Engineering at KNU will make you better'
                                    : 'З КНУ Інженерія програмного забезпечення ти станеш кращим'}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#6b7699' }}>
                        © {new Date().getFullYear()} {en ? 'C++ Platform' : 'C++ Платформа'} · Next.js · NestJS · PostgreSQL
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
