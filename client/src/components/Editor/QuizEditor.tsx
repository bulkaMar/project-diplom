'use client';

import React from 'react';
import { CircularProgress } from '@mui/material';

interface QuizQuestion {
    id: string;
    question: string;
    code?: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

interface QuizEditorProps {
    questions: QuizQuestion[];
    onQuestionsChange: (questions: QuizQuestion[]) => void;
    onSave: () => void;
    saving?: boolean;
}

export default function QuizEditor({ questions, onQuestionsChange, onSave, saving }: QuizEditorProps) {
    const handleAddQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
        };
        onQuestionsChange([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, data: Partial<QuizQuestion>) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], ...data };
        onQuestionsChange(newQuestions);
    };

    const deleteQuestion = (index: number) => {
        onQuestionsChange(questions.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-7xl mx-auto p-10">
            <header className="mb-12 pl-4">
                <div className="flex items-center gap-2 text-primary font-label text-xs tracking-[0.2em] mb-3 uppercase">
                    <span>МОДУЛЬ QUIZ</span>
                    <span className="w-8 h-[1px] bg-outline-variant/30"></span>
                    <span>QUIZ EDITOR</span>
                </div>
                <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight leading-tight">
                    Редактор запитань <br/>
                    <span className="text-[#86adff]/50">С++ Knowledge Check</span>
                </h1>
                <div className="mt-6 flex items-center gap-4">
                    <button 
                        onClick={onSave}
                        disabled={saving}
                        className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">save</span>
                        Зберегти Квіз
                    </button>
                    {saving && <span className="text-xs text-outline animate-pulse">Зберігаємо...</span>}
                </div>
            </header>

            <div className="space-y-12 pb-20">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Section 1: Question Text */}
                        <section className="bg-surface-container-low p-8 rounded-xl border-l-2 border-primary-fixed-dim/20">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block font-label text-[10px] tracking-[0.15em] text-outline uppercase">Питання #{qIndex + 1}</label>
                                <button onClick={() => deleteQuestion(qIndex)} className="text-outline hover:text-error transition-colors">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                            <textarea 
                                value={q.question}
                                onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                                className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-lg p-5 text-on-surface text-lg font-body placeholder:text-outline/40 min-h-[100px] transition-all" 
                                placeholder="Введіть основне питання тут..."
                            />
                        </section>

                        {/* Section 2: Code Snippet (Optional) */}
                        <section className="relative group">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-tertiary/20 rounded-full"></div>
                            <div className="bg-surface-container p-8 rounded-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <label className="font-label text-[10px] tracking-[0.15em] text-outline uppercase flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">code</span>
                                        Фрагмент коду (необов'язково)
                                    </label>
                                </div>
                                <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/10">
                                    <textarea 
                                        value={q.code || ''}
                                        onChange={(e) => updateQuestion(qIndex, { code: e.target.value })}
                                        className="w-full bg-transparent border-none focus:ring-0 p-6 text-secondary font-mono text-sm min-h-[120px] resize-none" 
                                        spellCheck="false"
                                        placeholder="// Вставте код тут..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Answers */}
                        <section className="bg-surface-container-low p-8 rounded-xl">
                            <label className="block font-label text-[10px] tracking-[0.15em] text-outline mb-6 uppercase">Варіанти відповідей (Оберіть одну вірну)</label>
                            <div className="space-y-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-4 group">
                                        <button className="w-10 h-10 rounded-full border-2 border-outline-variant/30 flex items-center justify-center text-outline">
                                            <span className="text-xs font-bold font-headline">{String.fromCharCode(65 + oIndex)}</span>
                                        </button>
                                        <input 
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...q.options];
                                                newOpts[oIndex] = e.target.value;
                                                updateQuestion(qIndex, { options: newOpts });
                                            }}
                                            className="flex-1 bg-surface-container-high border-none rounded-lg px-6 py-4 text-on-surface font-body focus:ring-2 focus:ring-primary-fixed-dim/30" 
                                            placeholder={`Варіант ${String.fromCharCode(65 + oIndex)}`}
                                            type="text" 
                                        />
                                        <button 
                                            onClick={() => updateQuestion(qIndex, { correctAnswer: oIndex })}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                q.correctAnswer === oIndex 
                                                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(134,173,255,0.4)]' 
                                                : 'border-2 border-outline-variant/10 text-outline/30 hover:border-primary-dim/40'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: q.correctAnswer === oIndex ? "'FILL' 1" : "'FILL' 0" }}>
                                                {q.correctAnswer === oIndex ? 'check_circle' : 'circle'}
                                            </span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 4: Technical Tip / Explanation */}
                        <section className="bg-[#1b253c]/40 backdrop-blur-md p-8 rounded-xl border border-primary/10">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">lightbulb</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block font-label text-[10px] tracking-[0.15em] text-primary mb-3 uppercase">Пояснення (Показується при помилці)</label>
                                    <textarea 
                                        value={q.explanation || ''}
                                        onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                                        className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/40 rounded-lg p-4 text-on-surface font-body text-sm placeholder:text-outline/30 min-h-[80px]" 
                                        placeholder="Поясніть правильну відповідь..."
                                    />
                                </div>
                            </div>
                        </section>
                        <hr className="border-outline-variant/10" />
                    </div>
                ))}

                <button 
                    onClick={handleAddQuestion}
                    className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-xl text-outline hover:text-primary hover:border-primary/40 transition-all font-bold headline-font flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Додати питання
                </button>
            </div>
        </div>
    );
}
