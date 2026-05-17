import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import CodeIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface TheoryViewProps {
    lesson: any;
    onComplete: () => void;
}

// ─── Type Cards (int, double, char etc.) ───
const TypeCardsBlock = ({ raw }: { raw: string }) => {
    const cards = raw.trim().split('\n').filter(Boolean).map(line => {
        const lastPipe = line.lastIndexOf('|');
        if (lastPipe === -1) return { name: line.trim(), desc: '' };
        const name = line.substring(0, lastPipe);
        const desc = line.substring(lastPipe + 1);
        return { name: name.trim(), desc: desc.trim() };
    });
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, my: 4 }}>
            {cards.map((card, i) => (
                <Box key={i} sx={{
                    p: 3, borderRadius: 3,
                    bgcolor: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(30,41,59,1)',
                    transition: 'border-color 0.2s',
                    '&:hover': { borderColor: 'rgba(59,130,246,0.3)' }
                }}>
                    <Typography sx={{
                        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                        color: '#3b82f6', fontWeight: 900, fontSize: '1.3rem', mb: 1,
                        transition: 'transform 0.2s', transformOrigin: 'left',
                        '&:hover': { transform: 'scale(1.05)' }
                    }}>
                        {card.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.8)', lineHeight: 1.5, display: 'block', fontSize: '0.85rem' }}>
                        {card.desc}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

// ─── Mac-style Windowed Code Block (for actual code) ───
const ImmersiveCodeBlock = ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{ my: 5 }}>
        <Box sx={{
            bgcolor: '#1e293b', px: 3, py: 1.5,
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            border: '1px solid rgba(30,41,59,1)', borderBottom: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <Box sx={{ display: 'flex', gap: 0.7 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: 1 }}>
                example.cpp
            </Typography>
        </Box>
        <Box sx={{
            bgcolor: '#0f172a',
            borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
            border: '1px solid rgba(30,41,59,1)',
            p: 4, overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
            <pre style={{
                margin: 0,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                fontSize: '1rem',
                lineHeight: 1.8,
                color: '#e2e8f0',
                whiteSpace: 'pre',
                overflowX: 'auto'
            }}>
                <code>{children}</code>
            </pre>
        </Box>
    </Box>
);

// ─── Inline code pill ───
const InlineCode = ({ children }: { children?: React.ReactNode }) => (
    <code style={{
        background: 'rgba(59,130,246,0.12)',
        color: '#60a5fa',
        padding: '2px 8px',
        borderRadius: 6,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: '0.88em'
    }}>
        {children}
    </code>
);

// ─── Pro Tip callout (blockquote) ───
const ProTip = ({ title, children }: { title?: string; children?: React.ReactNode }) => (
    <Box sx={{
        my: 5, p: 3.5,
        borderRadius: 3,
        bgcolor: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex', gap: 2.5, alignItems: 'flex-start'
    }}>
        <Box sx={{
            mt: 0.3, flexShrink: 0,
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
        }}>
            <LightbulbIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
            {title && (
                <Typography sx={{ color: '#fff', fontWeight: 800, mb: 0.5, fontSize: '0.95rem' }}>
                    {title}
                </Typography>
            )}
            <Box sx={{ 
                color: 'rgba(148,163,184,0.9)', 
                lineHeight: 1.65,
                '& p': { 
                    mt: 0, 
                    mb: 0, 
                    fontSize: '1rem', 
                    color: 'inherit' 
                }
            }}>
                {children}
            </Box>
        </Box>
    </Box>
);

// ─── Section heading (h2) ───
const SectionHeading = ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 8, mb: 4 }}>
        <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: 'rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3b82f6', flexShrink: 0
        }}>
            <CodeIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: -0.4 }}>
            {children}
        </Typography>
    </Box>
);

// ─── Content splitter: handles [CARDS]...[/CARDS] blocks ───
function splitContent(raw: string) {
    const segments: { type: 'markdown' | 'cards'; content: string }[] = [];
    const re = /\[CARDS\]([\s\S]*?)\[\/CARDS\]/gm;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
        if (m.index > last) segments.push({ type: 'markdown', content: raw.slice(last, m.index) });
        segments.push({ type: 'cards', content: m[1] });
        last = m.index + m[0].length;
    }
    if (last < raw.length) segments.push({ type: 'markdown', content: raw.slice(last) });
    return segments;
}

export default function TheoryView({ lesson, onComplete }: TheoryViewProps) {
    const segments = splitContent(lesson.content || '');

    return (
        <Box sx={{
            height: '100%', overflowY: 'auto',
            bgcolor: '#0d172a',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 0)',
            backgroundSize: '36px 36px'
        }}>
            <Container maxWidth="md" sx={{ py: 8, pb: 24, px: { xs: 3, md: 6 } }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                    {/* Badge */}
                    <Box sx={{ mb: 6 }}>
                        <Box sx={{
                            display: 'inline-flex', px: 2.5, py: 1,
                            borderRadius: 20, border: '1px solid rgba(59,130,246,0.25)',
                            bgcolor: 'rgba(59,130,246,0.1)'
                        }}>
                            <Typography variant="caption" sx={{
                                color: '#3b82f6', fontWeight: 900,
                                letterSpacing: '0.2em', fontSize: '0.68rem'
                            }}>
                                {lesson.module?.title?.toUpperCase() || 'МОДУЛЬ'} • {lesson.difficulty || 'BASIC'}
                            </Typography>
                        </Box>
                        <Typography variant="h2" sx={{
                            fontWeight: 900, mt: 3, mb: 0,
                            fontSize: { xs: '2rem', md: '3rem' },
                            letterSpacing: -1.5, lineHeight: 1.1, color: '#fff'
                        }}>
                            {lesson.title}
                        </Typography>
                    </Box>

                    {/* Segmented content */}
                    <Box sx={{
                        '& p': { color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8, mb: 3 },
                        '& ul, & ol': { color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.8, mb: 3, pl: 3 },
                        '& li': { mb: 1.5 },
                        '& strong': { color: '#e2e8f0', fontWeight: 700 },
                        '& h3': { color: '#fff', fontWeight: 800, fontSize: '1.1rem', mt: 4, mb: 2 },
                        '& table': { width: '100%', borderCollapse: 'collapse', my: 4 },
                        '& th': { textAlign: 'left', p: 1.5, borderBottom: '2px solid rgba(59,130,246,0.3)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 700 },
                        '& td': { p: 1.5, borderBottom: '1px solid rgba(30,41,59,1)', color: '#94a3b8', fontSize: '0.9rem' },
                    }}>
                        {segments.map((seg, i) =>
                            seg.type === 'cards'
                                ? <TypeCardsBlock key={i} raw={seg.content} />
                                : (
                                    <ReactMarkdown
                                        key={i}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node, ...p }: any) => (
                                                <Typography variant="h3" sx={{ fontWeight: 900, mb: 4, mt: 8, letterSpacing: -1, color: '#fff' }}>
                                                    {p.children}
                                                </Typography>
                                            ),
                                            h2: ({ node, ...p }: any) => <SectionHeading>{p.children}</SectionHeading>,
                                            h3: ({ node, ...p }: any) => (
                                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, mt: 4, color: '#e2e8f0' }}>
                                                    {p.children}
                                                </Typography>
                                            ),
                                            code: ({ node, inline, className, children, ...p }: any) => {
                                                const codeText = String(children).replace(/\n$/, '');
                                                const isSimple = !codeText.includes('\n') && codeText.length < 40;
                                                return inline || isSimple
                                                    ? <InlineCode>{children}</InlineCode>
                                                    : <ImmersiveCodeBlock>{children}</ImmersiveCodeBlock>;
                                            },
                                            blockquote: ({ node, children, ...p }: any) => {
                                                // Extract title from first paragraph if it starts with "**..."
                                                let title: string | undefined;
                                                let rest = children;
                                                return <ProTip title={title}>{rest}</ProTip>;
                                            },
                                        }}
                                    >
                                        {seg.content}
                                    </ReactMarkdown>
                                )
                        )}
                    </Box>

                    {/* Bottom action */}
                    <Box sx={{
                        mt: 10, pt: 5,
                        borderTop: '1px solid rgba(30,41,59,1)',
                        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center', justifyContent: 'flex-end', gap: 2
                    }}>
                        <Button
                            variant="contained" size="large"
                            onClick={() => onComplete()}
                            sx={{
                                bgcolor: '#3b82f6',
                                minWidth: { sm: 260 }, py: 2, px: 6,
                                borderRadius: 3,
                                fontWeight: 800, fontSize: '0.95rem',
                                boxShadow: '0 10px 30px rgba(59,130,246,0.25)',
                                '&:hover': { bgcolor: '#2563eb' },
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Завершити і продовжити →
                        </Button>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}
