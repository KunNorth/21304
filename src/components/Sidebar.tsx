'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SystemTabKey, UserRole, SiteKey, SiteOption, UserAccount } from '../types/dashboard';

interface SidebarProps {
  currentTab: SystemTabKey;
  currentSite: SiteKey;
  role: UserRole;
  onSelectTab: (tab: SystemTabKey) => void;
  onSelectSite: (site: SiteKey) => void;
  onOpenAI?: () => void;
  onBack: () => void;
  allowedSystems?: SystemTabKey[];
  allowedSites?: SiteKey[];
  currentUser?: UserAccount;
  users?: UserAccount[];
  onSelectUser?: (userId: string) => void;
}

export const SITES: SiteOption[] = [
  { key: 'all',        label: 'ทุกไซต์งาน',         short: 'ทุกไซต์'    },
  { key: 'hq',         label: 'สำนักงานใหญ่',         short: 'สนง.ใหญ่'  },
  { key: 'muangthong', label: 'ไซต์เมืองทอง',         short: 'เมืองทอง'  },
  { key: 'phuket',     label: 'ไซต์ภูเก็ต',           short: 'ภูเก็ต'    },
  { key: 'chiangmai',  label: 'ไซต์เชียงใหม่',         short: 'เชียงใหม่' },
];

interface NavItem {
  tab: SystemTabKey;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

const OVERVIEW_ITEMS: NavItem[] = [
  {
    tab: 'overview',
    label: 'ภาพรวมระบบ',
    sub: 'General Metrics',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    tab: 'warroom',
    label: 'War Room',
    sub: 'Multi-System Monitor',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8l2 2 2-2 2 2 2-2" />
      </svg>
    ),
  },
];

const SYSTEM_ITEMS: NavItem[] = [
  {
    tab: 'vms',
    label: 'ระบบ VMS',
    sub: 'Visitor Management',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8.5" cy="12" r="2.5" />
        <path d="M14 9h4M14 12h4M14 15h2" />
      </svg>
    ),
  },
  {
    tab: 'attendance',
    label: 'ระบบลงเวลา',
    sub: 'Time Attendance',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
        <path d="M16.5 2.5l1 2M7.5 2.5l-1 2" />
      </svg>
    ),
  },
  {
    tab: 'finance',
    label: 'ระบบการเงิน',
    sub: 'Finance & Budget',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v2m0 8v2M9 9.5A2 2 0 0111 8h2a2 2 0 010 4h-2a2 2 0 000 4h2a2 2 0 002-1.5" />
      </svg>
    ),
  },
  {
    tab: 'hr',
    label: 'ระบบ HR',
    sub: 'Human Resources',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    tab: 'crm',
    label: 'ระบบ CRM',
    sub: 'Customer Relations',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    tab: 'cms',
    label: 'ระบบ CMS',
    sub: 'Content Management',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  currentSite,
  role,
  onSelectTab,
  onSelectSite,
  onBack,
  allowedSystems,
  allowedSites,
  currentUser,
  users = [],
  onSelectUser,
}) => {
  const [siteOpen, setSiteOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Overview and Systems strictly by allowedSystems
  const visibleOverview = allowedSystems
    ? OVERVIEW_ITEMS.filter((i) => allowedSystems.includes(i.tab))
    : OVERVIEW_ITEMS;

  const visibleSystems = allowedSystems
    ? SYSTEM_ITEMS.filter((i) => allowedSystems.includes(i.tab))
    : SYSTEM_ITEMS;

  // Filter Sites strictly by allowedSites
  const visibleSites = allowedSites
    ? SITES.filter((s) => allowedSites.includes(s.key))
    : SITES;

  const activeSite = visibleSites.find((s) => s.key === currentSite) ?? visibleSites[0] ?? SITES[0];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const renderItem = (item: NavItem) => {
    const active = currentTab === item.tab;
    return (
      <button
        key={item.tab}
        onClick={() => onSelectTab(item.tab)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl smooth-transition group ${
          active
            ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
        }`}
      >
        <span className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white'}`}>
          {item.icon}
        </span>
        <div className="text-left min-w-0">
          <p className={`text-[13px] font-semibold leading-none ${active ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
            {item.label}
          </p>
          <p className={`text-[10px] mt-0.5 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
            {item.sub}
          </p>
        </div>
      </button>
    );
  };

  return (
    <aside className="w-64 h-full shrink-0 bg-white dark:bg-slate-900 card-rounded flex flex-col justify-between shadow-soft border border-slate-100/80 dark:border-slate-800 transition-all duration-300 overflow-hidden">
      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pb-3 pt-0.5 px-1 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-black dark:bg-slate-800 flex items-center justify-center text-white shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3h14M5 9h14M5 15h14M5 21h14M3 3v18M21 3v18" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">Nexus</span>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Dashboard Framework</p>
          </div>
        </div>

        {/* Site Selector Dropdown */}
        <div className="relative mb-3 shrink-0">
          <button
            onClick={() => setSiteOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl smooth-transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-left min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">{currentUser?.org || 'บจก. ฤทธา'}</p>
                <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{activeSite.label}</p>
              </div>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 shrink-0 smooth-transition ${siteOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {siteOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
              {visibleSites.map((site) => (
                <button
                  key={site.key}
                  onClick={() => { onSelectSite(site.key); setSiteOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[13px] hover:bg-slate-50 dark:hover:bg-slate-700 smooth-transition ${
                    currentSite === site.key ? 'text-slate-900 dark:text-white font-semibold bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{site.label}</span>
                  {currentSite === site.key && (
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-3 text-[13px] flex-1 overflow-y-auto pr-1">
          {/* Overview Section */}
          {visibleOverview.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 mb-1.5 tracking-widest uppercase">ภาพรวม</p>
              <div className="space-y-0.5">
                {visibleOverview.map(renderItem)}
              </div>
            </div>
          )}

          {/* All Systems Section */}
          <div>
            <div className="px-3 flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">ระบบทั้งหมด</p>
              <span className="text-[10px] text-slate-400 font-medium">
                {visibleSystems.length} ระบบ
              </span>
            </div>
            {visibleSystems.length > 0 ? (
              <div className="space-y-0.5">
                {visibleSystems.map(renderItem)}
              </div>
            ) : (
              <div className="px-3 py-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                ไม่มีระบบที่ได้รับอนุญาต
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Area: Active User Profile & Switcher */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 relative" ref={userMenuRef}>
        {/* User Card with Switcher Dropdown */}
        <div className="relative">
          <div
            onClick={() => setUserMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/70 dark:border-slate-700 smooth-transition cursor-pointer select-none group"
            title="คลิกเพื่อสลับดูผู้ใช้งานคนอื่น หรือดูรายละเอียดสิทธิ์"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar with Online Dot */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {getInitials(currentUser?.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              {/* User Details */}
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name || 'Worapol Sittigrilard'}
                  </p>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 capitalize shrink-0">
                    {role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'worapol@rittha.co.th'}
                </p>
              </div>
            </div>

            {/* Switch icon */}
            <svg
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0 smooth-transition ${
                userMenuOpen ? 'rotate-180 text-blue-600' : ''
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>

          {/* User Switcher Popup Menu */}
          {userMenuOpen && users.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-slate-700 dark:text-slate-200 max-h-72 overflow-y-auto">
              <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  สลับผู้ใช้งาน (User Switcher)
                </span>
                <span className="text-[10px] text-slate-400">{users.length} บัญชี</span>
              </div>

              <div className="space-y-1">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onSelectUser?.(u.id);
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left smooth-transition ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold leading-tight truncate ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.allowedSystems.length} ระบบ • {u.allowedSites.length} ไซต์
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs shrink-0">
                          เข้าใช้อยู่
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sign out Button */}
        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 smooth-transition text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>ออกจากระบบ / สลับบทบาท</span>
        </button>
      </div>
    </aside>
  );
};
