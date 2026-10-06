'use client';
import { useState } from 'react';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeEditor from '@/components/Editor/CodeEditor';
import { useT } from '@/lib/i18n';

export default function PracticePage() {
    const tr = useT();
    const [code, setCode] = useState<string | undefined>('// Напишіть свій код на C++ тут\n#include <iostream>\n\nint main() {\n    std::cout << "Привіт, Світ!" << std::endl;\n    return 0;\n}');
    const [output, setOutput] = useState<string>(tr('Запустіть код, щоб побачити результати...', 'Run the code to see the results...'));
    const [isRunning, setIsRunning] = useState(false);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(tr('Компіляція і виконання...', 'Compiling and running...'));

        // TODO: Connect to actual backend API
        // For now, simulate network delay
        setTimeout(() => {
            setIsRunning(false);
            setOutput('Привіт, Світ!\n\n[Програма завершилася з кодом 0]');
        }, 1500);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        {tr('Арена практики', 'Practice arena')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {tr('Пишіть, виконуйте і тестуйте свій код C++ у реальному часі.', 'Write, run and test your C++ code in real time.')}
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleRunCode}
                    disabled={isRunning}
                    size="large"
                >
                    {isRunning ? tr('Виконується...', 'Running...') : tr('Запустити код', 'Run code')}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <CodeEditor
                        initialCode={code}
                        onChange={setCode}
                        height="600px"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={3} sx={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ bgcolor: '#1e293b', p: 1.5, borderBottom: '1px solid #334155' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="#fff">
                                {tr('Вивід консолі', 'Console output')}
                            </Typography>
                        </Box>
                        <Box sx={{
                            p: 2,
                            bgcolor: '#0f172a',
                            flexGrow: 1,
                            color: '#10b981',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {output}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
