'use client';

import React, { useRef, useState } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

interface TheoryEditorProps {
    courseTitle: string;
    moduleTitle: string;
    content: string;
    readTime: number;
    difficulty: string;
    tips: string[];
    onContentChange: (content: string) => void;
    onReadTimeChange: (time: number) => void;
    onDifficultyChange: (level: string) => void;
    onTipsChange: (tips: string[]) => void;
    onModuleTitleChange: (title: string) => void;
    onSave: () => void;
    saving?: boolean;
}

// ─── Preview Components (Shared with TheoryView) ───
const ImmersiveCodeBlock = ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{ my: 3, textAlign: 'left' }}>
        <Box sx={{
            bgcolor: '#1e293b', px: 2, py: 1,
            borderTopLeftRadius: 12, borderTopRightRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)', borderBottom: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#27c93f' }} />
            </Box>
        </Box>
        <Box sx={{
            bgcolor: '#0f172a',
            borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
            p: 3, overflow: 'auto'
        }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre' }}>
                <code>{children}</code>
            </pre>
        </Box>
    </Box>
);

const ProTipPreview = ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{
        my: 3, p: 2.5,
        borderRadius: 3,
        bgcolor: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex', gap: 2, alignItems: 'flex-start',
        textAlign: 'left'
    }}>
        <Box sx={{ mt: 0.3, flexShrink: 0, color: '#3b82f6' }}><LightbulbIcon sx={{ fontSize: 18 }} /></Box>
        <Box sx={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.95rem', lineHeight: 1.6 }}>{children}</Box>
    </Box>
);

const SectionHeadingPreview = ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 6, mb: 3, textAlign: 'left' }}>
        <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <CodeIcon sx={{ fontSize: 14 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>{children}</Typography>
    </Box>
);

export default function TheoryEditor({ 
    courseTitle, moduleTitle, content, readTime, difficulty, tips,
    onContentChange, onReadTimeChange, onDifficultyChange, onTipsChange,
    onModuleTitleChange, onSave, saving
}: TheoryEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [newTip, setNewTip] = useState('');
    const [showTips, setShowTips] = useState(false);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
        onContentChange(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleAddTip = () => {
        if (!newTip.trim()) return;
        onTipsChange([...tips, newTip.trim()]);
        setNewTip('');
    };

    return (
        <div className="flex flex-col h-full bg-[#070e1e]">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-outline-variant/10 bg-[#0b1325] sticky top-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-outline font-bold uppercase tracking-widest">{courseTitle}</span>
                        <input 
                            value={moduleTitle}
                            onChange={(e) => onModuleTitleChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-xl font-bold text-on-surface focus:ring-0 w-80"
                            placeholder="Назва модуля..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-xs font-bold text-outline">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <input 
                                type="number" 
                                value={readTime} 
                                onChange={(e) => onReadTimeChange(parseInt(e.target.value) || 0)}
                                className="w-10 bg-transparent border-b border-outline-variant/20 hover:border-primary text-center focus:outline-none"
                            />
                            <span>хв</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <select 
                                value={difficulty}
                                onChange={(e) => onDifficultyChange(e.target.value)}
                                className="bg-transparent border-none text-primary cursor-pointer focus:ring-0 outline-none"
                            >
                                <option value="BASIC">Початковий</option>
                                <option value="STANDARD">Середній</option>
                                <option value="ADVANCED">Просунутий</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowTips(!showTips)}
                        className={`p-2 rounded-lg transition-colors ${showTips ? 'bg-tertiary/20 text-tertiary' : 'text-outline-variant hover:bg-surface-container'}`}
                        title="Технічні поради"
                    >
                        <span className="material-symbols-outlined">lightbulb</span>
                    </button>

                    <button 
                        onClick={onSave}
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 transition-all text-sm flex items-center gap-2"
                    >
                        {saving ? <CircularProgress size={16} color="inherit" /> : <span className="material-symbols-outlined text-sm">save</span>}
                        Зберегти
                    </button>
                </div>
            </div>

            {/* Split View Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Side */}
                <div className="flex-1 border-r border-outline-variant/10 flex flex-col bg-surface-dim/30">
                    {/* Toolbar */}
                    <div className="flex gap-1 p-3 border-bottom border-outline-variant/10 bg-[#0b1325]/50 flex-wrap">
                        <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Жирний"><span className="material-symbols-outlined text-outline text-lg">format_bold</span></button>
                        <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Курсив"><span className="material-symbols-outlined text-outline text-lg">format_italic</span></button>
                        <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Посилання"><span className="material-symbols-outlined text-outline text-lg">link</span></button>
                        <div className="w-px h-6 bg-outline-variant/10 mx-1 self-center"></div>
                        <button onClick={() => insertMarkdown('## ')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Заголовок"><span className="material-symbols-outlined text-outline text-lg">title</span></button>
                        <button onClick={() => insertMarkdown('- ')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Список"><span className="material-symbols-outlined text-outline text-lg">format_list_bulleted</span></button>
                        <button onClick={() => insertMarkdown('```cpp\n', '\n```')} className="p-2 hover:bg-surface-container rounded-md transition-colors" title="Код"><span className="material-symbols-outlined text-outline text-lg">code</span></button>
                    </div>

                    <textarea 
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => onContentChange(e.target.value)}
                        className="flex-1 w-full bg-transparent border-none focus:ring-0 p-8 text-lg leading-relaxed text-on-surface/90 font-body resize-none scrollbar-thin overflow-y-auto"
                        placeholder="Почніть писати урок..."
                    />
                </div>

                {/* Preview Side */}
                <div className="flex-1 bg-[#0d172a] overflow-y-auto scrollbar-thin relative border-r border-outline-variant/10">
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-outline-variant tracking-widest uppercase opacity-40">Прев'ю в реальному часі</div>
                    <div className="max-w-2xl mx-auto px-10 py-16">
                        <Box sx={{ 
                            '& p': { color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.8, mb: 3 },
                            '& ul, & ol': { color: '#94a3b8', fontSize: '1rem', lineHeight: 1.8, mb: 3, pl: 3 },
                            '& li': { mb: 1 },
                            '& strong': { color: '#e2e8f0', fontWeight: 700 },
                            '& h1, & h2, & h3': { color: '#fff', fontWeight: 900, mb: 3, mt: 6 },
                            '& blockquote': { margin: 0 }
                        }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h2: ({ children }) => <SectionHeadingPreview>{children}</SectionHeadingPreview>,
                                    code: ({ children, className }) => {
                                        const isBlock = className?.includes('language-');
                                        return isBlock ? (
                                            <ImmersiveCodeBlock>{children}</ImmersiveCodeBlock>
                                        ) : (
                                            <code className="bg-primary/10 text-primary-fixed-dim px-1.5 py-0.5 rounded font-mono text-[0.9em] font-bold">{children}</code>
                                        );
                                    },
                                    blockquote: ({ children }) => <ProTipPreview>{children}</ProTipPreview>,
                                }}
                            >
                                {content || '*Контент ще не додано...*'}
                            </ReactMarkdown>
                        </Box>
                    </div>
                </div>

                {/* Tips Sidebar (Collapsible) */}
                {showTips && (
                    <div className="w-80 bg-[#0b1325] border-l border-outline-variant/10 flex flex-col p-6 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-tertiary text-lg">lightbulb</span>
                                Технічні поради
                            </h4>
                            <button onClick={() => setShowTips(false)} className="text-outline-variant hover:text-on-surface"><span className="material-symbols-outlined text-sm">close</span></button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin">
                            {tips.length === 0 ? (
                                <p className="text-xs text-outline italic">Порад ще немає...</p>
                            ) : (
                                tips.map((tip, index) => (
                                    <div key={index} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 group relative">
                                        <p className="text-xs text-on-surface-variant leading-relaxed pr-6">{tip}</p>
                                        <button 
                                            onClick={() => onTipsChange(tips.filter((_, i) => i !== index))}
                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-outline-variant hover:text-error transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-4 border-t border-outline-variant/10">
                            <textarea 
                                value={newTip}
                                onChange={(e) => setNewTip(e.target.value)}
                                placeholder="Нова порада..."
                                className="w-full bg-surface-dim border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface focus:ring-1 focus:ring-tertiary resize-none mb-3 scrollbar-hide"
                                rows={3}
                            />
                            <button onClick={handleAddTip} className="w-full py-2.5 bg-tertiary text-on-tertiary text-xs font-bold rounded-xl hover:bg-tertiary-fixed transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-tertiary/10">
                                <span className="material-symbols-outlined text-sm">add</span> Додати
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
