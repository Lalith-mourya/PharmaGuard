'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, ArrowDown } from 'lucide-react';

export interface ProcessingStep {
    step_id: string;
    step_title: string;
    backend_action: string;
    user_visible_message: string;
    status: 'pending' | 'in_progress' | 'completed';
    estimated_duration_ms: number;
}

interface ProcessingTimelineProps {
    steps: ProcessingStep[];
    currentStepIndex: number;
}

const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({ steps, currentStepIndex }) => {
    return (
        <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 h-full overflow-hidden flex flex-col">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Loader2 className="animate-spin text-cyan-400" size={24} />
                    Processing Genomic Data
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    Running strict CPIC guideline analysis pipeline...
                </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isPending = index > currentStepIndex;

                    return (
                        <div key={step.step_id} className="relative pl-8">
                            {/* Vertical Line */}
                            {index !== steps.length - 1 && (
                                <div className={`absolute left-[11px] top-6 bottom-[-24px] w-0.5 ${isCompleted ? 'bg-cyan-500/50' : 'bg-slate-800'}`} />
                            )}

                            {/* Icon */}
                            <div className={`absolute left-0 top-1 rounded-full p-0.5 border ${isCompleted ? 'bg-cyan-500 border-cyan-500 text-black' :
                                    isCurrent ? 'bg-slate-900 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' :
                                        'bg-slate-900 border-slate-700 text-slate-700'
                                }`}>
                                {isCompleted ? (
                                    <CheckCircle2 size={16} />
                                ) : isCurrent ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Circle size={16} />
                                )}
                            </div>

                            {/* Content */}
                            <motion.div
                                initial={false}
                                animate={{ opacity: isPending ? 0.5 : 1, x: 0 }}
                                className={`space-y-1 ${isCurrent ? 'mb-2' : ''}`}
                            >
                                <h4 className={`text-sm font-semibold ${isCurrent ? 'text-cyan-400' :
                                        isCompleted ? 'text-slate-300' : 'text-slate-500'
                                    }`}>
                                    {step.step_title}
                                </h4>

                                {isCurrent && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded-lg border border-white/5"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 text-cyan-200/80">
                                            <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                            {step.user_visible_message}
                                        </div>
                                        <div className="font-mono text-slate-500 text-[10px] mt-1 border-t border-white/5 pt-1">
                                            {`> ${step.backend_action}`}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-xs text-slate-500 animate-pulse">
                    Analysis usually takes 5-10 seconds
                </p>
            </div>
        </div>
    );
};

export default ProcessingTimeline;
