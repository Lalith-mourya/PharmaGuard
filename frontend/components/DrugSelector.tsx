'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Pill, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrugSelectorProps {
    selectedDrugs: string[];
    setSelectedDrugs: (drugs: string[]) => void;
}

const PREDEFINED_DRUGS = [
    "Codeine", "Warfarin", "Clopidogrel", "Simvastatin",
    "Tramadol", "Tamoxifen", "Fluorouracil"
];

const DrugSelector: React.FC<DrugSelectorProps> = ({ selectedDrugs, setSelectedDrugs }) => {
    const [inputValue, setInputValue] = useState("");

    const addDrug = (drug: string) => {
        const trimmed = drug.trim();
        if (trimmed && !selectedDrugs.includes(trimmed)) {
            setSelectedDrugs([...selectedDrugs, trimmed]);
        }
        setInputValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addDrug(inputValue);
        }
    };

    const removeDrug = (drug: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
    };

    return (
        <div className="w-full space-y-4">
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type drug name and press Enter..."
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors text-white placeholder-slate-400 pr-12"
                />
                <button
                    onClick={() => addDrug(inputValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-cyan-400 hover:text-white transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Recommended Tags */}
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold py-1">Common:</span>
                {PREDEFINED_DRUGS.map(drug => (
                    <button
                        key={drug}
                        onClick={() => addDrug(drug)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-white/5 transition-all"
                    >
                        {drug}
                    </button>
                ))}
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
                <AnimatePresence>
                    {selectedDrugs.map(drug => (
                        <motion.div
                            key={drug}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 px-3 py-1.5 rounded-lg flex items-center gap-2"
                        >
                            <Pill size={14} />
                            <span className="font-medium">{drug}</span>
                            <button
                                onClick={() => removeDrug(drug)}
                                className="hover:text-white transition-colors ml-1"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DrugSelector;
