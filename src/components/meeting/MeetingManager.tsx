// ─────────────────────────────────────────────────────────────────────────────
// MeetingManager.tsx
//
// REBUILT on ModuleShell — replaces the hand-rolled ModuleHeader/ModuleNavBar
// layout (mm-shell/mm-topbar/mm-subbar/mm-body/mm-sidebar custom CSS) with
// the same shared shell used by Requisition/Increment/Left Notice.
//
// CHANGES vs previous version:
//  - Removed dual/conflicting persistence: localStorage (auto-save every
//    keystroke + auto-load on mount) ran ALONGSIDE useSheetsSync, meaning a
//    stale draft could silently overwrite a record just loaded from the
//    database. Now uses useSheetsSync exclusively.
//  - buildRecord() now captures the FULL MeetingMinutes shape (~35 fields)
//    instead of 10 — the old record dropped the entire attendees list (only
//    a count survived), the whole approval chain, organization/venue/time
//    details, previous-minutes fields, and more. Flat fields stay as
//    columns; attendees/agendaItems/annexures/distributionList persist as
//    JSON columns, matching the itemsJson pattern used elsewhere.
//  - Removed dead imports (EmployeeSearchBar, ModuleHeader — both were
//    imported but never rendered in the old file).
//  - window.confirm() reset replaced by ModuleShell's built-in confirm.
//  - Sidebar restructured per spec:
//      Form steps:  Basic Info / Agenda / Opening Speech /
//                   Discussion & Decision / Meeting Photo
//      Output:      Notice / Meeting Minutes / Participant List
//    Attendees and Approval Chain are no longer their own form steps —
//    attendees auto-populate from the selected committee (handled in
//    BasicInfoSection.tsx), and approval signatures are now driven by the
//    shared AuthorizationState (President/Secretary added there) instead of
//    the old bespoke ApprovalChainSection.tsx, which is no longer used.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { useFactory } from '../../hooks/useFactory';
import { MeetingMinutes, INITIAL_MEETING_STATE, ALL_FACTORIES } from './MeetingMinutesTypes';
import BasicInfoSection         from './BasicInfoSection';
import OpeningAndClosingSpeech   from './OpeningAndClosingSpeech';
import DiscussionDecisionSection from './DiscussionDecisionSection';
import PhotoSection             from './Photosection';
import ParticipantListSection   from './ParticipantListSection';
import PrintView                from './Printview';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import jsPDF from 'jspdf';
import { BASE_PRINT_CSS, PAGE_A4_PORTRAIT } from '../../utils/printCSS';
import { useAuth } from '../../context/AuthContext';
import { useSheetsSync } from '../../hooks/useSheetsSync';
import ModuleShell from '../shell/ModuleShell';
import { DEFAULT_AUTHORIZATION } from '../common/AuthorizationBlock';
import type { AuthorizationState } from '../common/AuthorizationBlock';

// ── Steps & output items ───────────────────────────────────────────────────

type FormStepId = 'basic' | 'opening' | 'discussion' | 'photo';
type ViewId = FormStepId | 'notice' | 'minutes' | 'participants';

const STEPS: { id: FormStepId; label: string; icon: string }[] = [
  { id: 'basic',      label: 'প্রাথমিক তথ্য',       icon: 'ti-building'      },
  { id: 'opening',    label: 'উদ্বোধনী ও সমাপনী',     icon: 'ti-microphone'    },
  { id: 'discussion', label: 'আলোচনা ও সিদ্ধান্ত',  icon: 'ti-table'         },
  { id: 'photo',      label: 'মিটিং ফটো',            icon: 'ti-photo'         },
];

export default function MeetingManager() {
  const { user }  = useAuth();
  const factory   = useFactory();
  const sheets    = useSheetsSync('meetings', factory.id, user?.name ?? 'unknown');

  const [authorization, setAuthorization] = useState<AuthorizationState>(DEFAULT_AUTHORIZATION);
  const [minutes,    setMinutes]    = useState<MeetingMinutes>(INITIAL_MEETING_STATE);
  const [activeView, setActiveView] = useState<ViewId>('basic');
  const printViewRef = useRef<HTMLDivElement>(null);

  const isOutputView = activeView !== 'basic' && activeView !== 'opening'
    && activeView !== 'discussion' && activeView !== 'photo';
  const activeFormStep: FormStepId =
    (activeView === 'basic' || activeView === 'opening'
      || activeView === 'discussion' || activeView === 'photo') ? activeView : 'basic';

  // ── Keep President/Secretary in sync with the selected committee ────────
  // Whenever chairperson/secretary change (set by BasicInfoSection on
  // committee selection), mirror their name + designation into the shared
  // AuthorizationState so the signature block can show them.
  const syncAuthorityFromCommittee = (m: MeetingMinutes) => {
    const selectedFactory = ALL_FACTORIES.find(f => f.name === m.organizationName);
    const committee = (selectedFactory?.committees ?? ALL_FACTORIES.flatMap(f => f.committees))
      .find(c => c.name === m.meetingTitle);
    if (!committee) return;
    setAuthorization(prev => ({
      ...prev,
      president:            committee.chairperson,
      presidentDesignation: committee.chairpersonDesignation ?? 'সভাপতি',
      secretary:            committee.secretary,
      secretaryDesignation: committee.secretaryDesignation ?? 'সচিব',
      visibility: {
        ...prev.visibility,
        president: true,
        secretary: true,
      },
    }));
  };

  const handleMinutesChange = (m: MeetingMinutes) => {
    setMinutes(m);
    syncAuthorityFromCommittee(m);
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setMinutes(INITIAL_MEETING_STATE);
    setAuthorization(DEFAULT_AUTHORIZATION);
    setActiveView('basic');
  };

  // ── Print / PDF ───────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    const el = printViewRef.current;
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const imgHeight  = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    pdf.save(`Meeting_Minutes_${minutes.meetingTitle || 'document'}.pdf`);
  };

  // Strips trailing lines that contain only dashes/dots/bullets/whitespace
  // (e.g. a stray "- -" left over from editing) while leaving legitimate
  // dashes inside real sentences untouched — only whole lines with no
  // actual letters/digits are removed, and only from the end of the text.
  const cleanSpeechText = (text: string): string => {
    const lines = text.split('\n');
    while (lines.length > 0) {
      const last = lines[lines.length - 1];
      const isSeparatorOnly = last.trim() !== '' && !/[\u0980-\u09FFa-zA-Z0-9]/.test(last);
      const isBlank = last.trim() === '';
      if (isSeparatorOnly || (isBlank && lines.length > 1)) {
        lines.pop();
      } else {
        break;
      }
    }
    return lines.join('\n').trimEnd();
  };

  // ── Build DB record — full MeetingMinutes shape ──────────────────────────
  const buildRecord = () => ({
    organizationName:      minutes.organizationName,
    organizationAddress:   minutes.organizationAddress,
    department:            minutes.department,

    meetingTitle:          minutes.meetingTitle,
    meetingEstablishDate:  minutes.meetingEstablishDate,
    meetingType:           minutes.meetingType,
    meetingNumber:         minutes.meetingNumber,
    noticeDate:            minutes.noticeDate,
    meetingDate:           minutes.meetingDate,
    startTime:             minutes.startTime,
    endTime:               minutes.endTime,
    venue:                 minutes.venue,
    virtualMeetingLink:    minutes.virtualMeetingLink,
    meetingImage:          minutes.meetingImage,

    chairperson:           minutes.chairperson,
    secretary:             minutes.secretary,
    attendeesJson:         JSON.stringify(minutes.attendees ?? []),

    previousMinutesReference:        minutes.previousMinutesReference,
    previousMinutesApproval:         minutes.previousMinutesApproval,
    previousMinutesRejectionDetails: minutes.previousMinutesRejectionDetails,
    agendaJson:            JSON.stringify(minutes.agendaItems ?? []),

    generalNotes:          cleanSpeechText(minutes.generalNotes),
    closingNotes:          cleanSpeechText(minutes.closingNotes),
    annexuresJson:         JSON.stringify(minutes.annexures ?? []),

    nextMeetingDate:       minutes.nextMeetingDate,
    nextMeetingTime:       minutes.nextMeetingTime,
    nextMeetingVenue:      minutes.nextMeetingVenue,

    authorizationJson:     JSON.stringify(authorization),
    distributionJson:      JSON.stringify(minutes.distributionList ?? []),
  });

  const recordToMinutes = (rec: Record<string, unknown>): MeetingMinutes => ({
    ...INITIAL_MEETING_STATE,
    organizationName:      String(rec.organizationName ?? ''),
    organizationAddress:   String(rec.organizationAddress ?? ''),
    department:            String(rec.department ?? ''),
    meetingTitle:           String(rec.meetingTitle ?? ''),
    meetingEstablishDate:   String(rec.meetingEstablishDate ?? ''),
    meetingType:           (String(rec.meetingType ?? 'মাসিক') as MeetingMinutes['meetingType']),
    meetingNumber:          String(rec.meetingNumber ?? ''),
    noticeDate:             String(rec.noticeDate ?? ''),
    meetingDate:            String(rec.meetingDate ?? ''),
    startTime:              String(rec.startTime ?? ''),
    endTime:                String(rec.endTime ?? ''),
    venue:                  String(rec.venue ?? ''),
    virtualMeetingLink:     String(rec.virtualMeetingLink ?? ''),
    meetingImage:           String(rec.meetingImage ?? ''),
    chairperson:            String(rec.chairperson ?? ''),
    secretary:              String(rec.secretary ?? ''),
    attendees:              (() => { try { return JSON.parse(String(rec.attendeesJson ?? '[]')); } catch { return []; } })(),
    previousMinutesReference:        String(rec.previousMinutesReference ?? ''),
    previousMinutesApproval:         (String(rec.previousMinutesApproval ?? 'N/A') as MeetingMinutes['previousMinutesApproval']),
    previousMinutesRejectionDetails: String(rec.previousMinutesRejectionDetails ?? ''),
    agendaItems:            (() => { try { return JSON.parse(String(rec.agendaJson ?? '[]')); } catch { return []; } })(),
    generalNotes:           String(rec.generalNotes ?? ''),
    closingNotes:           String(rec.closingNotes ?? ''),
    annexures:              (() => { try { return JSON.parse(String(rec.annexuresJson ?? '[]')); } catch { return []; } })(),
    nextMeetingDate:        String(rec.nextMeetingDate ?? ''),
    nextMeetingTime:        String(rec.nextMeetingTime ?? ''),
    nextMeetingVenue:       String(rec.nextMeetingVenue ?? ''),
    distributionList:       (() => { try { return JSON.parse(String(rec.distributionJson ?? '[]')); } catch { return []; } })(),
  });

  const loadRecord = (rec: Record<string, unknown>) => {
    sheets.setEditingId(String(rec.id ?? ''));
    setMinutes(recordToMinutes(rec));
    try {
      const savedAuth = JSON.parse(String(rec.authorizationJson ?? ''));
      if (savedAuth) setAuthorization(savedAuth);
    } catch { /* keep current authorization if parse fails */ }
    setActiveView('basic');
  };

  // ── Sidebar output items ──────────────────────────────────────────────────
  const billItems = [
    { label: 'নোটিশ',              onClick: () => setActiveView('notice') },
    { label: 'সভার কার্যবিবরণী',    onClick: () => setActiveView('minutes') },
    { label: 'উপস্থিতি তালিকা',     onClick: () => setActiveView('participants') },
  ];

  return (
    <>
      <style>{`${BASE_PRINT_CSS}${PAGE_A4_PORTRAIT}`}</style>

      <ModuleShell
        moduleName="সভার কার্যবিবরণী"
        moduleNameEn="Meeting Minutes"
        date={minutes.meetingDate}
        onDateChange={d => handleMinutesChange({ ...minutes, meetingDate: d })}

        steps={STEPS}
        activeStep={activeFormStep}
        onStepChange={id => setActiveView(id as FormStepId)}

        billItems={billItems}
        isBillActive={isOutputView}

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
        saveDisabled={!minutes.meetingTitle}

        editingId={sheets.editingId}
        onCancelEdit={handleReset}
        onReset={handleReset}

        onUpdate={loadRecord}
        updateModule="meetings"
        updateLabel="মিটিং রেকর্ড খুঁজুন"
        updateSearchPlaceholder="মিটিং শিরোনাম দিয়ে খুঁজুন..."

        records={sheets.records}
        isLoading={sheets.isLoading}
        onLoadRecord={rec => loadRecord(rec as Record<string, unknown>)}
        onDeleteRecord={sheets.remove}
        onReload={sheets.reload}

        auth={authorization}
        onAuthChange={setAuthorization}
        onPrint={handlePrint}
        onPDF={handleExportPDF}
        lang="bn"
      >
        {activeView === 'basic' && (
          <BasicInfoSection minutes={minutes} setMinutes={handleMinutesChange} />
        )}

        {activeView === 'opening' && (
          <OpeningAndClosingSpeech minutes={minutes} setMinutes={setMinutes} />
        )}

        {activeView === 'discussion' && (
          <DiscussionDecisionSection minutes={minutes} setMinutes={setMinutes} />
        )}

        {activeView === 'photo' && (
          <PhotoSection minutes={minutes} setMinutes={setMinutes} />
        )}

        {activeView === 'notice' && (
          <div id="printable-area" ref={printViewRef}>
            <PrintView minutes={minutes} printOption="notice" authorization={authorization} />
          </div>
        )}

        {activeView === 'minutes' && (
          <div id="printable-area" ref={printViewRef}>
            <PrintView
              minutes={minutes}
              authorization={authorization}
              viewSections={{
                basic:      true,   // সাধারণ তথ্য (includes মিটিং ছবি)
                agenda:     true,   // আলোচ্যসূচি ও সিদ্ধান্ত
                attendance: false,  // has its own separate output item
                notice:     false,
                approval:   false,
              }}
            />
          </div>
        )}

        {activeView === 'participants' && (
          <div id="printable-area" ref={printViewRef}>
            <ParticipantListSection minutes={minutes} />
          </div>
        )}
      </ModuleShell>
    </>
  );
}