'use client';

import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { validateVcfFile } from '@/utils/validation';

interface FileUploadZoneProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
    error?: string | null;
    onError?: (error: string | null) => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileSelect, selectedFile, error, onError }) => {
    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        // Clear previous errors first
        if (onError) onError(null);

        // Handle rejected files (e.g. wrong type)
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            // Provide specific error if possible
            if (rejection.errors[0]?.code === 'file-invalid-type') {
                if (onError) onError("Invalid file type. Please upload a .vcf or text file.");
            } else {
                if (onError) onError(rejection.errors[0]?.message || "File upload failed.");
            }
            onFileSelect(null);
            return;
        }

        if (acceptedFiles?.length > 0) {
            const file = acceptedFiles[0];

            // Validate
            const validation = await validateVcfFile(file);

            if (!validation.isValid) {
                if (onError) onError(validation.error || "Invalid file");
                onFileSelect(null);
            } else {
                onFileSelect(file);
            }
        }
    }, [onFileSelect, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/vcf': ['.vcf'],
            'text/plain': ['.vcf', '.txt'], // Some systems read VCF as plain text
            'application/octet-stream': ['.vcf']
        },
        maxFiles: 1,
        multiple: false
    });

    const {
        onAnimationStart,
        onDrag,
        onDragStart,
        onDragEnd,
        ...rootProps
    } = getRootProps();

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        key="upload-zone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        {...rootProps}
                        className={`
              relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
              ${isDragActive
                                ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-[1.02]'
                                : error
                                    ? 'border-red-500/50 bg-red-500/5'
                                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                            }
            `}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-4">
                            <div className={`p-4 rounded-full ${isDragActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                                <UploadCloud size={32} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-white">
                                    {isDragActive ? "Drop your VCF file here" : "Upload Genomic Data"}
                                </p>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                    Drag & drop your .vcf file here, or click to browse. Max size 5MB.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-4 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{selectedFile.name}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">
                                    {(selectedFile.size / 1024).toFixed(2)} KB • VALID VCF
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileSelect(null);
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </motion.div>
            )}
        </div>
    );
};

export default FileUploadZone;
