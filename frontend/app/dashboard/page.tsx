'use client';

import React, { useState } from 'react';
import { Activity, Zap, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import FileUploadZone from '@/components/FileUploadZone';
import DrugSelector from '@/components/DrugSelector';
import ResultsDisplay from '@/components/ResultsDisplay';
import ProcessingTimeline from '@/components/ProcessingTimeline';
import { analyzeData } from '@/utils/api';

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [drugs, setDrugs] = useState<string[]>([]);
    const [results, setResults] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Timeline state
    const [processingSteps, setProcessingSteps] = useState<any[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Initial timeline steps
    const INITIAL_STEPS = [
        {
            "step_id": "file_validation",
            "step_title": "Validating File",
            "backend_action": "Targeted VCF integrity check and header parsing",
            "user_visible_message": "Verifying your genomic file format...",
            "status": "pending",
            "estimated_duration_ms": 800
        },
        {
            "step_id": "vcf_parsing",
            "step_title": "Parsing Genome",
            "backend_action": "Streaming VCF read for chromosome 10 (CYP2C19)",
            "user_visible_message": "Reading genomic structure...",
            "status": "pending",
            "estimated_duration_ms": 1200
        },
        {
            "step_id": "variant_extraction",
            "step_title": "Extracting Variants",
            "backend_action": "Indexing SNPs at positions 94762601-94780400",
            "user_visible_message": "Isolating key genetic markers...",
            "status": "pending",
            "estimated_duration_ms": 800
        },
        {
            "step_id": "drug_gene_mapping",
            "step_title": "Linking Pathways",
            "backend_action": "Querying CPIC database for drug-gene pairs",
            "user_visible_message": "Connecting drug to metabolic pathways...",
            "status": "pending",
            "estimated_duration_ms": 400
        },
        {
            "step_id": "variant_filtering",
            "step_title": "Filtering Noise",
            "backend_action": "Removing low-quality calls (<Q30) and non-coding variants",
            "user_visible_message": "Refining genetic data quality...",
            "status": "pending",
            "estimated_duration_ms": 600
        },
        {
            "step_id": "star_allele_mapping",
            "step_title": "Matching Alleles",
            "backend_action": "Comparing extracted variants against defining star alleles",
            "user_visible_message": "Identifying your specific gene versions...",
            "status": "pending",
            "estimated_duration_ms": 700
        },
        {
            "step_id": "diplotype_computation",
            "step_title": "Determining Diplotype",
            "backend_action": "Combinatorial phasing of mapped alleles",
            "user_visible_message": "Constructing your genetic profile...",
            "status": "pending",
            "estimated_duration_ms": 500
        },
        {
            "step_id": "phenotype_inference",
            "step_title": "Predicting Phenotype",
            "backend_action": "Calculating activity score based on diplotype function",
            "user_visible_message": "Evaluating metabolic enzyme activity...",
            "status": "pending",
            "estimated_duration_ms": 300
        },
        {
            "step_id": "risk_classification",
            "step_title": "Assessing Risk",
            "backend_action": "Applying CPIC guideline rules to predicted phenotype",
            "user_visible_message": "Analyzing potential drug risks...",
            "status": "pending",
            "estimated_duration_ms": 600
        },
        {
            "step_id": "recommendation_generation",
            "step_title": "Finalizing Report",
            "backend_action": "Synthesizing clinical report and actionable insights",
            "user_visible_message": "Generating personalized recommendations...",
            "status": "pending",
            "estimated_duration_ms": 900
        }
    ];

    const runSimulation = async () => {
        setProcessingSteps(INITIAL_STEPS);
        setCurrentStepIndex(0);

        for (let i = 0; i < INITIAL_STEPS.length; i++) {
            setCurrentStepIndex(i);
            const duration = INITIAL_STEPS[i].estimated_duration_ms;
            // Add some randomness to make it feel real
            const actualDuration = duration * (0.8 + Math.random() * 0.4);
            await new Promise(r => setTimeout(r, actualDuration));
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload a VCF file.");
            return;
        }
        if (drugs.length === 0) {
            setError("Please select at least one drug.");
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        // Start simulation
        // We throw away the promise so it runs in parallel with the fetch
        const simulationPromise = runSimulation();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('drug_name', drugs.join(','));

        try {
            const data = await analyzeData(formData);
            // Ensure simulation completes or jumps to end
            await simulationPromise;
            setResults(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between pb-8 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
                            <Activity className="text-cyan-400" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">BIOCYBERX</span>
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </header>

                <main className="grid lg:grid-cols-12 gap-8">

                    {/* Left Panel: Input */}
                    <section className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8 space-y-8 h-full">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Analysis Parameters</h2>
                                <p className="text-slate-400 text-sm">Upload genomic data and select medications to screen for potential risks.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">1. Genomic Data (VCF)</label>
                                    <FileUploadZone
                                        onFileSelect={setFile}
                                        selectedFile={file}
                                        error={error && !file ? error : null}
                                        onError={setError}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">2. Medications</label>
                                    <DrugSelector
                                        selectedDrugs={drugs}
                                        setSelectedDrugs={setDrugs}
                                    />
                                    {error && drugs.length === 0 && (
                                        <p className="text-sm text-red-400 flex items-center gap-2 animate-pulse">
                                            Please enter at least one drug.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !file}
                                    className={`
                    w-full py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg shadow-cyan-500/20
                    flex items-center justify-center gap-3 transition-all transform active:scale-95
                    ${loading || !file
                                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                                        }
                  `}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} className={loading ? "" : "fill-current"} />
                                            Analyze Pharmacogenomic Risk
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Panel: Results */}
                    <section className="lg:col-span-7">
                        {loading ? (
                            <ProcessingTimeline
                                steps={processingSteps}
                                currentStepIndex={currentStepIndex}
                            />
                        ) : results ? (
                            <ResultsDisplay results={results} />
                        ) : (
                            <div className="h-full min-h-[500px] bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center p-12 border-dashed border-white/10">
                                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                                    <ShieldCheck size={48} className="text-slate-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-300 mb-2">Ready for Analysis</h3>
                                <p className="text-slate-500 max-w-sm">
                                    Results will appear here after you submit your genomic data and selected medications.
                                </p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
