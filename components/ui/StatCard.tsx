
import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, className }) => {
    return (
        <div className={twMerge(clsx("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-2", className))}>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                {icon}
                {label}
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    );
};
