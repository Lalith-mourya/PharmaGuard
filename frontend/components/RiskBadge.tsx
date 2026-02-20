import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface RiskBadgeProps {
    risk: string;
    className?: string;
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, className }) => {
    const normalizedRisk = risk?.toLowerCase() || 'unknown';

    const config = {
        safe: {
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            icon: ShieldCheck,
            label: 'Safe to Use'
        },
        'adjust dosage': {
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10 border-yellow-500/20',
            icon: AlertTriangle,
            label: 'Adjust Dosage'
        },
        toxic: {
            color: 'text-rose-500',
            bg: 'bg-rose-500/10 border-rose-500/20',
            icon: AlertOctagon,
            label: 'High Risk'
        },
        ineffective: {
            color: 'text-rose-500',
            bg: 'bg-rose-500/10 border-rose-500/20',
            icon: AlertOctagon,
            label: 'Ineffective'
        },
        unknown: {
            color: 'text-slate-400',
            bg: 'bg-slate-500/10 border-slate-500/20',
            icon: Info,
            label: 'Unknown Risk'
        }
    };

    const style = config[normalizedRisk as keyof typeof config] || config.unknown;
    const Icon = style.icon;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm shadow-sm",
            style.bg,
            style.color,
            className
        )}>
            <Icon size={16} />
            <span className="font-bold text-xs uppercase tracking-wide">{style.label}</span>
        </div>
    );
};

export default RiskBadge;
