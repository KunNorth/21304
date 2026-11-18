'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Sidebar, SITES } from '../components/Sidebar';
import { Header } from '../components/Header';
import { SingleMetricCard } from '../components/MetricCards';
import { SalesReturnsChart } from '../components/SalesReturnsChart';
import { ConversionFunnelChart } from '../components/ConversionFunnelChart';
import { SessionsGauge } from '../components/SessionsGauge';
import { TrafficSourcesCard } from '../components/TrafficSourcesCard';
import { RegionalSalesTable } from '../components/RegionalSalesTable';
import { AIAssistantDrawer } from '../components/AIAssistantDrawer';
import { LoginScreen } from '../components/LoginScreen';
import { WarRoomMultiPanel } from '../components/WarRoomMultiPanel';
import { AdminPanel } from '../components/AdminPanel';
import { DeveloperPanel } from '../components/DeveloperPanel';
import { mockSystemsData } from '../data/mockData';
import { SystemTabKey, UserRole, SiteKey, UserAccount } from '../types/dashboard';
import { defaultUsers, ALL_SYSTEMS_LIST, ALL_SITES_LIST } from '../data/permissions';

export type WidgetId =
  | 'metric-0'
  | 'metric-1'
  | 'metric-2'
  | 'metric-3'
  | 'metric-4'
  | 'sales'
  | 'conversion'
  | 'sessions'
  | 'traffic'
  | 'regions';

export interface BentoWidgetState {
  id: WidgetId;
  col: number;      // 1..12
  row: number;      // 1..6
  colSpan: number;  // 1..12
  rowSpan: number;  // 1..6
}

const WIDGET_IDS: WidgetId[] = [
  'metric-0',
  'metric-1',
  'metric-2',
  'metric-3',
  'metric-4',
  'sales',
  'conversion',
  'sessions',
  'traffic',
  'regions',
];

const WIDGET_TITLES: Record<WidgetId, string> = {
  'metric-0': 'Profit Margin',
  'metric-1': 'Orders',
  'metric-2': 'Avg. Order Value',
  'metric-3': 'Units Sold',
  'metric-4': 'Cart Abandonment',
  sales: 'Sales & Returns',
  conversion: 'Conversion Funnel',
  sessions: 'Sessions Gauge',
  traffic: 'Traffic Sources',
  regions: 'Regional Sales',
};

// 12 columns x 6 rows default layout
const DEFAULT_BENTO_LAYOUT: Record<WidgetId, BentoWidgetState> = {
  // Row 1: 5 Metric Cards (2 + 2 + 2 + 3 + 3 = 12 cols, 1 row tall)
  'metric-0': { id: 'metric-0', col: 1,  row: 1, colSpan: 2, rowSpan: 1 },
  'metric-1': { id: 'metric-1', col: 3,  row: 1, colSpan: 2, rowSpan: 1 },
  'metric-2': { id: 'metric-2', col: 5,  row: 1, colSpan: 2, rowSpan: 1 },
  'metric-3': { id: 'metric-3', col: 7,  row: 1, colSpan: 3, rowSpan: 1 },
  'metric-4': { id: 'metric-4', col: 10, row: 1, colSpan: 3, rowSpan: 1 },

  // Rows 2..4: Sales (8 cols, 3 rows) & Conversion (4 cols, 3 rows)
  sales:      { id: 'sales',      col: 1, row: 2, colSpan: 8, rowSpan: 3 },
  conversion: { id: 'conversion', col: 9, row: 2, colSpan: 4, rowSpan: 3 },

  // Rows 5..6: Sessions (4 cols, 2 rows), Traffic (4 cols, 2 rows), Regions (4 cols, 2 rows)
  sessions:   { id: 'sessions',   col: 1, row: 5, colSpan: 4, rowSpan: 2 },
  traffic:    { id: 'traffic',    col: 5, row: 5, colSpan: 4, rowSpan: 2 },
  regions:    { id: 'regions',    col: 9, row: 5, colSpan: 4, rowSpan: 2 },
};

export default function DashboardPage() {
  const [role, setRole]               = useState<UserRole | null>(null);
  const [currentTab, setCurrentTab]   = useState<SystemTabKey>('overview');
  const [currentSite, setCurrentSite] = useState<SiteKey>('hq');
  const [isAIOpen, setIsAIOpen]       = useState(false);
  const [editMode, setEditMode]       = useState(false);

  const [layout, setLayout] = useState<Record<WidgetId, BentoWidgetState>>(() => ({ ...DEFAULT_BENTO_LAYOUT }));
  const [loadedLayoutTab, setLoadedLayoutTab] = useState<SystemTabKey | null>(null);

  // Active dragging and resizing states
  const [activeDragId, setActiveDragId] = useState<WidgetId | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ col: number; row: number; colSpan: number; rowSpan: number } | null>(null);

  const [activeResizeId, setActiveResizeId] = useState<WidgetId | null>(null);
  const [hoverResize, setHoverResize] = useState<{ id: WidgetId; colSpan: number; rowSpan: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: WidgetId; startX: number; startY: number } | null>(null);
  const resizeState = useRef<{ id: WidgetId; startX: number; startY: number; origColSpan: number; origRowSpan: number } | null>(null);

  const [users, setUsers] = useState<UserAccount[]>(defaultUsers);
  const [activeUserId, setActiveUserId] = useState<string>('u1');

  // Load saved users permissions from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('nexus-users-permissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load users from localStorage', e);
    }
  }, []);

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const userPermissions = activeUser
    ? { allowedSites: activeUser.allowedSites, allowedSystems: activeUser.allowedSystems }
    : { allowedSites: ALL_SITES_LIST, allowedSystems: ALL_SYSTEMS_LIST };

  const handleSelectRole = useCallback((r: UserRole) => {
    setRole(r);
    if (r === 'user') {
      setActiveUserId('u1');
      setCurrentTab('overview');
    }
  }, []);

  const handleUpdateUser = useCallback((userId: string, updates: Partial<Pick<UserAccount, 'allowedSites' | 'allowedSystems' | 'status'>>) => {
    setUsers((prev) => {
      const next = prev.map((u) => u.id === userId ? { ...u, ...updates } : u);
      try {
        window.localStorage.setItem('nexus-users-permissions', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save users to localStorage', e);
      }
      return next;
    });
  }, []);

  // Ensure currentTab and currentSite match active user permissions
  useEffect(() => {
    if (role === 'user') {
      if (userPermissions.allowedSystems.length > 0 && !userPermissions.allowedSystems.includes(currentTab)) {
        setCurrentTab(userPermissions.allowedSystems[0]);
      }
      if (userPermissions.allowedSites.length > 0 && !userPermissions.allowedSites.includes(currentSite)) {
        setCurrentSite(userPermissions.allowedSites[0]);
      }
    }
  }, [role, userPermissions.allowedSystems, userPermissions.allowedSites, currentTab, currentSite]);

  // Load layout on tab change
  useEffect(() => {
    let nextLayout = { ...DEFAULT_BENTO_LAYOUT };
    try {
      const saved = window.localStorage.getItem(`nexus-bento-layout-${currentTab}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const validated: Partial<Record<WidgetId, BentoWidgetState>> = {};
          for (const id of WIDGET_IDS) {
            const item = parsed[id];
            if (item && item.col && item.row && item.colSpan && item.rowSpan) {
              validated[id] = {
                id,
                col: Math.max(1, Math.min(12, item.col)),
                row: Math.max(1, Math.min(6, item.row)),
                colSpan: Math.max(1, Math.min(12, item.colSpan)),
                rowSpan: Math.max(1, Math.min(6, item.rowSpan)),
              };
            }
          }
          if (Object.keys(validated).length === WIDGET_IDS.length) {
            nextLayout = validated as Record<WidgetId, BentoWidgetState>;
          }
        }
      }
    } catch (error) {
      console.warn(`Unable to read bento layout for "${currentTab}".`, error);
    }
    setLayout(nextLayout);
    setLoadedLayoutTab(currentTab);
  }, [currentTab]);

  // Save layout changes to localStorage
  useEffect(() => {
    if (loadedLayoutTab !== currentTab) return;
    try {
      window.localStorage.setItem(`nexus-bento-layout-${currentTab}`, JSON.stringify(layout));
    } catch (error) {
      console.error(`Unable to save bento layout for "${currentTab}".`, error);
    }
  }, [currentTab, layout, loadedLayoutTab]);

  // Reset layout to default
  const handleResetLayout = useCallback(() => {
    setLayout({ ...DEFAULT_BENTO_LAYOUT });
  }, []);

  // DRAG & DROP HANDLERS (Snaps to 12x6 Bento Grid)
  const handleDragStart = useCallback((id: WidgetId, event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragState.current = { id, startX: event.clientX, startY: event.clientY };
    setActiveDragId(id);

    const currentW = layout[id];
    setHoverTarget({ col: currentW.col, row: currentW.row, colSpan: currentW.colSpan, rowSpan: currentW.rowSpan });
  }, [layout]);

  const handleDragMove = useCallback((event: React.PointerEvent) => {
    if (!dragState.current || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const gap = 10;
    const cellW = (boardRect.width - (11 * gap)) / 12;
    const cellH = (boardRect.height - (5 * gap)) / 6;

    const currentW = layout[dragState.current.id];
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    const colIndex = Math.floor((pointerX - boardRect.left) / (cellW + gap));
    const rowIndex = Math.floor((pointerY - boardRect.top) / (cellH + gap));

    const targetCol = Math.max(1, Math.min(12 - currentW.colSpan + 1, colIndex + 1));
    const targetRow = Math.max(1, Math.min(6 - currentW.rowSpan + 1, rowIndex + 1));

    setHoverTarget({ col: targetCol, row: targetRow, colSpan: currentW.colSpan, rowSpan: currentW.rowSpan });
  }, [layout]);

  const handleDragEnd = useCallback(() => {
    if (dragState.current && hoverTarget) {
      const id = dragState.current.id;
      setLayout((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          col: hoverTarget.col,
          row: hoverTarget.row,
        },
      }));
    }
    dragState.current = null;
    setActiveDragId(null);
    setHoverTarget(null);
  }, [hoverTarget]);

  // RESIZE HANDLERS (Snaps to grid columns/rows)
  const handleResizeStart = useCallback((id: WidgetId, event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const current = layout[id];
    resizeState.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      origColSpan: current.colSpan,
      origRowSpan: current.rowSpan,
    };
    setActiveResizeId(id);
    setHoverResize({ id, colSpan: current.colSpan, rowSpan: current.rowSpan });
  }, [layout]);

  const handleResizeMove = useCallback((event: React.PointerEvent) => {
    if (!resizeState.current || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const gap = 10;
    const cellW = (boardRect.width - (11 * gap)) / 12;
    const cellH = (boardRect.height - (5 * gap)) / 6;

    const { id, startX, startY, origColSpan, origRowSpan } = resizeState.current;
    const current = layout[id];

    const deltaCols = Math.round((event.clientX - startX) / (cellW + gap));
    const deltaRows = Math.round((event.clientY - startY) / (cellH + gap));

    const nextColSpan = Math.max(1, Math.min(12 - current.col + 1, origColSpan + deltaCols));
    const nextRowSpan = Math.max(1, Math.min(6 - current.row + 1, origRowSpan + deltaRows));

    setHoverResize({ id, colSpan: nextColSpan, rowSpan: nextRowSpan });
  }, [layout]);

  const handleResizeEnd = useCallback(() => {
    if (resizeState.current && hoverResize) {
      const id = resizeState.current.id;
      setLayout((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          colSpan: hoverResize.colSpan,
          rowSpan: hoverResize.rowSpan,
        },
      }));
    }
    resizeState.current = null;
    setActiveResizeId(null);
    setHoverResize(null);
  }, [hoverResize]);

  const handleSelectTab = useCallback((tab: SystemTabKey) => {
    if (role === 'user' && !userPermissions.allowedSystems.includes(tab)) {
      return;
    }
    setCurrentTab(tab);
  }, [role, userPermissions.allowedSystems]);

  if (!role) return <LoginScreen onSelectRole={handleSelectRole} />;
  if (role === 'admin') return (
    <AdminPanel
      onBack={() => setRole(null)}
      users={users}
      onUpdateUser={handleUpdateUser}
      onViewAsUser={(id) => {
        setActiveUserId(id);
        setRole('user');
        const target = users.find((u) => u.id === id);
        if (target && target.allowedSystems.length > 0) {
          setCurrentTab(target.allowedSystems[0]);
        }
        if (target && target.allowedSites.length > 0) {
          setCurrentSite(target.allowedSites[0]);
        }
      }}
    />
  );
  if (role === 'developer') return <DeveloperPanel onBack={() => setRole(null)} />;

  if (currentTab === 'warroom') {
    return (
      <WarRoomMultiPanel
        onNavigate={(tab) => { setCurrentTab(tab); }}
        onExit={() => setCurrentTab('overview')}
      />
    );
  }

  // User Dashboard
  const currentData = mockSystemsData[currentTab] ?? mockSystemsData.overview;
  const activeSite = SITES.find((s) => s.key === currentSite) ?? SITES[0];

  const handleApplyAIPrompt = (promptText: string, targetTab?: SystemTabKey) => {
    if (targetTab) { handleSelectTab(targetTab); return; }
    if (promptText.includes('VMS'))      { handleSelectTab('vms');        return; }
    if (promptText.includes('ลงเวลา'))   { handleSelectTab('attendance'); return; }
    if (promptText.includes('War Room')) { handleSelectTab('warroom');    return; }
    if (promptText.includes('การเงิน'))  { handleSelectTab('finance');    return; }
    if (promptText.includes('HR'))       { handleSelectTab('hr');         return; }
    if (promptText.includes('CRM'))      { handleSelectTab('crm');       return; }
    if (promptText.includes('CMS'))      { handleSelectTab('cms');       return; }
    setCurrentTab('overview');
  };

  // Content for each of the 10 widgets
  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'metric-0':
        return <SingleMetricCard kpi={currentData.kpis[0]} />;
      case 'metric-1':
        return <SingleMetricCard kpi={currentData.kpis[1]} />;
      case 'metric-2':
        return <SingleMetricCard kpi={currentData.kpis[2]} />;
      case 'metric-3':
        return <SingleMetricCard kpi={currentData.kpis[3]} />;
      case 'metric-4':
        return <SingleMetricCard kpi={currentData.kpis[4]} />;
      case 'sales':
        return (
          <SalesReturnsChart
            title={currentData.chart.title}
            sub={currentData.chart.sub}
            legend1={currentData.chart.legend1}
            legendVal1={currentData.chart.legendVal1}
            legendBadge1={currentData.chart.legendBadge1}
            legend2={currentData.chart.legend2}
            legendVal2={currentData.chart.legendVal2}
            legendBadge2={currentData.chart.legendBadge2}
            days={currentData.chart.days}
          />
        );
      case 'conversion':
        return (
          <ConversionFunnelChart
            title={currentData.funnel.title}
            sub={currentData.funnel.sub}
            conversionRate={currentData.funnel.conversionRate}
            conversionBadge={currentData.funnel.conversionBadge}
            stages={currentData.funnel.stages}
          />
        );
      case 'sessions':
        return (
          <SessionsGauge
            title={currentData.sessions.title}
            uniqueUsers={currentData.sessions.uniqueUsers}
            uniqueLabel={currentData.sessions.uniqueLabel}
            totalSessions={currentData.sessions.totalSessions}
            totalLabel={currentData.sessions.totalLabel}
            gaugePercentage={currentData.sessions.gaugePercentage}
          />
        );
      case 'traffic':
        return (
          <TrafficSourcesCard
            title={currentData.traffic.title}
            spend={currentData.traffic.spend}
            cpa={currentData.traffic.cpa}
            impressions={currentData.traffic.impressions}
            clicks={currentData.traffic.clicks}
            sources={currentData.traffic.sources}
          />
        );
      case 'regions':
        return <RegionalSalesTable title={currentData.regions.title} rows={currentData.regions.rows} />;
    }
  };

  return (
    <div className="w-full max-w-[1540px] h-full mx-auto flex gap-3.5 xl:gap-4 items-stretch relative overflow-hidden select-none">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        currentSite={currentSite}
        role={role}
        onSelectTab={handleSelectTab}
        onSelectSite={setCurrentSite}
        onBack={() => setRole(null)}
        allowedSystems={userPermissions.allowedSystems}
        allowedSites={userPermissions.allowedSites}
        currentUser={activeUser}
        users={users}
        onSelectUser={(id) => {
          setActiveUserId(id);
          const target = users.find((x) => x.id === id);
          if (target && target.allowedSystems.length > 0 && !target.allowedSystems.includes(currentTab)) {
            setCurrentTab(target.allowedSystems[0]);
          }
          if (target && target.allowedSites.length > 0 && !target.allowedSites.includes(currentSite)) {
            setCurrentSite(target.allowedSites[0]);
          }
        }}
      />

      {/* Main Content Area: Centered, fits in viewport with 0 scroll */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          title={currentData.title}
          brand={currentData.brand}
          siteName={activeSite.label}
          currentTab={currentTab}
          editMode={editMode}
          onToggleEditMode={() => setEditMode((v) => !v)}
          onResetLayout={handleResetLayout}
          onSelectTab={handleSelectTab}
          onOpenAI={() => setIsAIOpen(true)}
        />

        {/* Compact Edit Mode Info Bar */}
        {editMode && (
          <div className="my-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8" cy="6" r="1.8" /><circle cx="16" cy="6" r="1.8" />
                <circle cx="8" cy="12" r="1.8" /><circle cx="16" cy="12" r="1.8" />
                <circle cx="8" cy="18" r="1.8" /><circle cx="16" cy="18" r="1.8" />
              </svg>
              <span>ลากปุ่ม <b>⋮⋮</b> เพื่อสลับตำแหน่งการ์ดได้อย่างอิสระ และลากมุมขวาล่าง <b>⤡</b> เพื่อปรับขนาด</span>
            </div>
            <button
              type="button"
              onClick={handleResetLayout}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              จัดเรียงอัตโนมัติ
            </button>
          </div>
        )}

        {/* Bento Grid Workspace Canvas (Matching the uploaded image) */}
        <div
          ref={boardRef}
          className="flex-1 min-h-0 relative my-1 rounded-2xl overflow-hidden"
          onPointerMove={(e) => {
            if (activeDragId) handleDragMove(e);
            if (activeResizeId) handleResizeMove(e);
          }}
          onPointerUp={() => {
            if (activeDragId) handleDragEnd();
            if (activeResizeId) handleResizeEnd();
          }}
          onPointerCancel={() => {
            if (activeDragId) handleDragEnd();
            if (activeResizeId) handleResizeEnd();
          }}
        >
          {/* Background Rounded Tile Grid (12 cols x 6 rows) */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2.5 pointer-events-none z-0">
            {Array.from({ length: 72 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-full rounded-2xl bg-blue-100/40 dark:bg-slate-800/35 border border-blue-200/25 dark:border-slate-700/30 transition-colors"
              />
            ))}

            {/* Target Snap Ghost Highlight during dragging */}
            {hoverTarget && (
              <div
                className="rounded-2xl bg-blue-500/15 border-2 border-dashed border-blue-500/80 transition-all duration-75 z-20 pointer-events-none"
                style={{
                  gridColumn: `${hoverTarget.col} / span ${hoverTarget.colSpan}`,
                  gridRow: `${hoverTarget.row} / span ${hoverTarget.rowSpan}`,
                }}
              />
            )}
          </div>

          {/* Interactive Bento Widgets Grid */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2.5 z-10">
            {WIDGET_IDS.map((id) => {
              const w = layout[id];
              const isDragging = activeDragId === id;
              const isResizing = activeResizeId === id;

              const colSpan = isResizing && hoverResize ? hoverResize.colSpan : w.colSpan;
              const rowSpan = isResizing && hoverResize ? hoverResize.rowSpan : w.rowSpan;

              return (
                <div
                  key={id}
                  className={`group relative rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/70 dark:border-slate-700/60 shadow-sm transition-all duration-150 flex flex-col overflow-hidden ${
                    isDragging
                      ? 'ring-2 ring-blue-500/90 dark:ring-blue-400 border-blue-400 shadow-2xl scale-[1.01] z-40 opacity-95'
                      : 'hover:shadow-md z-10'
                  }`}
                  style={{
                    gridColumn: `${w.col} / span ${colSpan}`,
                    gridRow: `${w.row} / span ${rowSpan}`,
                  }}
                >
                  {/* Card Drag Bar (Matching Image Header with 6-dot handle) */}
                  <div
                    className="h-6 px-3 pt-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 select-none shrink-0"
                    onPointerDown={(e) => handleDragStart(id, e)}
                    title="คลิกค้างแล้วลากเพื่อย้าย Widget ไปยังตำแหน่งใดก็ได้บนกระดาน"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="8" cy="6" r="1.8" /><circle cx="16" cy="6" r="1.8" />
                        <circle cx="8" cy="12" r="1.8" /><circle cx="16" cy="12" r="1.8" />
                        <circle cx="8" cy="18" r="1.8" /><circle cx="16" cy="18" r="1.8" />
                      </svg>
                      <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {WIDGET_TITLES[id]}
                      </span>
                    </div>

                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {w.colSpan}×{w.rowSpan}
                    </span>
                  </div>

                  {/* Widget Content Body */}
                  <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
                    {renderWidgetContent(id)}
                  </div>

                  {/* Corner Resize Grip */}
                  <div
                    onPointerDown={(e) => handleResizeStart(id, e)}
                    className="absolute bottom-1 right-1 w-4 h-4 flex items-center justify-center cursor-nwse-resize text-slate-300 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity z-20"
                    title="ลากเพื่อปรับขนาด (กว้าง × สูง)"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v6h-6M21 21l-7-7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-1 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between shrink-0">
          <span>The Nexus Dashboard Framework &bull; Bento Layout</span>
          <button
            type="button"
            onClick={() => setIsAIOpen(true)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Nexus AI Prompt Assistant</span>
          </button>
        </footer>
      </main>

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyPrompt={handleApplyAIPrompt}
      />
    </div>
  );
}
