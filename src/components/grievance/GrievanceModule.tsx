/**
 * GrievanceModule.tsx — কর্মী অভিযোগ ব্যবস্থাপনা
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { DbRecord }           from '../../business/DataUseCases';
import ModuleShell                 from '../shell/ModuleShell';
import type { AuthorizationState } from '../common/AuthorizationBlock';
import { DEFAULT_AUTHORIZATION }   from '../common/AuthorizationBlock';
import { useSecurity }             from '../../security';
import SubmitView, { type SubmitViewRef } from './employee/SubmitView';
import TrackView                   from './employee/TrackView';
import ManagementView              from './management/ManagementView';
import MonthlyReport, { type MonthlyReportRef } from './report/MonthlyReport';
import { apiGet }                  from './shared/api';
import { URGENCY_COLORS }          from './shared/constants';
import type { Grievance }          from './shared/types';

// ── Steps ─────────────────────────────────────────────────────────────────────
type StepId = 'submit' | 'track' | 'management';

const BASE_STEPS = [
  { id: 'submit', label: 'অভিযোগ দাখিল', icon: 'ti-file-text'       },
];
const MANAGER_STEP = { id: 'management', label: 'ব্যবস্থাপনা', icon: 'ti-layout-dashboard' };

// ── Main Module ───────────────────────────────────────────────────────────────
export default function GrievanceModule() {
  const security   = useSecurity();
  const submitRef  = useRef<SubmitViewRef>(null);
  const reportRef  = useRef<MonthlyReportRef>(null);

  // active view — either a step or a bill view
  const [activeStep,  setActiveStep]  = useState<StepId>('submit');
  const [activeBill,  setActiveBill]  = useState<'report' | 'track' | null>(null);

  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [auth,        setAuth]        = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [lang,        setLang]        = useState<'bn'|'en'>('bn');
  const [grievances,  setGrievances]  = useState<Grievance[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [selectedId,  setSelectedId]  = useState<string | undefined>(undefined);

  const isBillActive = activeBill !== null;

  // ── Steps: submit always; management only for managers ────────────────────
  const steps = [
    ...BASE_STEPS,
    ...(security.isManager ? [MANAGER_STEP] : []),
  ];

  // ── Bill items (আউটপুট) ──────────────────────────────────────────────────
  const billItems = [
    {
      label:   'অভিযোগ ট্র্যাক',
      onClick: () => setActiveBill('track'),
    },
    {
      label:   'মাসিক প্রতিবেদন',
      onClick: () => { setActiveBill('report'); setSelectedId(undefined); },
    },
  ];

  // ── Grievances — single load ──────────────────────────────────────────────
  const loadGrievances = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiGet({ action: 'getAll' });
      if (res.success && Array.isArray(res.data)) {
        setGrievances((res.data as Grievance[]).slice().reverse());
      }
    } catch { /* silent */ }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadGrievances(); }, [loadGrievances]);

  // ── Map Grievance → DbRecord for সংরক্ষিত রেকর্ড panel ─────────────────
  const records: DbRecord[] = grievances.map(g => ({
    id:        g.ID,
    savedAt:   g.SubmittedAt ?? '',
    savedBy:   g.EmployeeID  ?? '',
    factoryId: '',
    _urgency:  g.Urgency,
    _status:   g.Status,
    _name:     g.EmployeeID === 'ANON' ? 'বেনামী কর্মী' : (g.Name || g.ID),
  }));

  // ── রিসেট ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (activeStep === 'submit') submitRef.current?.reset();
    if (activeBill === 'track')  setSelectedId(undefined);
    setActiveBill(null);
    setSelectedId(undefined);
  };

  // ── Record panel click → open in track/management ────────────────────────
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setActiveBill(null);
    setActiveStep(security.isManager ? 'management' : 'track');
  };

  const handleLoadRecord = (rec: Record<string, unknown>) => {
    const id = String(rec.id ?? '');
    if (id) handleSelect(id);
  };

  // ── Print — always wired; routes to the active view ──────────────────────
  const handlePrint = () => {
    if (activeBill === 'report' && reportRef.current) {
      reportRef.current.print();
      return;
    }
    // Other views: print the current page content
    window.print();
  };

  // ── PDF — always wired; only meaningful on report ─────────────────────────
  const handleExportPDF = async () => {
    if (activeBill === 'report' && reportRef.current) {
      await reportRef.current.exportPDF();
    }
  };

  // ── Records panel: label + urgency badge ─────────────────────────────────
  const recordLabel = (rec: DbRecord) => String(rec._name ?? rec.id ?? '—');
  const recordBadge = (rec: DbRecord) => {
    const u = String(rec._urgency ?? '');
    if (!u) return null;
    const c = URGENCY_COLORS[u] ?? URGENCY_COLORS['কম'];
    return (
      <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`,
        borderRadius:20, padding:'1px 7px', fontSize:10, fontWeight:700, display:'inline-block' }}>
        {u}
      </span>
    );
  };

  return (
    <ModuleShell
      moduleName="কর্মী অভিযোগ ব্যবস্থাপনা"
      moduleNameEn="Employee Grievance Management"
      date={date}
      onDateChange={setDate}

      steps={steps}
      activeStep={isBillActive ? '' : activeStep}
      onStepChange={id => {
        setActiveStep(id as StepId);
        setSelectedId(undefined);
        setActiveBill(null);
      }}
      hideStepNav

      billItems={billItems}
      isBillActive={isBillActive}

      // ── No সংরক্ষণ করুন (removed) ────────────────────────────────────────
      // ── No আপডেট সার্চ (removed) ─────────────────────────────────────────

      onReset={handleReset}

      // ── অনুমোদন ও প্রিন্ট — always visible ──────────────────────────────
      auth={auth}
      onAuthChange={setAuth}
      onPrint={handlePrint}
      onPDF={handleExportPDF}

      configured={true}
      adapterName="Grievance API"
      lang={lang}

      // ── সংরক্ষিত রেকর্ড ──────────────────────────────────────────────────
      records={records}
      isLoading={isLoading}
      onLoadRecord={handleLoadRecord}
      onReload={loadGrievances}
      recordLabel={recordLabel}
      recordBadge={recordBadge}
    >
      {activeStep === 'submit' && !isBillActive && (
        <SubmitView ref={submitRef} onSuccess={loadGrievances} />
      )}
      {activeStep === 'management' && !isBillActive && (
        <ManagementView
          grievances={grievances}
          loading={isLoading}
          onRefresh={loadGrievances}
          selectedId={selectedId}
        />
      )}

      {/* Bill views — আউটপুট section */}
      {activeBill === 'track' && (
        <TrackView initialId={selectedId} />
      )}
      {activeBill === 'report' && (
        <MonthlyReport ref={reportRef} grievances={grievances} loading={isLoading} auth={auth} lang={lang} onLangChange={setLang} />
      )}
    </ModuleShell>
  );
}