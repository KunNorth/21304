'use client';

import React from 'react';
import { RegionRow } from '../types/dashboard';

interface RegionalSalesTableProps {
  title: string;
  rows: RegionRow[];
}

export const RegionalSalesTable: React.FC<RegionalSalesTableProps> = ({
  title,
  rows,
}) => {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 card-rounded p-4 shadow-soft border border-slate-100 dark:border-slate-700/60 flex flex-col justify-between overflow-hidden">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>

      <div className="w-full mt-2">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="text-slate-400 font-medium border-b border-slate-100">
              <th className="pb-2 font-medium">Region / Location</th>
              <th className="pb-2 font-medium text-center">Orders / Vol</th>
              <th className="pb-2 font-medium text-right">Net Revenue / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/60 smooth-transition">
                <td className="py-2.5 font-medium text-slate-700 truncate max-w-[120px]">
                  {row.region}
                </td>
                <td className="py-2.5 text-center">
                  <span className="font-bold text-slate-900">{row.orders}</span>
                  <span
                    className={`text-[10px] ml-1 font-bold ${
                      row.isUp ? 'text-emeraldText' : 'text-roseText'
                    }`}
                  >
                    {row.trend}
                  </span>
                </td>
                <td className="py-2.5 text-right font-semibold text-slate-900">
                  {row.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-right">
        <button
          onClick={() => alert('เปิดรายงานสถิติละเอียดของภูมิภาค')}
          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
        >
          View detailed breakdown →
        </button>
      </div>
    </div>
  );
};
