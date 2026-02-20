'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FRAME_COUNT = 242;
const SCROLL_HEIGHT = 4000; // 400vh equivalent in pixels (approx)

export default function ScrollSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 30,
        restDelta: 0.001
    });

    // --- Image Preloading ---
    useEffect(() => {
        const loadImages = async () => {
            const loadedImages: HTMLImageElement[] = [];
            const promises = [];

            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                // Pad with zeros: 001, 002, ... 242
                const filename = `ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
                img.src = `/frames/${filename}`;

                const promise = new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => {
                        console.warn(`Failed to load frame: ${filename}`);
                        resolve(); // Resolve anyway to avoid blocking
                    };
                });

                promises.push(promise);
                loadedImages.push(img);
            }

            await Promise.all(promises);
            setImages(loadedImages);
            setLoaded(true);
        };

        loadImages();
    }, []);

    // --- Canvas Rendering Loop ---
    useEffect(() => {
        if (!loaded || !canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize: alpha: false
        if (!ctx) return;

        // Set high-DPI canvas
        const updateDimensions = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Initial Draw
            const firstImg = images[0];
            const scale = Math.max(canvas.width / firstImg.width, canvas.height / firstImg.height);
            const x = (canvas.width / 2) - (firstImg.width / 2) * scale;
            const y = (canvas.height / 2) - (firstImg.height / 2) * scale;
            ctx.drawImage(firstImg, x, y, firstImg.width * scale, firstImg.height * scale);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        // Render loop based on smooth scroll progress
        const render = () => {
            const progress = smoothProgress.get();
            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(progress * (FRAME_COUNT - 1))
            );

            const img = images[frameIndex];
            if (img) {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;

                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before draw? Actually drawImage covers it if aspect ratio handled.
                // Using cover strategy
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }

            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            cancelAnimationFrame(animationId);
        };
    }, [loaded, images, smoothProgress]);


    // --- Text Animation Logic ---

    // 1. Hero Title Reveal (0 - 25%)
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.1]);
    const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50]);

    // 2. Problem Statement Narratives
    const text1Opacity = useTransform(scrollYProgress, [0.25, 0.30, 0.35, 0.40], [0, 1, 1, 0]); // Adverse drug reactions
    const text2Opacity = useTransform(scrollYProgress, [0.40, 0.45, 0.50, 0.55], [0, 1, 1, 0]); // Traditional prescribing
    const text3Opacity = useTransform(scrollYProgress, [0.55, 0.60, 0.65, 0.70], [0, 1, 1, 0]); // One variant
    const text4Opacity = useTransform(scrollYProgress, [0.70, 0.75, 0.80, 0.85], [0, 1, 1, 0]); // Our AI decodes
    const text5Opacity = useTransform(scrollYProgress, [0.85, 0.90, 0.95, 1.0], [0, 1, 1, 0]); // Precision medicine

    // CTA Section Visibility (After scroll ends)
    // Actually, the prompt says "FINAL CTA SECTION After scroll sequence ends".
    // So we can put it below the h-[400vh] container or at the very end.
    // Let's create a separate visual block for it relative to progress, or just stack it after.

    return (
        <div className="bg-black relative">

            {/* Loading State */}
            <AnimatePresence>
                {!loaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                            <p className="tracking-widest text-xs uppercase text-slate-500">Loading Experience</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll Container */}
            <div ref={containerRef} className="h-[500vh] relative">

                {/* Sticky Canvas Layer */}
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* 1. Hero Title Overlay */}
                    <motion.div
                        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4"
                    >
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4">
                            BIOCYBERX
                        </h1>
                        <p className="text-xl md:text-2xl text-cyan-400/80 font-light tracking-widest uppercase">
                            AI-Powered Pharmacogenomic Risk Intelligence
                        </p>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute bottom-12 text-slate-500"
                        >
                            <ChevronDown />
                        </motion.div>
                    </motion.div>

                    {/* 2. Narrative Overlays */}
                    {/* Common styles for narrative text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 px-6">

                        <motion.h2
                            style={{ opacity: text1Opacity }}
                            className="absolute text-3xl md:text-5xl font-medium text-white text-center max-w-4xl leading-tight"
                        >
                            Adverse drug reactions remain one of the leading causes of preventable clinical harm.
                        </motion.h2>

                        <motion.h2
                            style={{ opacity: text2Opacity }}
                            className="absolute text-3xl md:text-5xl font-medium text-white text-center max-w-4xl leading-tight"
                        >
                            Traditional prescribing ignores genetic variability hidden within a patient’s DNA.
                        </motion.h2>

                        <motion.h2
                            style={{ opacity: text3Opacity }}
                            className="absolute text-3xl md:text-5xl font-medium text-white text-center max-w-4xl leading-tight"
                        >
                            One variant can transform a safe drug into a toxic risk.
                        </motion.h2>

                        <motion.h2
                            style={{ opacity: text4Opacity }}
                            className="absolute text-3xl md:text-5xl font-medium text-white text-center max-w-4xl leading-tight"
                        >
                            Our AI decodes genomic variants from VCF files and maps them to drug-specific risk.
                        </motion.h2>

                        <motion.h2
                            style={{ opacity: text5Opacity }}
                            className="absolute text-3xl md:text-5xl font-medium text-white text-center max-w-4xl leading-tight"
                        >
                            Precision medicine is no longer the future. It is now.
                        </motion.h2>
                    </div>

                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
                </div>
            </div>

            {/* 4. Final CTA Section (After Scroll) */}
            <section className="h-screen bg-black flex flex-col items-center justify-center relative z-30 border-t border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center space-y-8 px-6"
                >
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                        Ready to Analyze <br /> Your Genetic Risk?
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        Upload your genomic data and receive drug-specific precision insights immediately.
                    </p>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-cyan-50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                    >
                        Launch Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

                <footer className="absolute bottom-8 text-center w-full">
                    <p className="text-slate-600 text-sm tracking-widest uppercase">
                        Built for the Era of Precision Medicine.
                    </p>
                </footer>
            </section>

        </div>
    );
}
