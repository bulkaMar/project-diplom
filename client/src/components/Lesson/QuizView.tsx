import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, Grid, LinearProgress, IconButton, Collapse } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    hint?: string;
    code?: string;
}

interface QuizViewProps {
    content?: string;
    questions?: any[];
    onComplete: (success: boolean, score?: number, shouldRedirect?: boolean) => void;
}

export default function QuizView({ content, questions, onComplete }: QuizViewProps) {
    const [quizData, setQuizData] = useState<{ questions: Question[] }>({ questions: [] });
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showHint, setShowHint] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeSpent, setTimeSpent] = useState<number>(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    // Initial load timer
    useEffect(() => {
        const id = setInterval(() => {
            if (!isSubmitted) {
                setTimeSpent(t => t + 1);
            }
        }, 1000);
        setTimerId(id);
        return () => clearInterval(id);
    }, [isSubmitted]);

    useEffect(() => {
        // 1. If questions array is provided directly, use it
        if (questions && Array.isArray(questions)) {
            setQuizData({ questions });
            setError(null);
            return;
        }

        // 2. Fallback to parsing content if questions are not provided
        if (content) {
            try {
                const parsed = JSON.parse(content);
                if (parsed && Array.isArray(parsed.questions)) {
                    setQuizData(parsed);
                    setError(null);
                } else if (Array.isArray(parsed)) {
                    setQuizData({ questions: parsed });
                    setError(null);
                } else {
                    setError('Неправильний формат тесту: відсутній масив запитань.');
                }
            } catch (e) {
                console.error("Failed to parse quiz content:", e);
                // If content is not JSON, it might just be markdown/description, 
                // but we need questions to run a quiz.
                if (!questions) {
                    setError('Не вдалося завантажити дані тесту.');
                }
            }
        }
    }, [content, questions]);

    const handleNext = () => {
        if (currentStep < quizData.questions.length - 1) {
            setCurrentStep(currentStep + 1);
            setShowHint(false);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setShowHint(false);
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quizData.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correctCount++;
        });
        
        const progressScore = (correctCount / quizData.questions.length) * 100;
        const isPassed = progressScore >= 80;
        
        setIsSubmitted(true);
        // Save progress immediately but don't redirect yet
        onComplete(isPassed, progressScore, false);
    };

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="outlined" onClick={() => onComplete(false, 0)}>Пропустити тест</Button>
            </Box>
        );
    }

    if (quizData.questions.length === 0) return null;

    if (isSubmitted) {
        let correctCount = 0;
        quizData.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correctCount++;
        });
        const progressScore = (correctCount / quizData.questions.length) * 100;
        const isPassed = progressScore >= 80;

        const formatTime = (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        return (
            <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 896, mx: 'auto', position: 'relative' }}>
                {/* Result Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4, mb: 10 }}>
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box component="span" sx={{
                            display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.5, borderRadius: 10,
                            bgcolor: isPassed ? 'rgba(74, 222, 128, 0.2)' : 'rgba(159, 5, 25, 0.2)',
                            color: isPassed ? '#4ade80' : '#ff716c',
                            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2
                        }}>
                            Результат: {isPassed ? 'Успішно' : 'Недостатньо'}
                        </Box>
                        
                        <Typography variant="h3" sx={{ fontWeight: 800, color: '#dfe5fc', mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.2 }}>
                            {isPassed ? 'Відмінна робота!' : 'Спробуйте ще раз!'} <br/>
                            <Box component="span" sx={{ color: isPassed ? '#4ade80' : '#ff716c' }}>
                                {isPassed ? 'Тест пройдено' : 'Недостатньо балів'}
                            </Box>
                        </Typography>
                        
                        <Typography sx={{ color: '#a4abc0', fontSize: '0.875rem', maxWidth: 450, mx: { xs: 'auto', md: 0 }, mb: 4, lineHeight: 1.6 }}>
                            {isPassed 
                                ? 'Ваші знання на високому рівні. Ви готові рухатися далі і вивчати складніші концепції C++.'
                                : "Майстерність у C++ вимагає часу та уваги до деталей. Ваш поточний результат показує прогалини в розумінні теми."}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Button
                                onClick={() => {
                                    if (isPassed) {
                                        onComplete(true, progressScore);
                                    } else {
                                        setIsSubmitted(false);
                                        setCurrentStep(0);
                                        setAnswers({});
                                        setTimeSpent(0);
                                    }
                                }}
                                sx={{
                                    px: 3, py: 1.25,
                                    background: 'linear-gradient(to bottom right, #86adff, #026fef)',
                                    color: '#002c67', fontSize: '0.875rem', fontWeight: 700,
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    borderRadius: 1, '&:hover': { opacity: 0.9 }, textTransform: 'none', display: 'flex', gap: 1
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                                {isPassed ? 'Продовжити навчання' : 'Пройти ще раз'}
                            </Button>
                            
                            {!isPassed && (
                                <Button
                                    onClick={() => onComplete(false, progressScore)}
                                    sx={{
                                        px: 3, py: 1.25,
                                        bgcolor: 'transparent', border: '1px solid rgba(110, 117, 137, 0.2)',
                                        color: '#86adff', fontSize: '0.875rem', fontWeight: 700,
                                        borderRadius: 1, '&:hover': { bgcolor: '#11192d' }, textTransform: 'none', display: 'flex', gap: 1
                                    }}
                                >
                                    <MenuBookIcon sx={{ fontSize: 18 }} />
                                    Повторити теорію
                                </Button>
                            )}
                        </Box>
                    </Box>
                    
                    <Box sx={{ flexShrink: 0, position: 'relative', width: 192, height: 192, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="50" cy="50" r="42" fill="transparent" stroke="#161f34" strokeWidth="6" />
                            <circle cx="50" cy="50" r="42" fill="transparent" stroke={isPassed ? '#4ade80' : '#ff716c'} strokeWidth="6" strokeLinecap="round"
                                strokeDasharray="264" strokeDashoffset={264 - (264 * progressScore) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                        </svg>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: isPassed ? '#4ade80' : '#ff716c' }}>
                                {Math.round(progressScore)}%
                            </Typography>
                            <Typography sx={{ color: '#a4abc0', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.05em', mt: 0.5 }}>
                                {correctCount} з {quizData.questions.length} правильних
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                
                {/* Stats Grid */}
                <Grid container spacing={2} sx={{ mb: 10 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ bgcolor: '#0b1325', p: 2, borderRadius: 2, border: '1px solid rgba(65, 72, 90, 0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#161f34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AccessTimeIcon sx={{ color: '#86adff', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#a4abc0', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Час</Typography>
                                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#dfe5fc' }}>{formatTime(timeSpent)}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ bgcolor: '#0b1325', p: 2, borderRadius: 2, border: '1px solid rgba(65, 72, 90, 0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#161f34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ErrorOutlineIcon sx={{ color: '#ff716c', fontSize: 20 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ color: '#a4abc0', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Помилок</Typography>
                                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#dfe5fc' }}>{quizData.questions.length - correctCount} питань</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Detailed Analysis */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 10 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#dfe5fc' }}>Аналіз відповідей</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#a4abc0', fontWeight: 500 }}>Всі {quizData.questions.length} питань</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {quizData.questions.map((q, idx) => {
                            const userAnswerIdx = answers[idx];
                            const isCorrect = userAnswerIdx === q.correctAnswer;
                            const isSkipped = userAnswerIdx === undefined;
                            
                            return (
                                <Box key={idx} sx={{
                                    bgcolor: '#11192d', p: 3, borderRadius: 2,
                                    borderLeft: '4px solid', borderLeftColor: isCorrect ? 'rgba(74, 222, 128, 0.5)' : 'rgba(255, 113, 108, 0.5)'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Typography sx={{ fontSize: '0.625rem', color: isCorrect ? '#4ade80' : '#ff716c', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                                            Питання {idx + 1} • {isCorrect ? 'Вірно' : 'Невірно'}
                                        </Typography>
                                        {isCorrect ? (
                                            <CheckCircleIcon sx={{ color: '#4ade80', fontSize: 18 }} />
                                        ) : (
                                            <CancelIcon sx={{ color: '#ff716c', fontSize: 18 }} />
                                        )}
                                    </Box>
                                    
                                    <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: '#dfe5fc', mb: 2 }}>{q.question}</Typography>

                                    {/* Inline code block rendering if exists */}
                                    {q.code && (
                                        <Box sx={{ 
                                            p: 1.5, bgcolor: '#0b1325', borderRadius: 1, 
                                            fontFamily: "'Fira Code', 'JetBrains Mono', monospace", 
                                            fontSize: '0.75rem', mb: 2, border: '1px solid rgba(65, 72, 90, 0.1)', 
                                            overflowX: 'auto', whiteSpace: 'pre', color: '#86adff'
                                        }}>
                                            {q.code}
                                        </Box>
                                    )}

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: isCorrect ? 12 : 6 }}>
                                            <Box sx={{ 
                                                bgcolor: isCorrect ? 'rgba(74, 222, 128, 0.05)' : 'rgba(159, 5, 25, 0.1)', 
                                                border: '1px solid', borderColor: isCorrect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 113, 108, 0.2)',
                                                p: 1.5, borderRadius: 1
                                            }}>
                                                <Typography sx={{ color: '#a4abc0', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>
                                                    {isCorrect ? 'Ваша відповідь (Вірно)' : 'Ваша відповідь'}
                                                </Typography>
                                                <Typography sx={{ color: isCorrect ? '#4ade80' : '#ff716c', fontWeight: 700, fontSize: '0.875rem' }}>
                                                    {isSkipped ? 'Не вказано' : q.options[userAnswerIdx]}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        {!isCorrect && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Box sx={{ 
                                                    bgcolor: 'rgba(74, 222, 128, 0.05)', 
                                                    border: '1px solid rgba(74, 222, 128, 0.2)',
                                                    p: 1.5, borderRadius: 1
                                                }}>
                                                    <Typography sx={{ color: '#a4abc0', fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, mb: 0.5 }}>
                                                        Правильна відповідь
                                                    </Typography>
                                                    <Typography sx={{ color: '#4ade80', fontWeight: 700, fontSize: '0.875rem' }}>
                                                        {q.options[q.correctAnswer]}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        );
    }

    const currentQuestion = quizData.questions[currentStep];
    const progress = ((currentStep + 1) / quizData.questions.length) * 100;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1024, mx: 'auto', position: 'relative' }}>
            {/* Progress Section */}
            <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: '#86adff', fontWeight: 800, letterSpacing: 2 }}>
                            ТЕОРЕТИЧНИЙ МОДУЛЬ
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#dfe5fc' }}>
                            Тестування в процесі
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#a4abc0', fontWeight: 700, letterSpacing: 1 }}>
                            ПРОГРЕС: {Math.round(progress)}%
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#dfe5fc' }}>
                            Питання {currentStep + 1} з {quizData.questions.length}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ height: 6, bgcolor: '#1b253c', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ height: '100%', background: 'linear-gradient(to right, #86adff, #026fef)', boxShadow: '0 0 15px rgba(134,173,255,0.4)' }}
                    />
                </Box>
            </Box>

            {/* Question Section */}
            <Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#dfe5fc', mb: 4, lineHeight: 1.2 }}>
                        {currentQuestion.question}
                    </Typography>

                    {/* Code Block Section */}
                    {currentQuestion.code && (
                        <Box sx={{
                            width: '100%',
                            bgcolor: '#000000',
                            borderRadius: 3,
                            border: '1px solid rgba(65, 72, 90, 0.2)',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            mb: 4
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 2,
                                py: 1.5,
                                bgcolor: '#0b1325',
                                borderBottom: '1px solid rgba(65, 72, 90, 0.2)'
                            }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(215, 56, 59, 0.4)' }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(232, 145, 238, 0.4)' }} />
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'rgba(85, 145, 255, 0.4)' }} />
                                </Box>
                                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'rgba(164, 171, 192, 0.6)', letterSpacing: '0.2em' }}>
                                    MAIN.CPP
                                </Typography>
                            </Box>
                            <Box sx={{ p: 3, overflowX: 'auto' }}>
                                <pre style={{ margin: 0, fontFamily: 'ui-monospace, monospace', fontSize: '14px', lineHeight: 1.6, color: '#dfe5fc' }}>
                                    <code>{currentQuestion.code}</code>
                                </pre>
                            </Box>
                        </Box>
                    )}

                    {/* Hint Section */}
                    {currentQuestion.hint && (
                        <Box sx={{ mb: 4 }}>
                            <Box
                                onClick={() => setShowHint(!showHint)}
                                sx={{
                                    p: 2, bgcolor: 'rgba(11, 19, 37, 0.5)',
                                    border: '1px solid rgba(134, 173, 255, 0.1)',
                                    borderRadius: 3, cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    '&:hover': { bgcolor: 'rgba(17, 25, 45, 0.8)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#8197ff' }}>
                                    <LightbulbIcon fontSize="small" />
                                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5 }}>
                                        ПОКАЗАТИ ПІДКАЗКУ
                                    </Typography>
                                </Box>
                                <ExpandMoreIcon sx={{
                                    color: '#6e7589',
                                    transform: showHint ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.3s'
                                }} />
                            </Box>
                            <Collapse in={showHint}>
                                <Box sx={{
                                    p: 3, mt: 2, bgcolor: 'rgba(11, 19, 37, 0.3)',
                                    borderRadius: 3, borderLeft: '4px solid #8197ff'
                                }}>
                                    <Typography variant="body2" sx={{ color: '#a4abc0', lineHeight: 1.6 }}>
                                        {currentQuestion.hint}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* Answers Grid */}
                    <Grid container spacing={2} sx={{ mb: 8 }}>
                        {currentQuestion.options.map((opt, optIdx) => {
                            const isSelected = answers[currentStep] === optIdx;
                            const isCorrect = isSubmitted && optIdx === currentQuestion.correctAnswer;
                            const isWrong = isSubmitted && isSelected && optIdx !== currentQuestion.correctAnswer;

                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={optIdx}>
                                    <Box
                                        onClick={() => !isSubmitted && setAnswers({ ...answers, [currentStep]: optIdx })}
                                        sx={{
                                            p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            bgcolor: isSelected ? '#161f34' : '#0b1325',
                                            border: isSelected ? '2px solid #86adff' : '1px solid rgba(65, 72, 90, 0.15)',
                                            borderRadius: 3, cursor: isSubmitted ? 'default' : 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isSelected ? '0 0 20px rgba(134, 173, 255, 0.1)' : 'none',
                                            '&:hover': !isSubmitted ? { border: '1px solid rgba(134, 173, 255, 0.4)', bgcolor: '#11192d' } : {}
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: 2,
                                                bgcolor: isSelected ? '#86adff' : '#212c45',
                                                color: isSelected ? '#002c67' : '#86adff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '0.8rem'
                                            }}>
                                                {String.fromCharCode(65 + optIdx)}
                                            </Box>
                                            <Typography sx={{
                                                fontWeight: 500,
                                                color: isSelected ? '#dfe5fc' : '#a4abc0'
                                            }}>
                                                {opt}
                                            </Typography>
                                        </Box>
                                        {(isSelected || isCorrect) && (
                                            <CheckCircleIcon sx={{
                                                color: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#86adff',
                                                fontSize: 20
                                            }} />
                                        )}
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Box>

            {/* Footer Navigation */}
            <Box sx={{
                position: 'fixed', bottom: 0, left: 0, width: '100%',
                bgcolor: 'rgba(7, 14, 25, 0.8)', backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(65, 72, 90, 0.15)', p: 3, zIndex: 100
            }}>
                <Box sx={{ maxWidth: 1024, mx: 'auto', display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        sx={{
                            color: '#6e7589', border: '1px solid rgba(110, 117, 137, 0.2)',
                            px: 4, py: 1.5, fontWeight: 800, borderRadius: 2, fontSize: '0.75rem',
                            '&:hover': { color: '#86adff', borderColor: '#86adff' }
                        }}
                    >
                        НАЗАД
                    </Button>
                    <Button
                        endIcon={<ArrowForwardIcon fontSize="small" />}
                        onClick={handleNext}
                        disabled={answers[currentStep] === undefined}
                        sx={{
                            background: 'linear-gradient(135deg, #86adff, #026fef)',
                            color: '#002c67', px: 5, py: 1.5, fontWeight: 800, borderRadius: 2,
                            fontSize: '0.75rem', boxShadow: '0 0 20px rgba(134, 173, 255, 0.3)',
                            '&:hover': { filter: 'brightness(1.1)' },
                            '&:disabled': { opacity: 0.5, color: '#002c67' }
                        }}
                    >
                        {currentStep === quizData.questions.length - 1 ? 'ЗАВЕРШИТИ ТЕСТ' : 'НАСТУПНЕ ПИТАННЯ'}
                    </Button>
                </Box>
            </Box>

            {/* Background Decoration */}
            <Box sx={{
                position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none',
                opacity: 0.15, backgroundImage: 'radial-gradient(#1b253c 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }} />
        </Box>
    );
}

