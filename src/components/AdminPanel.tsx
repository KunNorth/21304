'use client';

import React, { useState } from 'react';
import { UserAccount, SystemTabKey, SiteKey } from '../types/dashboard';
import { ALL_SYSTEMS_LIST, ALL_SITES_LIST } from '../data/permissions';
import { ThemeToggle } from './ThemeToggle';

type AdminSection = 'orgs' | 'users' | 'dev' | 'logs';

interface AdminPanelProps {
  onBack: () => void;
  users: UserAccount[];
  onUpdateUser: (userId: string, updates: Partial<Pick<UserAccount, 'allowedSites' | 'allowedSystems' | 'status'>>) => void;
  onViewAsUser?: (userId: string) => void;
}

const ORGS = [
  { name: 'Rittha Co., Ltd.',              sites: 7, systems: 10, users: 42, status: 'Active' },
  { name: 'ThaiPattana Construction',       sites: 3, systems: 5,  users: 18, status: 'Active' },
  { name: 'Mega Project Co., Ltd.',         sites: 1, systems: 3,  users: 8,  status: 'Trial'  },
];

const DEVS = [
  { name: 'Nontawat Rakthai',  system: 'VMS (Rittha HQ)',     method: 'REST API', status: 'Connected', lastSync: '2 min ago'  },
  { name: 'Suphakit Wiangsaa', system: 'Time Attendance',      method: 'MCP',      status: 'Connected', lastSync: '5 min ago'  },
  { name: 'Kitti Chuenchom',   system: 'Finance ERP',          method: 'REST API', status: 'Pending',   lastSync: 'Awaiting'   },
];

const LOGS = [
  { time: '10:42:03', level: 'INFO',  msg: 'User Worapol signed in via Time Attendance, site Muangthong' },
  { time: '10:38:17', level: 'INFO',  msg: 'Dev Nontawat synced VMS HQ data (1,420 records)' },
  { time: '10:35:00', level: 'WARN',  msg: 'API rate limit 80% reached on Finance ERP (Rittha)' },
  { time: '10:30:12', level: 'INFO',  msg: 'User Piyawat opened War Room Dashboard' },
  { time: '10:12:55', level: 'INFO',  msg: 'Admin added new org: Mega Project Co., Ltd.' },
  { time: '09:50:40', level: 'ERROR', msg: 'Connection timeout on HR system, site Chiangmai (retry succeeded)' },
];

const NAV_ITEMS: { key: AdminSection; label: string }[] = [
  { key: 'users', label: 'User Access & Permissions' },
  { key: 'orgs',  label: 'Organizations' },
  { key: 'dev',   label: 'Developers'    },
  { key: 'logs',  label: 'System Log'    },
];

const NAV_ICONS: Record<AdminSection, React.ReactNode> = {
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  orgs: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  dev: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  logs: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

const SYSTEM_LABELS: Record<SystemTabKey, string> = {
  overview: 'ภาพรวมระบบ (Overview)',
  warroom: 'War Room (จอมอนิเตอร์สด)',
  vms: 'ระบบ VMS (ผู้มาติดต่อ)',
  attendance: 'ระบบลงเวลา (Attendance)',
  finance: 'ระบบการเงิน (Finance)',
  hr: 'ระบบ HR (บุคคล)',
  crm: 'ระบบ CRM (ลูกค้าสัมพันธ์)',
  cms: 'ระบบ CMS (เนื้อหา)',
};

const SITE_LABELS: Record<SiteKey, string> = {
  all: 'ทุกไซต์งาน (All Sites)',
  hq: 'สำนักงานใหญ่ (HQ)',
  muangthong: 'ไซต์เมืองทอง',
  phuket: 'ไซต์ภูเก็ต',
  chiangmai: 'ไซต์เชียงใหม่',
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, users, onUpdateUser, onViewAsUser }) => {
  const [section, setSection] = useState<AdminSection>('users');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [lastUpdatedNotice, setLastUpdatedNotice] = useState<string | null>(null);

  const notifyChange = (msg: string) => {
    setLastUpdatedNotice(msg);
    setTimeout(() => setLastUpdatedNotice(null), 3000);
  };

  const toggleSystem = (userId: string, system: SystemTabKey) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const has = user.allowedSystems.includes(system);
    const next = has
      ? user.allowedSystems.filter((s) => s !== system)
      : [...user.allowedSystems, system];
    onUpdateUser(userId, { allowedSystems: next });
    notifyChange(`อัปเดตระบบของ ${user.name}: ${has ? 'ยกเลิก' : 'อนุญาต'} ${SYSTEM_LABELS[system]}`);
  };

  const selectAllSystems = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    onUpdateUser(userId, { allowedSystems: [...ALL_SYSTEMS_LIST] });
    notifyChange(`อนุญาตทุกระบบให้ ${user.name} เรียบร้อยแล้ว`);
  };

  const deselectAllSystems = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    // Keep at least overview as fallback
    onUpdateUser(userId, { allowedSystems: ['overview'] });
    notifyChange(`ยกเลิกระบบทั้งหมดของ ${user.name} (คงเหลือเฉพาะภาพรวม)`);
  };

  const toggleSite = (userId: string, site: SiteKey) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const has = user.allowedSites.includes(site);
    const next = has
      ? user.allowedSites.filter((s) => s !== site)
      : [...user.allowedSites, site];
    onUpdateUser(userId, { allowedSites: next });
    notifyChange(`อัปเดตไซต์งานของ ${user.name}: ${has ? 'ยกเลิก' : 'อนุญาต'} ${SITE_LABELS[site]}`);
  };

  const selectAllSites = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    onUpdateUser(userId, { allowedSites: [...ALL_SITES_LIST] });
    notifyChange(`อนุญาตทุกไซต์งานให้ ${user.name} เรียบร้อยแล้ว`);
  };

  const deselectAllSites = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    onUpdateUser(userId, { allowedSites: ['hq'] });
    notifyChange(`ยกเลิกไซต์งานของ ${user.name} (คงเหลือเฉพาะสำนักงานใหญ่)`);
  };

  const toggleStatus = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    onUpdateUser(userId, { status: nextStatus });
    notifyChange(`เปลี่ยนสถานะของ ${user.name} เป็น ${nextStatus === 'active' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}`);
  };

  return (
    <div className="w-full max-w-[1540px] h-full mx-auto flex gap-4 xl:gap-5 items-stretch overflow-hidden select-none">
      {/* Admin Sidebar */}
      <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 card-rounded p-4 flex flex-col justify-between shadow-soft border border-slate-100/80 dark:border-slate-800 overflow-hidden">
        <div>
          <div className="flex items-center gap-2.5 pb-5 pt-2 px-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-[15px] tracking-tight text-slate-900 dark:text-white">Admin Console</span>
              <p className="text-[10px] text-slate-400">ระบบจัดการสิทธิ์ผู้ใช้งาน</p>
            </div>
          </div>

          <nav className="space-y-1 text-[13px]">
            {NAV_ITEMS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl smooth-transition ${
                  section === key
                    ? 'bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <span className={section === key ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                  {NAV_ICONS[key]}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 smooth-transition font-medium text-xs shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>กลับสู่หน้า Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col gap-3 min-w-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pt-1 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {NAV_ITEMS.find((n) => n.key === section)?.label}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              จัดการสิทธิ์การมองเห็นระบบและไซต์งานสำหรับผู้ใช้งานแต่ละราย (มีผลต่อ Sidebar และ Dashboard ทันที)
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
          </div>
        </div>

        {/* Live Notification Banner */}
        {lastUpdatedNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs shrink-0 smooth-transition">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{lastUpdatedNotice}</span>
          </div>
        )}

        {/* Section Content Area */}
        <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-y-auto">
          {/* USERS & PERMISSION MANAGEMENT */}
          {section === 'users' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    รายชื่อผู้ใช้งานและสิทธิ์การเข้าถึง (User Permissions)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    คลิกปุ่ม <b>"แก้ไขสิทธิ์"</b> เพื่อเปิดหรือปิดระบบและไซต์งานที่ User แต่ละคนสามารถมองเห็นได้
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  ทั้งหมด {users.length} บัญชี
                </span>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    <th className="px-5 py-3">ผู้ใช้งาน</th>
                    <th className="px-4 py-3">สังกัดองค์กร</th>
                    <th className="px-4 py-3">สิทธิ์ระบบที่เห็น</th>
                    <th className="px-4 py-3">ไซต์งานที่เห็น</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-5 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => {
                    const isExpanded = editingUser === u.id;
                    return (
                      <React.Fragment key={u.id}>
                        <tr className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 smooth-transition ${
                          isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                        }`}>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                            {u.org}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                              {u.allowedSystems.length} / {ALL_SYSTEMS_LIST.length} ระบบ
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                              {u.allowedSites.length} / {ALL_SITES_LIST.length} ไซต์
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStatus(u.id)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full smooth-transition cursor-pointer ${
                                u.status === 'active'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                              }`}
                              title="คลิกเพื่อสลับสถานะ เปิด/ปิด ใช้งาน"
                            >
                              {u.status === 'active' ? '● ใช้งานอยู่' : '○ ระงับใช้งาน'}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            {onViewAsUser && (
                              <button
                                type="button"
                                onClick={() => onViewAsUser(u.id)}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 smooth-transition"
                                title="เข้าสู่หน้า Dashboard ในมุมมองของผู้ใช้คนนี้"
                              >
                                ดูมุมมอง User นี้
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingUser(isExpanded ? null : u.id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border smooth-transition ${
                                isExpanded
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
                              }`}
                            >
                              {isExpanded ? 'ปิดการตั้งค่า ✕' : 'แก้ไขสิทธิ์ ⚙'}
                            </button>
                          </td>
                        </tr>

                        {/* Interactive Permission Editor Accordion */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-5 bg-slate-50/90 dark:bg-slate-800/90 border-y border-blue-200 dark:border-blue-800">
                              <div className="max-w-4xl space-y-5">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                      <span>กำหนดสิทธิ์การมองเห็นสำหรับ:</span>
                                      <span className="text-blue-600 dark:text-blue-400">{u.name}</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      คลิกที่ปุ่มเพื่อเปิด-ปิดการมองเห็นระบบและไซต์งาน (การเปลี่ยนแปลงจะมีผลต่อ Sidebar ทันที)
                                    </p>
                                  </div>

                                  {onViewAsUser && (
                                    <button
                                      type="button"
                                      onClick={() => onViewAsUser(u.id)}
                                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm smooth-transition flex items-center gap-1.5"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      <span>ทดสอบดูหน้าจอของ User คนนี้</span>
                                    </button>
                                  )}
                                </div>

                                {/* Allowed Systems Section */}
                                <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        ระบบที่อนุญาตให้เข้าถึง (Allowed Systems)
                                      </span>
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                                        {u.allowedSystems.length} / {ALL_SYSTEMS_LIST.length} ระบบ
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => selectAllSystems(u.id)}
                                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                      >
                                        เปิดทั้งหมด
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => deselectAllSystems(u.id)}
                                        className="text-[11px] font-semibold text-slate-500 hover:underline"
                                      >
                                        ปิดทั้งหมด
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {ALL_SYSTEMS_LIST.map((sys) => {
                                      const on = u.allowedSystems.includes(sys);
                                      return (
                                        <button
                                          key={sys}
                                          type="button"
                                          onClick={() => toggleSystem(u.id, sys)}
                                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between smooth-transition ${
                                            on
                                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span className="truncate">{SYSTEM_LABELS[sys]}</span>
                                          <span className={`text-xs font-bold ml-1.5 shrink-0 ${on ? 'text-white' : 'text-slate-400'}`}>
                                            {on ? '✓' : '+'}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Allowed Sites Section */}
                                <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        ไซต์งานที่อนุญาตให้เข้าถึง (Allowed Sites)
                                      </span>
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                        {u.allowedSites.length} / {ALL_SITES_LIST.length} ไซต์
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => selectAllSites(u.id)}
                                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                      >
                                        เปิดทั้งหมด
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() => deselectAllSites(u.id)}
                                        className="text-[11px] font-semibold text-slate-500 hover:underline"
                                      >
                                        ปิดทั้งหมด
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {ALL_SITES_LIST.map((site) => {
                                      const on = u.allowedSites.includes(site);
                                      return (
                                        <button
                                          key={site}
                                          type="button"
                                          onClick={() => toggleSite(u.id, site)}
                                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between smooth-transition ${
                                            on
                                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span className="truncate">{SITE_LABELS[site]}</span>
                                          <span className={`text-xs font-bold ml-1.5 shrink-0 ${on ? 'text-white' : 'text-slate-400'}`}>
                                            {on ? '✓' : '+'}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ORGANIZATIONS */}
          {section === 'orgs' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Organization</th>
                  <th className="px-5 py-3.5">Sites</th>
                  <th className="px-5 py-3.5">Systems</th>
                  <th className="px-5 py-3.5">Users</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ORGS.map((org) => (
                  <tr key={org.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{org.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{org.sites} sites</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{org.systems} systems</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{org.users} users</td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{org.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* DEVELOPERS */}
          {section === 'dev' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Developer</th>
                  <th className="px-5 py-3.5">Connected System</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {DEVS.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{d.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{d.system}</td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{d.method}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        d.status === 'Connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{d.lastSync}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* LOGS */}
          {section === 'logs' && (
            <div className="p-5 space-y-1.5">
              {LOGS.map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-xs font-mono py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-400 shrink-0 w-16">{log.time}</span>
                  <span className={`shrink-0 font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    log.level === 'ERROR' ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400' :
                    log.level === 'WARN'  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' :
                                            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
