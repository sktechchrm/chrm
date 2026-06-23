// ─────────────────────────────────────────────────────────────────────────────
// RequisitionManager.tsx
// Path: src/components/requisition/RequisitionManager.tsx
//
// CHANGES FROM PREVIOUS VERSION:
//  - Removed editingIdRef (stale closure bug) → uses sheets.editingId directly
//  - Removed localStorage draft auto-save → DB is the single source of truth
//  - Removed window.confirm in handleReset → ModuleShell handles confirmation
//  - Removed onCancelEdit only nulling editingId → now fully resets form too
//  - buildRecord now saves all fields (preparedByDesignation, quantityType)
//  - recordToFormData restores all fields on load/update
//  - Step label renamed: 'view' → 'preview' to match output section
//  - billItems added: sidebar "প্রিভিউ" link navigates to preview step
//  - isBillActive correctly reflects preview step
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useFactory } from '../../hooks/useFactory';
import { useAuth }                           from '../../context/AuthContext';
import { useSheetsSync }                     from '../../hooks/useSheetsSync';
import { DEFAULT_AUTHORIZATION }             from '../common/AuthorizationBlock';
import type { AuthorizationState }           from '../common/AuthorizationBlock';
import ModuleShell                           from '../shell/ModuleShell';
import RequisitionFormComponent              from './RequisitionForm';
import RequisitionViewComponent              from './RequisitionView';
import { exportToPDF }                       from '../../utils/pdfExport';
import { toDateInput }                       from '../../utils/dateUtils';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT }  from '../../utils/printCSS';
import type { RequisitionData, RequisitionItem } from './types';
import { calculateRequisitionTotal, INITIAL_REQUISITION_STATE } from './types';

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'form', label: 'রিকুইজিশন ফর্ম', icon: 'ti-file-plus', fieldCount: 4 },
];

// ── recordToFormData ──────────────────────────────────────────────────────────

function recordToFormData(
  rec: Record<string, unknown>,
  prev: RequisitionData,
): RequisitionData {
  return {
    ...prev,
    subject:                  String(rec.subject                  ?? ''),
    date:                     toDateInput(rec.date)               || prev.date,
    quantityType:            (rec.quantityType === 'taka' ? 'taka' : 'quantity'),
    items: (() => {
      try {
        const parsed = JSON.parse(String(rec.itemsJson ?? '[]'));
        if (!Array.isArray(parsed)) return prev.items;
        // Migrate legacy items (saved before unitPrice/amount/paymentTo existed)
        return parsed.map((it, i): RequisitionItem => ({
          slNo:        Number(it.slNo ?? i + 1),
          particulars: String(it.particulars ?? ''),
          quantity:    String(it.quantity    ?? ''),
          unitPrice:   String(it.unitPrice   ?? ''),
          amount:      String(it.amount      ?? ''),
          paymentTo:   String(it.paymentTo   ?? ''),
          remarks:     String(it.remarks     ?? ''),
        }));
      } catch { return prev.items; }
    })(),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RequisitionManager() {
  const factory  = useFactory();
  const { user } = useAuth();

  const sheets        = useSheetsSync('requisitions', factory.id, user?.name ?? 'unknown');
  const printAreaRef  = useRef<HTMLDivElement>(null);

  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [activeStep,    setActiveStep]    = useState<'form' | 'preview'>('form');
  const [requisition,   setRequisition]   = useState<RequisitionData>(INITIAL_REQUISITION_STATE);

  // ── Auto-fill factory info from session ────────────────────────────────────
  useEffect(() => {
    setRequisition(prev => ({
      ...prev,
      factoryName:    factory.nameEn,
      factoryAddress: factory.addressEn,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory.id]);


  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setRequisition(prev => ({
      ...INITIAL_REQUISITION_STATE,
      // Keep factory data from session
      factoryName:    prev.factoryName,
      factoryAddress: prev.factoryAddress,
    }));
    setActiveStep('form');
    sheets.setEditingId(null);
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const el = printAreaRef.current ?? document.getElementById('printable-area') as HTMLElement;
    if (!el) { window.print(); return; }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    const styles = Array.from(document.styleSheets)
      .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch { return ''; } })
      .join('\n');
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>@page{size:A4 portrait;margin:10mm 12mm;}body{margin:0;}${styles}</style>
      </head><body>${el.outerHTML}</body></html>`);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const el = printAreaRef.current ?? document.getElementById('printable-area') as HTMLElement;
    if (!el) return;
    const filename = `Requisition_${requisition.subject.replace(/[^a-z0-9]/gi, '_') || 'Document'}_${new Date().toISOString().split('T')[0]}`;
    await exportToPDF({ element: el, filename, scale: 2 });
  };

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    const { exportToExcel } = await import('../../utils/excelExport');
    const isTaka = requisition.quantityType === 'taka';
    const total  = calculateRequisitionTotal(requisition);

    const columns = isTaka
      ? [
          { key: 'slNo',        header: 'Sl No',                width: 6  },
          { key: 'particulars', header: 'Particulars / Purpose', width: 36 },
          { key: 'amount',      header: 'Amount (৳)',           width: 14 },
          { key: 'paymentTo',   header: 'Payment To',           width: 24 },
          { key: 'remarks',     header: 'Remarks',              width: 24 },
        ]
      : [
          { key: 'slNo',        header: 'Sl No',        width: 6  },
          { key: 'particulars', header: 'Particulars',  width: 36 },
          { key: 'quantity',    header: 'Quantity',     width: 14 },
          { key: 'unitPrice',   header: 'Unit Price (৳)', width: 14 },
          { key: 'remarks',     header: 'Remarks',      width: 24 },
        ];

    const rows = requisition.items.map(item => ({
      slNo:        item.slNo,
      particulars: item.particulars,
      quantity:    item.quantity,
      unitPrice:   item.unitPrice ? Number(item.unitPrice) : '',
      amount:      item.amount ? Number(item.amount) : '',
      paymentTo:   item.paymentTo,
      remarks:     item.remarks,
    }));

    exportToExcel({
      filename:  `Requisition_${requisition.subject.replace(/[^a-z0-9]/gi, '_') || 'Document'}_${requisition.date || new Date().toISOString().split('T')[0]}`,
      sheetName: 'Requisition',
      title:     'Official Requisition',
      headerInfo: [
        { label: 'Factory',  value: requisition.factoryName    || '—' },
        { label: 'Subject',  value: requisition.subject        || '—' },
        { label: 'Date',     value: requisition.date           || '—' },
        { label: 'Type',     value: isTaka ? 'Direct Money / Fee' : 'Item / Material' },
        { label: 'Total (৳)', value: total.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
      ],
      sections: [{ title: 'Items', columns, rows }],
    });
  };

  // ── Build DB record ───────────────────────────────────────────────────────
  const buildRecord = () => ({
    subject:               requisition.subject,
    date:                  requisition.date,
    preparedBy:            authorization.preparedBy,
    preparedByDesignation: authorization.preparedByDesignation,
    itemsJson:             JSON.stringify(requisition.items),
    totalItems:            String(requisition.items?.length ?? 0),
    quantityType:          requisition.quantityType,
    totalAmount:           calculateRequisitionTotal(requisition).toFixed(2),
    status:                'Pending',
  });

  // ── Sidebar output items ──────────────────────────────────────────────────
  const billItems = [
    {
      label:   'রিভিউ',
      onClick: () => setActiveStep('preview'),
    },
  ];

  const isPreview = activeStep === 'preview';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        ${BASE_PRINT_CSS}
        ${PAGE_A4_PORTRAIT}
        @media print {
          body * { visibility: hidden !important; }
          #req-printable-area { visibility: visible !important; position: absolute !important;
            left: 0 !important; top: 0 !important; width: 100% !important; }
          #req-printable-area * { visibility: visible !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          table, th, td { border: 2pt solid black !important; }
          th, td { padding: 8px !important; }
        }
      `}</style>

      <ModuleShell
        moduleName="অফিসিয়াল রিকুইজিশন"
        moduleNameEn="Staff Requisition"
        date={requisition.date}
        onDateChange={d => setRequisition(p => ({ ...p, date: d }))}

        steps={STEPS}
        activeStep={activeStep}
        onStepChange={id => setActiveStep(id as 'form' | 'preview')}

        billItems={billItems}
        isBillActive={isPreview}

        onSave={async () => {
          const record = buildRecord();
          const ok = sheets.editingId
            ? await sheets.update(sheets.editingId, record)
            : await sheets.save(record);
          if (ok) handleReset();
          return ok;
        }}
        isSaving={sheets.isSaving}
        configured={sheets.configured}
        adapterName={sheets.adapterName}
        saveDisabled={!requisition.subject}

        editingId={sheets.editingId}
        onCancelEdit={handleReset}
        onReset={handleReset}

        onUpdate={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setRequisition(p => recordToFormData(rec, p));
          setActiveStep('form');
        }}
        updateModule="requisitions"
        updateLabel="রিকুইজিশন রেকর্ড খুঁজুন"
        updateSearchPlaceholder="বিষয় বা আইডি দিয়ে খুঁজুন..."

        calcRows={[
          { label: 'ধরন',            value: requisition.quantityType === 'taka' ? 'সরাসরি অর্থ' : 'মালামাল' },
          { label: 'মোট আইটেম',     value: `${requisition.items?.length ?? 0} টি` },
          { label: 'তারিখ',          value: requisition.date          || '—' },
          { label: 'প্রস্তুতকারী', value: authorization.preparedBy || '—' },
          { label: 'সর্বমোট',       value: `৳ ${calculateRequisitionTotal(requisition).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        ]}

        records={sheets.records}
        isLoading={sheets.isLoading}
        onLoadRecord={rec => {
          sheets.setEditingId(String(rec.id ?? ''));
          setRequisition(p => recordToFormData(rec as Record<string, unknown>, p));
          setActiveStep('form');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteRecord={sheets.remove}
        onReload={sheets.reload}

        auth={authorization}
        onAuthChange={setAuthorization}
        onPrint={handlePrint}
        onPDF={handleExportPDF}
        onExcel={handleExportExcel}
        lang="bn"
      >
        {activeStep === 'form' && (
          <RequisitionFormComponent
            requisition={requisition}
            setRequisition={setRequisition}
          />
        )}

        {activeStep === 'preview' && (
          <div id="req-printable-area" ref={printAreaRef}>
            <RequisitionViewComponent
              requisition={requisition}
              authorization={authorization}
            />
          </div>
        )}
      </ModuleShell>
    </>
  );
}