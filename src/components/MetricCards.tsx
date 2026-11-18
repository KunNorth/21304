'use client';

import React from 'react';
import { KPICard } from '../types/dashboard';

export const SingleMetricCard: React.FC<{
  kpi: KPICard;
  className?: string;
  showSparkline?: boolean;
}> = ({ kpi, className = '', showSparkline = true }) => {
  const strokeColor = kpi.isGreen ? '#10b981' : '#f43f5e';
  const fillColor = kpi.isGreen ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';
  const linePath = kpi.isGreen
    ? 'M 0 24 C 25 27, 45 17, 70 19 C 95 21, 115 11, 145 9 C 175 7, 195 13, 220 4 L 220 35 L 0 35 Z'
    : 'M 0 7 C 25 9, 45 15, 70 13 C 95 11, 115 21, 145 23 C 175 25, 195 19, 220 29 L 220 35 L 0 35 Z';
  const curvePath = kpi.isGreen
    ? 'M 0 24 C 25 27, 45 17, 70 19 C 95 21, 115 11, 145 9 C 175 7, 195 13, 220 4'
    : 'M 0 7 C 25 9, 45 15, 70 13 C 95 11, 115 21, 145 23 C 175 25, 195 19, 220 29';

  return (
    <div className={`h-full w-full flex flex-col justify-between p-3.5 relative overflow-hidden select-none ${className}`}>
      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[130px]">
          {kpi.label}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            kpi.isGreen
              ? 'bg-emeraldPill dark:bg-emerald-950/60 text-emeraldText dark:text-emerald-400'
              : 'bg-rosePill dark:bg-rose-950/60 text-roseText dark:text-rose-400'
          }`}
        >
          {kpi.badge}
        </span>
      </div>

      <div className="mt-1 z-10 flex-1 flex flex-col justify-end">
        <div className="flex items-baseline gap-1">
          <span className="text-xl xl:text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            {kpi.value}
          </span>
          <span className={`text-xs font-bold ${kpi.isGreen ? 'text-emeraldText dark:text-emerald-400' : 'text-roseText dark:text-rose-400'}`}>
            {kpi.arrow}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium truncate mt-0.5">
          {kpi.sub}
        </p>
      </div>

      {showSparkline && (
        <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none opacity-80">
          <svg viewBox="0 0 220 35" preserveAspectRatio="none" className="w-full h-full">
            <path d={linePath} fill={fillColor} />
            <path d={curvePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

interface MetricCardsProps {
  kpis: [KPICard, KPICard, KPICard, KPICard, KPICard];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ kpis }) => {
  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {kpis.map((kpi, idx) => (
        <div
          key={kpi.id || idx}
          className={`bg-white dark:bg-slate-800 card-rounded shadow-soft border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between hover:shadow-md smooth-transition ${
            idx === 4 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <SingleMetricCard kpi={kpi} />
        </div>
      ))}
    </section>
  );
};
