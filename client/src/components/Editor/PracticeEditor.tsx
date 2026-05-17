'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { CircularProgress, Tooltip, IconButton } from '@mui/material';

interface TestCase {
    id?: string;
    name: string;
    input: string;
    output: string;
    points: number;
    isHidden?: boolean;
    explanation?: string;
}

interface PracticeEditorProps {
    courseTitle: string;
    taskDescription: string;
    onDescriptionChange: (desc: string) => void;
    testCases: TestCase[];
    onTestCasesChange: (cases: TestCase[]) => void;
    templateCode: string;
    onCodeChange: (code: string) => void;
    difficulty: string;
    onDifficultyChange: (diff: string) => void;
    onSave: () => void;
    saving?: boolean;
}

export default function PracticeEditor({ 
    courseTitle, 
    taskDescription, 
    onDescriptionChange,
    testCases, 
    onTestCasesChange,
    templateCode,
    onCodeChange,
    difficulty,
    onDifficultyChange,
    onSave,
    saving
}: PracticeEditorProps) {

    const addTestCase = () => {
        onTestCasesChange([...testCases, { 
            id: Math.random().toString(36).substr(2, 9),
            name: `Тест #${testCases.length + 1}`,
            input: '', 
            output: '',
            points: 10, // Hidden but kept for consistency
            isHidden: false
        }]);
    };

    const updateTestCase = (index: number, data: Partial<TestCase>) => {
        const newCases = [...testCases];
        newCases[index] = { ...newCases[index], ...data };
        onTestCasesChange(newCases);
    };

    const deleteTestCase = (index: number) => {
        onTestCasesChange(testCases.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-full bg-[#070e1e]">
            {/* Header Section */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-outline-variant/10 bg-[#0b1325]">
                <div>
                    <span className="text-[10px] text-outline font-bold uppercase tracking-widest">{courseTitle} • ПРАКТИКА</span>
                    <h1 className="headline-font text-2xl font-bold text-on-surface">C++ Practice Studio</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onSave}
                        disabled={saving}
                        className="px-8 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <CircularProgress size={16} color="inherit" /> : <span className="material-symbols-outlined text-sm">save</span>}
                        Зберегти Завдання
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Task & Tests */}
                <div className="w-[45%] border-r border-outline-variant/10 flex flex-col overflow-y-auto bg-surface-dim/20 scrollbar-thin">
                    <div className="p-8 space-y-10">
                        {/* Description */}
                        <section className="space-y-4">
                            <h3 className="headline-font font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Умова задачі
                            </h3>
                            <textarea 
                                value={taskDescription}
                                onChange={(e) => onDescriptionChange(e.target.value)}
                                className="w-full bg-[#0b1325] border border-outline-variant/10 rounded-xl p-6 text-on-surface leading-relaxed min-h-[300px] resize-none text-md focus:ring-1 focus:ring-primary/40 scrollbar-hide" 
                                placeholder="Опишіть завдання (підтримується Markdown)..."
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-outline tracking-widest uppercase mb-2">Складність</label>
                                    <select 
                                        value={difficulty}
                                        onChange={(e) => onDifficultyChange(e.target.value)}
                                        className="w-full bg-[#0b1325] border border-outline-variant/10 rounded-lg text-sm text-on-surface focus:ring-primary/40 py-2 px-3"
                                    >
                                        <option value="BASIC">Початкова</option>
                                        <option value="STANDARD">Середня</option>
                                        <option value="ADVANCED">Просунута</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <hr className="border-outline-variant/10" />

                        {/* Test Suite Manager */}
                        <section className="space-y-6 pb-20">
                            <div className="flex items-center justify-between">
                                <h3 className="headline-font font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">data_check</span>
                                    Менеджер тестів
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={addTestCase} className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2 transition-all">
                                        <span className="material-symbols-outlined text-sm">add_circle</span> Додати тест
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {testCases.map((tc, index) => (
                                    <div key={index} className="bg-[#0b1325] rounded-xl border border-outline-variant/10 overflow-hidden group shadow-sm">
                                        <div className="px-5 py-3 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/5">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    value={tc.name}
                                                    onChange={(e) => updateTestCase(index, { name: e.target.value })}
                                                    className="bg-transparent border-none p-0 text-sm font-bold text-on-surface focus:ring-0 w-40"
                                                    placeholder="Назва тесту..."
                                                />
                                            </div>
                                            <button onClick={() => deleteTestCase(index)} className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                        <div className="p-5 grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="block text-[9px] font-bold text-outline uppercase tracking-widest pl-1">Вхідні дані (Input)</label>
                                                <textarea 
                                                    value={tc.input}
                                                    onChange={(e) => updateTestCase(index, { input: e.target.value })}
                                                    className="w-full bg-[#070e1e] p-4 rounded-lg font-mono text-xs text-secondary border border-outline-variant/5 focus:ring-1 focus:ring-primary/30 min-h-[100px] resize-none" 
                                                    placeholder="stdin..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[9px] font-bold text-outline uppercase tracking-widest pl-1">Очікуваний результат (Output)</label>
                                                <textarea 
                                                    value={tc.output}
                                                    onChange={(e) => updateTestCase(index, { output: e.target.value })}
                                                    className="w-full bg-[#070e1e] p-4 rounded-lg font-mono text-xs text-tertiary border border-outline-variant/5 focus:ring-1 focus:ring-primary/30 min-h-[100px] resize-none" 
                                                    placeholder="stdout..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {testCases.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-outline-variant/10 rounded-2xl flex flex-col items-center gap-4 text-outline/40">
                                        <span className="material-symbols-outlined text-5xl">fact_check</span>
                                        <p className="headline-font font-bold">Додайте перший тест для перевірки</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Side: Reference Code */}
                <div className="flex-1 flex flex-col bg-[#0d172a]">
                    <div className="bg-surface-container-high px-6 py-3 flex items-center justify-between border-b border-outline-variant/10">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest headline-font">Шаблон коду</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="cpp"
                            theme="vs-dark"
                            value={templateCode}
                            onChange={(val) => onCodeChange(val || '')}
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 20 },
                                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                                smoothScrolling: true,
                                lineNumbers: 'on',
                                renderLineHighlight: 'all',
                                roundedSelection: true
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
