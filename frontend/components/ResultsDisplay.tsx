'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Download, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import RiskBadge from './RiskBadge';

interface Explanation {
    summary: string;
    biological_mechanism: string;
    clinical_implication: string;
    dosing_rationale: string;
}

interface Recommendation {
    action: string;
    cpic_alignment: boolean;
}

interface Result {
    drug: string;
    risk_assessment: {
        risk_label: string;
    };
    pharmacogenomic_profile: {
        primary_gene: string;
        diplotype: string;
        phenotype: string;
    };
    clinical_recommendation: Recommendation;
    llm_generated_explanation: Explanation;
}

interface ResultsDisplayProps {
    results: Result[];
}

const ResultCard = ({ result }: { result: Result }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden group"
        >
            {/* Header */}
            <div
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {result.drug}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span className="font-mono text-cyan-200 bg-cyan-900/30 px-2 py-0.5 rounded">
                                {result.pharmacogenomic_profile.primary_gene}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">
                                {result.pharmacogenomic_profile.diplotype}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <RiskBadge risk={result.risk_assessment.risk_label} />
                        <motion.div
                            animate={{ rotate: expanded ? 180 : 0 }}
                            className="text-slate-500"
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Action Banner */}
            <div className="bg-slate-950/50 border-y border-white/5 px-6 py-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Clinical Recommendation
                </h4>
                <p className="text-lg font-medium text-slate-200 leading-relaxed">
                    {result.clinical_recommendation.action}
                </p>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-900/30"
                    >
                        <div className="px-6 pt-4 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider opacity-80">
                                <Sparkles size={14} />
                                <span>LLM Generated Explanation</span>
                            </div>
                        </div>
                        <div className="p-6 pt-2 grid gap-6 md:grid-cols-2 text-sm">
                            <div className="space-y-2">
                                <h5 className="font-semibold text-cyan-400">Biological Mechanism</h5>
                                <p className="text-slate-300 leading-relaxed">
                                    {result.llm_generated_explanation.biological_mechanism}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h5 className="font-semibold text-cyan-400">Clinical Implication</h5>
                                <p className="text-slate-300 leading-relaxed">
                                    {result.llm_generated_explanation.clinical_implication}
                                </p>
                            </div>
                        </div>

                        {/* Per-Drug JSON Data */}
                        <div className="px-6 pb-6 border-t border-white/5 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Result JSON</h5>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-cyan-400 transition-colors"
                                        title="Copy JSON"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
                                            const anchor = document.createElement('a');
                                            anchor.href = dataStr;
                                            anchor.download = `${result.drug.toLowerCase().replace(/\s+/g, '-')}-report.json`;
                                            anchor.click();
                                        }}
                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-cyan-400 transition-colors"
                                        title="Download JSON"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-950 rounded-lg border border-white/10 p-3 overflow-x-auto">
                                <pre className="text-[10px] text-slate-400 font-mono leading-relaxed">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    const [copied, setCopied] = useState(false);

    if (!results.length) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(results, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = "biocyberx-report.json";
        anchor.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Analysis Results
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                        {copied ? "Copied" : "Copy JSON"}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {results.map((result, idx) => (
                    <ResultCard key={`${result.drug}-${idx}`} result={result} />
                ))}
            </div>


        </div>
    );
};

export default ResultsDisplay;
