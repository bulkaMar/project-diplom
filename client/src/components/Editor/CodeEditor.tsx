'use client';
import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Box, Paper, Typography, CircularProgress, useTheme } from '@mui/material';

interface CodeEditorProps {
    initialCode?: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    height?: string;
    readOnly?: boolean;
}

const DEFAULT_CODE = `// Напишіть свій код на C++ тут
#include <iostream>

int main() {
    std::cout << "Привіт, Світ!" << std::endl;
    return 0;
}`;

export default function CodeEditor({
    initialCode = DEFAULT_CODE,
    language = 'cpp',
    onChange,
    height = '500px',
    readOnly = false,
}: CodeEditorProps) {
    const editorRef = useRef(null);
    const theme = useTheme();

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // @ts-ignore
        editorRef.current = editor;
    };

    const editorTheme = theme.palette.mode === 'dark' ? 'vs-dark' : 'light';

    return (
        <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Box sx={{
                bgcolor: 'background.paper',
                p: 1.5,
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                    Редактор C++
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {readOnly ? 'Тільки для читання' : 'Інтерактивний'}
                </Typography>
            </Box>
            <Editor
                height={height}
                defaultLanguage={language}
                defaultValue={initialCode}
                theme={editorTheme}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    padding: { top: 16 },
                }}
                loading={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
            />
        </Paper>
    );
}
