'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface StudioLayoutProps {
    children: React.ReactNode;
    courseTitle?: string;
    activeMode?: 'THEORY' | 'QUIZ' | 'PRACTICE';
    onModeChange?: (mode: 'THEORY' | 'QUIZ' | 'PRACTICE') => void;
    onPublish: () => void;
    onPreview: () => void;
    onNewModule: () => void;
    modules: any[];
    publishButtonLabel?: string;
}

export default function StudioLayout({ 
    children, 
    courseTitle, 
    activeMode, 
    onModeChange,
    onPublish,
    onPreview,
    onNewModule,
    modules,
    publishButtonLabel = "Опублікувати"
}: StudioLayoutProps) {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="bg-[#070e1e] text-[#dfe5fc] min-h-screen font-body flex flex-col">
            <div className="flex flex-1">
                {/* SideNavBar - Adjusted to start from top-0 */}
                <aside className="w-56 fixed left-0 top-0 bottom-0 bg-[#0b1325] flex flex-col py-6 px-4 z-40 border-r border-outline-variant/10">
                    <div className="mb-8 px-2">
                        <div 
                            className="flex items-center gap-3 mb-1 cursor-pointer group"
                            onClick={() => {
                                const backPath = user?.role === 'ADMIN' ? '/dashboard/admin/courses' : '/dashboard/editor';
                                router.push(backPath);
                            }}
                        >
                            <div className="w-8 h-8 bg-primary-container/20 rounded flex items-center justify-center group-hover:bg-primary-container/40 transition-colors">
                                <span className="material-symbols-outlined text-primary text-lg">arrow_back</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-[#dfe5fc] headline-font truncate" title={courseTitle}>{courseTitle || 'Завантаження...'}</h2>
                                <p className="text-[10px] text-[#6e7589] headline-font tracking-widest uppercase">Редактор курсу</p>
                            </div>
                        </div>
                    </div>
 
                    {/* Action Buttons Integrated into Sidebar */}
                    <div className="flex flex-col gap-4 mb-8">
                        <button 
                            onClick={onPreview}
                            className="flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#86adff] bg-surface-container rounded-lg hover:bg-surface-container-high transition-all active:scale-95 headline-font border border-outline-variant/10"
                        >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Прев'ю
                        </button>
                        <button 
                            onClick={onPublish}
                            className="flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(134,173,255,0.2)] active:scale-95 transition-all headline-font"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">save</span>
                            {publishButtonLabel}
                        </button>
                    </div>

                    <nav className="flex-grow space-y-1">
                        {onModeChange && (
                            <>
                                <button 
                                    onClick={() => onModeChange('THEORY')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 headline-font rounded-lg ${
                                        activeMode === 'THEORY' 
                                        ? 'text-[#86adff] bg-[#11192d] font-bold border-r-4 border-[#86adff]' 
                                        : 'text-[#6e7589] hover:text-[#dfe5fc] hover:bg-[#161f34]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">menu_book</span>
                                    <span>Теорія</span>
                                </button>
                                <button 
                                    onClick={() => onModeChange('QUIZ')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 headline-font rounded-lg ${
                                        activeMode === 'QUIZ' 
                                        ? 'text-[#86adff] bg-[#11192d] font-bold border-r-4 border-[#86adff]' 
                                        : 'text-[#6e7589] hover:text-[#dfe5fc] hover:bg-[#161f34]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">quiz</span>
                                    <span>Квіз</span>
                                </button>
                                <button 
                                    onClick={() => onModeChange('PRACTICE')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 headline-font rounded-lg ${
                                        activeMode === 'PRACTICE' 
                                        ? 'text-[#86adff] bg-[#11192d] font-bold border-r-4 border-[#86adff]' 
                                        : 'text-[#6e7589] hover:text-[#dfe5fc] hover:bg-[#161f34]'
                                    }`}
                                >
                                    <span className="material-symbols-outlined">code</span>
                                    <span>Практика</span>
                                </button>
                            </>
                        )}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-outline-variant/10 font-['Inter']">
                        <button 
                            onClick={onNewModule}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-surface-bright text-primary text-sm font-bold rounded-lg hover:bg-surface-container-high transition-colors headline-font shadow-lg shadow-black/20"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Новий модуль
                        </button>
                    </div>
                </aside>

                {/* Main Content - Added overflow-y-auto and h-screen for proper scrolling */}
                <main className="ml-56 flex-1 bg-[#070e1e] h-screen overflow-y-auto relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
