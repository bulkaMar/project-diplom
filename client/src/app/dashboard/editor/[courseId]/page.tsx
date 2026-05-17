'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    CircularProgress, Typography, Box,
    Snackbar, Alert
} from '@mui/material';

import StudioLayout from '@/components/Editor/StudioLayout';
import TheoryEditor from '@/components/Editor/TheoryEditor';
import QuizEditor from '@/components/Editor/QuizEditor';
import PracticeEditor from '@/components/Editor/PracticeEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CourseContentEditor() {
    const { token } = useAuth();
    const { courseId } = useParams();
    const router = useRouter();
    
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    
    // UI State
    const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [activeModuleId, setActiveModuleId] = useState('');
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonType, setNewLessonType] = useState('THEORY');

    // Lesson Data State
    const [theoryContent, setTheoryContent] = useState('');
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    const [practiceData, setPracticeData] = useState({
        description: '',
        templateCode: '',
        testCases: [] as any[],
        difficulty: 'MEDIUM'
    });

    // Notifications State
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const notify = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Metadata for Theory
    const [readTime, setReadTime] = useState<number>(15);
    const [difficulty, setDifficulty] = useState<string>('BASIC');
    const [tips, setTips] = useState<string[]>([]);

    const fetchCourseData = async () => {
        try {
            const res = await axios.get(`${API_URL}/management/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourse(res.data);
            if (!selectedLesson && res.data.modules?.[0]?.lessons?.[0]) {
                selectLesson(res.data.modules[0].lessons[0]);
            }
        } catch (err) {
            console.error('Failed to fetch course structure:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && courseId) fetchCourseData();
    }, [token, courseId]);

    const selectLesson = (lesson: any) => {
        setSelectedLesson(lesson);
        if (lesson.type === 'THEORY') {
            setTheoryContent(lesson.content || '');
            setDifficulty(lesson.difficulty || 'BASIC');
            
            // Extract metadata from testCases
            const metadata = typeof lesson.testCases === 'object' && lesson.testCases ? lesson.testCases : {};
            setReadTime(metadata.readTime || 15);
            setTips(metadata.tips || []);
        } else if (lesson.type === 'QUIZ') {
            let questions = [];
            // Try to get questions from testCases first
            if (lesson.testCases) {
                if (Array.isArray(lesson.testCases)) {
                    questions = lesson.testCases;
                } else if (typeof lesson.testCases === 'object' && (lesson.testCases as any).questions) {
                    questions = (lesson.testCases as any).questions;
                }
            } 
            
            // If empty, try to parse from content (legacy format)
            if (questions.length === 0 && lesson.content) {
                try {
                    const parsed = JSON.parse(lesson.content);
                    questions = parsed.questions || [];
                } catch (e) {
                    // Not JSON, ignore
                }
            }

            // Map and ensure IDs/structure
            const mappedQuestions = questions.map((q: any) => ({
                id: q.id || Math.random().toString(36).substr(2, 9),
                question: q.question || '',
                code: q.code || '',
                options: q.options || ['', '', '', ''],
                correctAnswer: q.correctAnswer ?? 0,
                explanation: q.explanation || q.hint || ''
            }));
            
            setQuizQuestions(mappedQuestions);
        } else if (lesson.type === 'PRACTICE') {
            setPracticeData({
                description: lesson.content || '',
                templateCode: lesson.initialCode || '',
                testCases: lesson.testCases || [],
                difficulty: lesson.difficulty || 'MEDIUM'
            });
        }
    };

    const handleSave = async (trigger: 'STUDIO' | 'INTERNAL' = 'INTERNAL') => {
        if (!selectedLesson) return;
        setSaving(true);
        try {
            let payload: any = { title: selectedLesson.title };
            
            if (selectedLesson.type === 'THEORY') {
                payload.content = theoryContent;
                payload.difficulty = difficulty;
                payload.testCases = {
                    readTime,
                    tips
                };
            } else if (selectedLesson.type === 'QUIZ') {
                payload.testCases = quizQuestions;
            } else if (selectedLesson.type === 'PRACTICE') {
                payload.content = practiceData.description;
                payload.initialCode = practiceData.templateCode;
                payload.testCases = practiceData.testCases;
                payload.difficulty = practiceData.difficulty;
            }

            await axios.patch(`${API_URL}/management/lessons/${selectedLesson.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // If triggered from sidebar, ensure the course itself is marked as published
            if (trigger === 'STUDIO') {
                await axios.put(`${API_URL}/management/courses/${courseId}`, { published: true }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            await fetchCourseData();
            
            let successMsg = 'Зміни в уроці збережено!';
            if (trigger === 'STUDIO') {
                successMsg = course?.published ? 'Ваш курс успішно оновлено!' : 'Ваш курс опубліковано успішно!';
            }
            
            notify(successMsg, 'success');
        } catch (err) {
            console.error('Failed to save lesson:', err);
            notify('Помилка при збереженні', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateModule = async () => {
        try {
            await axios.post(`${API_URL}/management/courses/${courseId}/modules`, {
                title: newModuleTitle,
                orderIndex: (course.modules?.length || 0) + 1
            }, { headers: { Authorization: `Bearer ${token}` } });
            setIsModuleDialogOpen(false);
            setNewModuleTitle('');
            fetchCourseData();
        } catch (err) { console.error(err); }
    };

    const handleCreateLesson = async () => {
        try {
            await axios.post(`${API_URL}/management/modules/${activeModuleId}/lessons`, {
                title: newLessonTitle,
                slug: `${activeModuleId}-${Date.now()}`,
                orderIndex: 0,
                content: 'Новий урок...',
                type: newLessonType
            }, { headers: { Authorization: `Bearer ${token}` } });
            setIsLessonDialogOpen(false);
            setNewLessonTitle('');
            fetchCourseData();
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="bg-[#070e1e] min-h-screen flex items-center justify-center">
            <CircularProgress sx={{ color: '#86adff' }} />
        </div>
    );
    
    if (!course) return (
        <div className="bg-[#070e1e] min-h-screen flex items-center justify-center text-[#dfe5fc]">
            <Typography variant="h5">Курс не знайдено</Typography>
        </div>
    );

    return (
        <StudioLayout
            onPublish={() => handleSave('STUDIO')}
            onPreview={() => selectedLesson?.slug && window.open(`/dashboard/lessons/${selectedLesson.slug}`, '_blank')}
            onNewModule={() => setIsModuleDialogOpen(true)}
            modules={course.modules || []}
            publishButtonLabel={course?.published ? "Оновити курс" : "Опублікувати"}
        >
            <div className="flex h-full">
                {/* Module & Lesson Sidebar (Internal) */}
                <div className="w-48 border-r border-outline-variant/10 bg-[#0b1325]/50 overflow-y-auto p-4 space-y-6">
                    <h3 className="text-[10px] font-bold text-outline tracking-widest uppercase px-2 mb-4">Навчальний План</h3>
                    {course.modules?.map((module: any) => (
                        <div key={module.id} className="space-y-1">
                            <div className="flex items-center justify-between px-2 py-1 group">
                                <span className="text-xs font-bold text-[#dfe5fc]/70 headline-font truncate w-40">{module.title}</span>
                                <button 
                                    onClick={() => { setActiveModuleId(module.id); setIsLessonDialogOpen(true); }}
                                    className="opacity-100 transition-opacity text-primary hover:text-primary-dim"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {module.lessons?.map((lesson: any) => (
                                    <button 
                                        key={lesson.id}
                                        onClick={() => selectLesson(lesson)}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 ${
                                            selectedLesson?.id === lesson.id 
                                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                                            : 'text-[#6e7589] hover:bg-[#161f34] hover:text-[#dfe5fc]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {lesson.type === 'THEORY' ? 'menu_book' : lesson.type === 'QUIZ' ? 'quiz' : 'code'}
                                        </span>
                                        <span className="truncate">{lesson.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-y-auto bg-surface-dim">
                    {selectedLesson ? (
                        <>
                            {selectedLesson.type === 'THEORY' && (
                                <TheoryEditor 
                                    courseTitle={course.title}
                                    moduleTitle={selectedLesson.title}
                                    content={theoryContent}
                                    onContentChange={setTheoryContent}
                                    readTime={readTime}
                                    onReadTimeChange={setReadTime}
                                    difficulty={difficulty}
                                    onDifficultyChange={setDifficulty}
                                    tips={tips}
                                    onTipsChange={setTips}
                                    onModuleTitleChange={(title) => setSelectedLesson({ ...selectedLesson, title })}
                                    onSave={() => handleSave('INTERNAL')}
                                    saving={saving}
                                />
                            )}
                            {selectedLesson.type === 'QUIZ' && (
                                <QuizEditor 
                                    questions={quizQuestions}
                                    onQuestionsChange={setQuizQuestions}
                                    onSave={() => handleSave('INTERNAL')}
                                    saving={saving}
                                />
                            )}
                            {selectedLesson.type === 'PRACTICE' && (
                                <PracticeEditor 
                                    courseTitle={course.title}
                                    taskDescription={practiceData.description}
                                    onDescriptionChange={(description) => setPracticeData({ ...practiceData, description })}
                                    testCases={practiceData.testCases}
                                    onTestCasesChange={(testCases) => setPracticeData({ ...practiceData, testCases })}
                                    templateCode={practiceData.templateCode}
                                    onCodeChange={(templateCode) => setPracticeData({ ...practiceData, templateCode })}
                                    difficulty={practiceData.difficulty}
                                    onDifficultyChange={(difficulty) => setPracticeData({ ...practiceData, difficulty })}
                                    onSave={() => handleSave('INTERNAL')}
                                    saving={saving}
                                />
                            )}
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-outline/30 flex-col gap-4">
                            <span className="material-symbols-outlined text-6xl">edit_note</span>
                            <span className="headline-font font-bold">Оберіть урок для редагування</span>
                        </div>
                    )}
                </div>
            </div>

            {/* MUI Dialogs Styled for Dark Theme */}
            <Dialog open={isModuleDialogOpen} onClose={() => setIsModuleDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#11192d', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundImage: 'none' } }}>
                <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2, fontSize: '1.2rem', fontWeight: 700 }}>Новий модуль</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <TextField autoFocus fullWidth label="Назва модуля" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)' }, '& label': { color: 'rgba(255,255,255,0.4)' } }} />
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setIsModuleDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Скасувати</Button>
                    <Button onClick={handleCreateModule} variant="contained" sx={{ bgcolor: '#86adff', color: '#002c67', fontWeight: 700, px: 3 }}>Створити</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isLessonDialogOpen} onClose={() => setIsLessonDialogOpen(false)} PaperProps={{ sx: { bgcolor: '#11192d', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', backgroundImage: 'none' } }}>
                <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2, fontSize: '1.2rem', fontWeight: 700 }}>Новий урок</DialogTitle>
                <DialogContent sx={{ mt: 2, spaceY: 3 }}>
                    <TextField autoFocus fullWidth label="Назва уроку" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(0,0,0,0.2)' }, '& label': { color: 'rgba(255,255,255,0.4)' } }} />
                    <FormControl fullWidth>
                        <InputLabel sx={{ color: 'rgba(255,255,255,0.4)' }}>Тип уроку</InputLabel>
                        <Select value={newLessonType} label="Тип уроку" onChange={(e) => setNewLessonType(e.target.value)} sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.2)' }}>
                            <MenuItem value="THEORY">Теорія</MenuItem>
                            <MenuItem value="PRACTICE">Практика</MenuItem>
                            <MenuItem value="QUIZ">Квіз</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1 }}>
                    <Button onClick={() => setIsLessonDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Скасувати</Button>
                    <Button onClick={handleCreateLesson} variant="contained" sx={{ bgcolor: '#86adff', color: '#002c67', fontWeight: 700, px: 3 }}>Створити</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ 
                        width: '100%', 
                        borderRadius: 4, 
                        fontWeight: 900,
                        bgcolor: 'rgba(7, 14, 30, 0.85)',
                        color: '#dfe5fc',
                        boxShadow: snackbar.severity === 'success' 
                            ? '0 0 40px rgba(16, 185, 129, 0.15), 0 20px 40px rgba(0,0,0,0.6)' 
                            : '0 0 40px rgba(239, 68, 68, 0.15), 0 20px 40px rgba(0,0,0,0.6)',
                        border: '1px solid',
                        borderColor: snackbar.severity === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        backdropFilter: 'blur(24px)',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '16px 28px',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '6px',
                            background: snackbar.severity === 'success' 
                                ? 'linear-gradient(to bottom, #10b981, #059669)' 
                                : 'linear-gradient(to bottom, #ef4444, #b91c1c)',
                        },
                        '& .MuiAlert-icon': {
                            fontSize: '22px',
                            color: snackbar.severity === 'success' ? '#10b981' : '#ef4444',
                            marginRight: '12px'
                        },
                        '& .MuiAlert-message': {
                            padding: '4px 0',
                            letterSpacing: '0.02em',
                            fontSize: '0.95rem'
                        },
                        '& .MuiAlert-action': {
                            color: '#6e7589'
                        }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StudioLayout>
    );
}
