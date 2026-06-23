import {
  MeetingMinutes,
  calculateDuration,
  getAttendanceSummary,
  Committee,
} from './MeetingMinutesTypes';
import { ALL_FACTORIES } from '../../factories/FactoryRegistry';
import { useFactory } from '../../hooks/useFactory';
import type { AuthorizationState } from '../common/AuthorizationBlock';

// ══════════════════════════════════════════════════════════
// BANGLA NUMBER / DATE / TIME HELPERS
// ══════════════════════════════════════════════════════════

const toBanglaNumber = (num: string | number | undefined): string => {
  if (num === undefined || num === null) return '';
  const map: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };
  return num.toString().replace(/\d/g, d => map[d]);
};

const BANGLA_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার',
];

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const formatBanglaDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const d = toBanglaNumber(date.getDate());
    const m = BANGLA_MONTHS[date.getMonth()];
    const y = toBanglaNumber(date.getFullYear());
    return `${d} ${m}, ${y}`;
  } catch { return '[তারিখ]'; }
};

const formatDateBangla = (dateString: string): string => {
  if (!dateString) return '';
  const date  = new Date(dateString);
  const day   = toBanglaNumber(String(date.getDate()).padStart(2, '0'));
  const month = BANGLA_MONTHS[date.getMonth()];
  const year  = toBanglaNumber(date.getFullYear());
  return `${day} ${month} ${year}`;
};

const formatDateFullBangla = (dateString: string): string => {
  if (!dateString) return '';
  const date    = new Date(dateString);
  const dayName = BANGLA_DAYS[date.getDay()];
  const day     = toBanglaNumber(String(date.getDate()).padStart(2, '0'));
  const month   = BANGLA_MONTHS[date.getMonth()];
  const year    = toBanglaNumber(date.getFullYear());
  return `${dayName}, ${day} ${month} ${year}`;
};

const formatTimeBangla = (timeString: string): string => {
  if (!timeString) return '';
  const [h, m] = timeString.split(':');
  const hour   = parseInt(h);
  const display = hour % 12 || 12;
  return `${toBanglaNumber(String(display).padStart(2, '0'))}:${toBanglaNumber(m)}`;
};

const getTimePeriod = (timeString: string): string => {
  if (!timeString) return '';
  const hour = parseInt(timeString.split(':')[0]);
  if (hour >= 5  && hour < 12) return 'সকাল';
  if (hour >= 12 && hour < 15) return 'দুপুর';
  if (hour >= 15 && hour < 18) return 'বিকাল';
  if (hour >= 18 && hour < 20) return 'সন্ধ্যা';
  return 'রাত';
};

const formatTo12Hour = (timeString: string): string => {
  if (!timeString) return '[সময়]';
  let [hours, minutes] = timeString.split(':').map(Number);
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `০${minutes}` : minutes;
  return toBanglaNumber(`${hours}:${formattedMinutes}`);
};

const formatDurationBangla = (duration: string): string => {
  if (!duration) return '';
  return duration
    .replace(/(\d+)/g, m => toBanglaNumber(m))
    .replace('hours',   'ঘণ্টা')
    .replace('hour',    'ঘণ্টা')
    .replace('minutes', 'মিনিট')
    .replace('minute',  'মিনিট');
};

const attendanceStatusBangla = (s: string): string => {
  const map: Record<string, string> = {
    Present: 'উপস্থিত',
    Absent:  'অনুপস্থিত',
    Excused: 'অনুমতিপ্রাপ্ত',
    Late:    'বিলম্বিত',
  };
  return map[s] ?? s;
};

// Treats whitespace-only or punctuation-only content (stray dashes, dots,
// leftover separators) as effectively empty — only real letters/digits
// (Bengali or Latin) count as meaningful text for সভার উদ্বোধনী/সমাপনী.
const hasMeaningfulText = (s: string | undefined): boolean =>
  !!s && /[\u0980-\u09FFa-zA-Z0-9]/.test(s);

// Strips trailing lines that contain only dashes/dots/bullets/whitespace
// (e.g. a stray "- -" left over from editing). Applied at display time too
// so records saved before this cleanup existed self-heal automatically,
// not just newly-saved ones.
const cleanSpeechText = (text: string | undefined): string => {
  if (!text) return '';
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

// ══════════════════════════════════════════════════════════
// GENDER COMPUTATION FROM COMMITTEE DATA
// ══════════════════════════════════════════════════════════

function computeCommitteeGender(committee: Committee | undefined) {
  if (!committee) return { male: 0, female: 0, total: 0 };
  const allGenders: string[] = [];
  if (committee.chairpersonGender) allGenders.push(committee.chairpersonGender);
  if (committee.secretaryGender)   allGenders.push(committee.secretaryGender);
  for (const m of committee.members ?? []) {
    if (m.gender) allGenders.push(m.gender);
  }
  const male   = allGenders.filter(g => g === 'পুরুষ').length;
  const female = allGenders.filter(g => g === 'মহিলা').length;
  return { male, female, total: allGenders.length };
}

// ══════════════════════════════════════════════════════════
// IMAGE NORMALIZATION
// ══════════════════════════════════════════════════════════

const normaliseImages = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return (raw as string[]).filter(Boolean);
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  return [];
};

// ══════════════════════════════════════════════════════════
// STATUS CHECKBOXES — print-friendly 3-option row
// ══════════════════════════════════════════════════════════

function StatusCheckboxes({ status }: { status: string }) {
  const options = [
    { key: 'Pending',     label: 'অপেক্ষমান' },
    { key: 'In Progress', label: 'চলমান'      },
    { key: 'Completed',   label: 'সম্পন্ন'    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {options.map(opt => {
        const checked = status === opt.key;
        return (
          <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Checkbox box - সর্বদা খালি থাকবে */}
            <div style={{
              width: '13px',
              height: '13px',
              border: '1.5px solid #333', // বর্ডার থাকবে
              borderRadius: '2px',
              backgroundColor: 'transparent', // ব্যাকগ্রাউন্ড সর্বদা স্বচ্ছ
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {/* টিক চিহ্ন সরিয়ে দেওয়া হয়েছে */}
            </div>
            
            {/* টেক্সট - শুধু এটিই বোল্ড হবে যদি সিলেক্টেড থাকে */}
            <span style={{
              fontSize: '11px',
              fontWeight: checked ? 'bold' : 'normal',
              color: checked ? '#000' : '#555',
              lineHeight: '1.3',
            }}>
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function NoticeParagraph({ minutes }: { minutes: MeetingMinutes }) {
  const banglaDay = minutes.meetingDate 
    ? BANGLA_DAYS[new Date(minutes.meetingDate).getDay()] 
    : '[দিন]';
  const formattedDate = minutes.meetingDate 
    ? formatBanglaDate(minutes.meetingDate) 
    : '[তারিখ]';
  const formattedTime = minutes.startTime 
    ? formatTo12Hour(minutes.startTime) 
    : '[সময়]';

  const commonStyle: React.CSSProperties = {
    fontSize: '20px',
    lineHeight: '1.8',
    textAlign: 'justify',
    margin: '0',
    fontWeight: 'normal',
    color: '#000',
    paddingLeft: '0', // নিশ্চিত করা হয়েছে কোনো বাম্প নেই
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* প্রথম প্যারাগ্রাফ: সভার তথ্য */}
      <p style={commonStyle}>
        এতদ্বারা {minutes.organizationName || '[কারখানার নাম]'} এর {minutes.meetingTitle || '[কমিটির নাম]'} -র সকল সদস্যগণের অবগতির জন্য জানানো যাচ্ছে যে, আগামী {formattedDate} ইং তারিখ রোজ {banglaDay} {getTimePeriod(minutes.startTime) && (
          <span>{getTimePeriod(minutes.startTime)}{' '}</span>
        )} {formattedTime} ঘটিকার সময় কারখানার অভ্যন্তরে {minutes.venue || '[স্থান]'} এ একটি জরুরী আলোচনা সভা অনুষ্ঠিত হবে।
      </p>

      {/* দ্বিতীয় প্যারাগ্রাফ: সকল লাইনের শুরুর বিন্দু একই থাকবে */}
      <p style={commonStyle}>
        উক্ত সভায় {minutes.meetingTitle || '[কমিটির নাম]'} -র সকল সদস্যগণকে যথা সময়ে নির্দিষ্ট স্থানে উপস্থিত থাকার জন্য বিশেষভাবে অনুরোধ করা হলো।
      </p>
      
    </div>
  );
}

function MeetingPhoto({ src, index }: { src: string; index: number }) {
  return (
    <div style={{ position: 'relative', display: 'block' }}>
      <img
        src={src} alt={`মিটিং ছবি ${index + 1}`}
        style={{ width: '100%', height: 'auto', maxHeight: '320px', border: '2px solid black', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════

interface ViewSections {
  basic: boolean; agenda: boolean; notice: boolean; attendance: boolean; approval: boolean;
}

interface Props {
  minutes: MeetingMinutes;
  printOption?: 'all' | 'basic' | 'attendance' | 'agenda' | 'notice';
  viewSections?: ViewSections;
  /** Approval signatures — sourced from the shared Authorization panel.
   *  "Prepared By" is always hidden for this module; President/Secretary
   *  (auto-filled from the selected committee) plus Authorized 1/2 /
   *  Approved 1/2 are user-selectable via the same visibility checkboxes
   *  used by other modules. */
  authorization?: AuthorizationState;
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════

export default function PrintView({ minutes, printOption, viewSections, authorization }: Props) {
  const factory = useFactory();

  const attendanceSummary = getAttendanceSummary(minutes.attendees);
  const duration          = calculateDuration(minutes.startTime, minutes.endTime);
  const meetingImages     = normaliseImages(minutes.meetingImage);

  const selectedFactory   = ALL_FACTORIES.find(f => f.name === minutes.organizationName);
  const selectedCommittee = selectedFactory?.committees.find(c => c.name === minutes.meetingTitle);
  const genderCount       = computeCommitteeGender(selectedCommittee);

  const showSection = (section: string): boolean => {
    if (viewSections) {
      switch (section) {
        case 'basic':      return viewSections.basic;
        case 'attendance': return viewSections.attendance;
        case 'agenda':     return viewSections.agenda;
        case 'notice':     return viewSections.notice;
        case 'approval':   return viewSections.approval;
        default:           return false;
      }
    }
    if (printOption === 'all') return true;
    if (printOption === 'basic'      && (section === 'basic' || section === 'agenda')) return true;
    if (printOption === 'attendance' && section === 'attendance') return true;
    if (printOption === 'agenda'     && section === 'agenda')     return true;
    if (printOption === 'notice'     && section === 'notice')     return true;
    return false;
  };

  const showSignatures = viewSections
    ? viewSections.approval
    : printOption !== 'notice' && printOption !== 'attendance';

  // Approval signatures now come from the shared AuthorizationState rather
  // than bespoke fields on MeetingMinutes — see renderSignatureBlocks below
  // for how each role is resolved (factory.authorities for the 4 standard
  // roles, authorization.president/secretary for the committee-specific ones).
  const hasAnyApproval = !!authorization && (
    authorization.visibility.hrManager ||
    authorization.visibility.factoryHead ||
    authorization.visibility.hoHrHead ||
    authorization.visibility.headOfOperations ||
    !!(authorization.visibility?.president && authorization.president) ||
    !!(authorization.visibility?.secretary && authorization.secretary)
  );

  const infoRows = [
    // { label: 'মিটিং শিরোনাম', value: minutes.meetingTitle },
    { label: 'মিটিং ধরন',      value: minutes.meetingType },
    { label: 'তারিখ',           value: formatDateFullBangla(minutes.meetingDate) },
    {
      label: 'সময়',
      value: (
        <>
          {getTimePeriod(minutes.startTime) && <span style={{ fontWeight: '600' }}>{getTimePeriod(minutes.startTime)} </span>}
          {formatTimeBangla(minutes.startTime)} –{' '}
          {getTimePeriod(minutes.endTime) && <span style={{ fontWeight: '600' }}>{getTimePeriod(minutes.endTime)} </span>}
          {formatTimeBangla(minutes.endTime)}
          {duration && ` (মোট: ${formatDurationBangla(duration)})`}
        </>
      ),
    },
    { label: 'স্থান',   value: minutes.venue },
    { label: 'সভাপতি', value: minutes.chairperson },
    { label: 'সচিব',   value: minutes.secretary },
    ...(minutes.meetingEstablishDate ? [{ label: 'কমিটি প্রতিষ্ঠার তারিখ', value: formatDateBangla(minutes.meetingEstablishDate) }] : []),
    ...(genderCount.total > 0 ? [{
      label: 'মোট সদস্য',
      value: `নারী ${toBanglaNumber(genderCount.female)} জন (${toBanglaNumber(Math.round((genderCount.female / genderCount.total) * 100))}%), পুরুষ ${toBanglaNumber(genderCount.male)} জন (${toBanglaNumber(Math.round((genderCount.male / genderCount.total) * 100))}%), মোট ${toBanglaNumber(genderCount.total)} জন`,
    }] : []),
    ...(minutes.meetingNumber ? [{ label: 'রেফারেন্স নম্বর', value: minutes.meetingNumber }] : []),
  ];

  // ── Shared signature block renderer ─────────────────────────────────────
  const renderSignatureBlocks = (forNotice = false) => {
    const auth = authorization;
    const a    = factory.authorities;
    const activeSections = [
      // President/Secretary — committee-driven, name/designation come from
      // the authorization state itself (set when a committee is selected),
      // not from factory.authorities like the 4 roles below. Also shows the
      // committee name as a 3rd line under the designation.
      { show: !!(auth && auth.visibility?.president && auth.president), name: auth?.president ?? '', desig: auth?.presidentDesignation ?? 'সভাপতি', sub: minutes.meetingTitle, date: '', label: '--' },
      { show: !!(auth && auth.visibility?.secretary && auth.secretary), name: auth?.secretary ?? '', desig: auth?.secretaryDesignation ?? 'সচিব', sub: minutes.meetingTitle, date: '', label: '--' },
      { show: !!auth?.visibility.hrManager,        name: a.hrManager.name,        desig: a.hrManager.designation,        sub: '', date: '', label: '--' },
      { show: !!auth?.visibility.factoryHead,       name: a.factoryHead.name,       desig: a.factoryHead.designation,       sub: '', date: '', label: 'কর্তৃপক্ষ ১' },
      { show: !!auth?.visibility.hoHrHead,           name: a.hoHrHead.name,           desig: a.hoHrHead.designation,           sub: '', date: '', label: '--' },
      { show: !!auth?.visibility.headOfOperations,   name: a.headOfOperations.name,   desig: a.headOfOperations.designation,   sub: '', date: '', label: 'কর্তৃপক্ষ ২' },
    ].filter(section => section.show && section.name);

    const count = activeSections.length;

    // ডাইনামিক টেক্সট অ্যালাইনমেন্ট লজিক
    const getTextAlign = (idx: number) => {
      if (count === 1) return 'left';
      if (count === 2) return idx === 0 ? 'left' : 'right';
      if (idx === 0) return 'left';
      if (idx === count - 1) return 'right';
      return 'center';
    };

    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap', // ওভারফ্লো রোধ করতে লাইন ব্রেক করবে
        justifyContent: count === 1 ? 'flex-start' : 'space-between',
        gap: '30px 15px', // ভার্টিকাল এবং হরিজন্টাল গ্যাপ
        marginTop: '60px',
        width: '100%',
        pageBreakInside: 'avoid' // প্রিন্ট করার সময় যেন সিগনেচার মাঝখান দিয়ে না কাটে
      }}>
        {activeSections.map((sig, idx) => (
          <div key={idx} style={{ 
            textAlign: getTextAlign(idx),
            // ডাইনামিক উইডথ: ৩ জন হলে ৩৩%, ২ জন হলে ৪৫%, ১ জন হলে ১০০% বা নির্দিষ্ট
            flex: count === 1 ? '0 1 250px' : `0 1 calc(${100 / count}% - 20px)`,
            minWidth: '180px', // খুব ছোট হয়ে যাওয়া রোধ করবে
            maxWidth: count === 1 ? '250px' : '300px'
          }}>
            {/* লেবেল */}
            {!forNotice && (
              <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#333' }}>
                {sig.label}
              </p>
            )}

            {/* স্বাক্ষর করার খালি জায়গা */}
            <div style={{ height: forNotice ? '64px' : '52px' }} />

            {/* স্বাক্ষর রেখা ও তথ্য */}
            <div style={{ 
              borderTop: '2px solid black', 
              paddingTop: '8px',
              width: '100%'
            }}>
              <p style={{ fontWeight: 'bold', fontSize: forNotice ? '20px' : '18px', marginBottom: '2px', color: '#000' }}>
                {sig.name}
              </p>
              <p style={{ fontSize: forNotice ? '18px' : '16px', color: '#444', marginBottom: sig.sub ? '1px' : '3px' }}>
                {sig.desig}
              </p>
              {sig.sub && (
                <p style={{ fontSize: forNotice ? '16px' : '14px', color: '#444', marginBottom: '3px' }}>
                  {sig.sub}
                </p>
              )}
              {!forNotice && (
                <p style={{ fontSize: '16px', color: '#666', whiteSpace: 'nowrap' }}>
                  তারিখ: {sig.date ? formatDateBangla(sig.date) : '___________'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <>
      <div className="print-page" style={{
        padding: '0px',
        maxWidth: '210mm',
        margin: '0 auto',
        backgroundColor: 'white',
        fontFamily: "'Noto Sans Bengali', Arial, sans-serif",
      }}>

        {/* ══ HEADER ══ */}
        <header className="print-header" style={{
          textAlign: 'center',
          borderBottom: '2px solid black',
          paddingBottom: '12px',
          marginBottom: '16px',
          pageBreakAfter: 'avoid',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'black', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1.2' }}>
            {minutes.organizationName || 'ORGANIZATION NAME'}
          </h1>
          <p style={{ fontSize: '12px', color: 'black', marginBottom: '0', lineHeight: '1.4' }}>
            {minutes.organizationAddress || 'Address'}
          </p>
        </header>

        <main className="print-body" style={{ minHeight: '50vh' }}>

          {/* ══════════ NOTICE SECTION ══════════ */}
          {showSection('notice') && (
            <div className="print-single-page" style={{ marginBottom: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '50px', pageBreakAfter: 'avoid' }}>
                <h3 style={{ fontSize: '30px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px', lineHeight: '1.3' }}>
                  অফিস নোটিশ
                </h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '30px', fontSize: '14px', fontWeight: '600', pageBreakAfter: 'avoid' }}>
                <div style={{ lineHeight: '1.4' }}>সূত্র: {minutes.meetingNumber || 'N/A'}</div>
                <div style={{ lineHeight: '1.4' }}>তারিখ: {formatDateBangla(minutes.meetingDate)}</div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <NoticeParagraph minutes={minutes} />
              </div>
{minutes.agendaItems.length > 0 && (() => {
  const n = minutes.agendaItems.length;
  const agendaFontSize = n <= 5 ? 20 : n <= 8 ? 17 : n <= 12 ? 15 : 13;
  const agendaLineHeight = n <= 5 ? 1.8 : n <= 8 ? 1.6 : 1.4;
  return (
  <div style={{ marginBottom: '32px', pageBreakInside: 'avoid', marginTop: '10px' }}>
    {/* শিরোনাম - আন্ডারলাইনসহ স্মার্ট লুক */}
    <p style={{ 
      marginBottom: '15px', 
      fontSize: '20px', 
      lineHeight: '1.4',
      fontWeight: 'normal',
      textDecoration: 'underline', // আন্ডারলাইন নিশ্চিত করা হয়েছে
      textUnderlineOffset: '5px'   // আন্ডারলাইনটি টেক্সট থেকে সামান্য নিচে রাখার জন্য
    }}>
      আলোচ্যসূচি:
    </p>

    {/* বুলেট লিস্ট - ইটালিক স্টাইলসহ */}
    <ul style={{ 
      listStyleType: 'disc', 
      listStylePosition: 'outside', 
      fontSize: `${agendaFontSize}px`, 
      lineHeight: agendaLineHeight, 
      margin: '0', 
      padding: '0 0 0 25px' 
    }}>
      {minutes.agendaItems.map((item, i) => (
        <li key={i} style={{ 
          marginBottom: '8px',
          fontStyle: 'italic', // ইটালিক নিশ্চিত করা হয়েছে
          fontWeight: 'normal',
          textAlign: 'justify'
        }}>
          {item.topic || `বিষয় ${i + 1}`}
        </li>
      ))}
    </ul>
  </div>
  );
})()}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '20px', lineHeight: '1.4', margin: '0' }}>ধন্যবাদান্তে,</p>
              </div>
              {hasAnyApproval && (
                <div style={{ marginTop: '64px', pageBreakInside: 'avoid' }}>
                  {renderSignatureBlocks(true)}
                </div>
              )}
            </div>
          )}

          {/* ══ DOCUMENT TITLE (non-notice pages) ══ */}
          {!showSection('notice') && (showSection('basic') || showSection('agenda') || showSection('attendance')) && (
            <div style={{ textAlign: 'center', marginBottom: '20px', pageBreakAfter: 'avoid' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0', borderBottom: '2px solid black', display: 'inline-block', paddingBottom: '4px', paddingLeft: '16px', paddingRight: '16px', lineHeight: '1.3' }}>
                {(minutes.meetingTitle || '--') + ' এর সভার কার্যবিবরণী'}
              </h2>
            </div>
          )}

          {/* ══════════ GENERAL INFO ══════════ */}
          {showSection('basic') && (
            <div style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
              <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>
                সাধারণ তথ্য
              </h3>
              <table style={{ width: '100%', fontSize: '13px', border: '2px solid black', borderCollapse: 'collapse' }}>
                <tbody>
                  {infoRows.map(({ label, value }, idx) => (
                    <tr key={idx} style={idx < infoRows.length - 1 ? { borderBottom: '1px solid black' } : {}}>
                      <td style={{ fontWeight: 'bold', padding: '10px', width: '35%', borderRight: '1px solid black', backgroundColor: '#f9fafb', lineHeight: '1.4' }}>{label}:</td>
                      <td style={{ padding: '10px', lineHeight: '1.4', fontWeight: (label === 'সভাপতি' || label === 'সচিব') ? '600' : undefined }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {meetingImages.length > 0 && (
                <div style={{ marginTop: '20px', pageBreakInside: 'avoid' }}>
                  <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>মিটিং ছবি</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: meetingImages.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                    {meetingImages.map((src, i) => <MeetingPhoto key={i} src={src} index={i} />)}
                  </div>
                </div>
              )}

              {hasMeaningfulText(minutes.generalNotes) && (
                <div style={{ marginTop: '20px', pageBreakInside: 'avoid' }}>
                  <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>সভার উদ্বোধনী</h3>
                  <div style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '13px', lineHeight: '1.7', textAlign: 'justify' }}>
                    {cleanSpeechText(minutes.generalNotes)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════ ATTENDANCE ══════════ */}
          {showSection('attendance') && (
            <div className="print-single-page" style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
              <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>
                উপস্থিতি তালিকা
              </h3>
              <p style={{ fontSize: '12px', marginBottom: '12px', fontWeight: '600', lineHeight: '1.6' }}>
                মোট: {toBanglaNumber(attendanceSummary.total)} |&nbsp;
                উপস্থিত: {toBanglaNumber(attendanceSummary.present)} |&nbsp;
                অনুপস্থিত: {toBanglaNumber(attendanceSummary.absent)} |&nbsp;
                উপস্থিতির হার: {toBanglaNumber(attendanceSummary.presentPercentage)}%
              </p>
              <table style={{ width: '100%', border: '2px solid black', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    {['ক্রম','নাম','পদবি','বিভাগ / সেকশন','কমিটিতে ভূমিকা','উপস্থিতি','স্বাক্ষর'].map((h, i) => (
                      <th key={i} style={{ border: '1px solid black', padding: '10px', textAlign: i === 0 || i >= 4 ? 'center' : 'left', fontWeight: 'bold', lineHeight: '1.4', width: i === 0 ? '50px' : i === 4 ? '90px' : i === 5 ? '100px' : i === 6 ? '140px' : undefined }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {minutes.attendees.map((att, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center', fontWeight: '600', lineHeight: '1.4' }}>{toBanglaNumber(i + 1)}</td>
                      <td style={{ border: '1px solid black', padding: '10px', lineHeight: '1.4' }}>{att.name}</td>
                      <td style={{ border: '1px solid black', padding: '10px', lineHeight: '1.4' }}>{att.designation}</td>
                      <td style={{ border: '1px solid black', padding: '10px', lineHeight: '1.4' }}>{att.department}</td>
                      <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center', lineHeight: '1.4' }}>{att.committeeRole || '—'}</td>
                      <td style={{ border: '1px solid black', padding: '10px', textAlign: 'center', fontWeight: '600', lineHeight: '1.4' }}>{attendanceStatusBangla(att.attendanceStatus)}</td>
                      <td style={{ border: '1px solid black', padding: '10px' }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              AGENDA — Table format matching the image
              নং | আলোচ্যসূচি ও আলোচনা | সিদ্ধান্ত | দায়িত্ব | সময়সীমা | অবস্থা
          ══════════════════════════════════════════════════ */}
          {showSection('agenda') && minutes.agendaItems.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>
                আলোচ্যসূচি ও সিদ্ধান্ত
              </h3>

              <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '5%' }} />   {/* নং */}
                  <col style={{ width: '25%' }} />  {/* আলোচ্যসূচি */}
                  <col style={{ width: '31%' }} />  {/* আলোচনা ও সিদ্ধান্ত */}
                  <col style={{ width: '15%' }} />  {/* দায়িত্ব */}
                  <col style={{ width: '11%' }} />  {/* সময়সীমা */}
                  <col style={{ width: '13%' }} />  {/* অবস্থা */}
                </colgroup>

                {/* ── Header ── */}
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    {[
                      { title: 'নং', align: 'center' },
                      { title: 'আলোচ্যসূচি', align: 'left' },
                      { title: 'আলোচনা ও সিদ্ধান্ত', align: 'left' },
                      { title: 'দায়িত্ব', align: 'left' },
                      { title: 'সময়সীমা', align: 'center' },
                      { title: 'অবস্থা', align: 'center' },
                    ].map((col, i) => (
                      <th
                        key={i}
                        style={{
                          border: '1px solid black',
                          padding: col.align === 'center' ? '9px 8px' : '9px 10px',
                          textAlign: col.align as 'left' | 'center',
                          fontWeight: 'bold',
                          lineHeight: 1.5,
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* ── Rows ── */}
                <tbody>
                  {minutes.agendaItems.map((agenda, index) => {
                    const primaryDecision = agenda.decisions[0];
                    const primaryAction   = agenda.actionItems[0];

                    return (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa', pageBreakInside: 'avoid' }}>

                        {/* নং */}
                        <td style={{ border: '1px solid black', padding: '10px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', verticalAlign: 'top', lineHeight: '1.4' }}>
                          {toBanglaNumber(String(index + 1).padStart(2, '0'))}
                        </td>

                        {/* আলোচ্যসূচি */}
                        <td style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', lineHeight: '1.7' }}>
                          {agenda.topic
                            ? <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{agenda.topic}</div>
                            : <span style={{ color: '#aaa' }}>—</span>}
                        </td>

                        {/* আলোচনা ও সিদ্ধান্ত */}
                        <td style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', lineHeight: '1.7' }}>
                          {primaryDecision?.description
                            ? <div style={{ fontSize: '11px', textAlign: 'justify' }}>{primaryDecision.description}</div>
                            : <span style={{ color: '#aaa' }}>—</span>}
                        </td>

                        {/* দায়িত্ব */}
                        <td style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', fontSize: '11px', lineHeight: '1.6' }}>
                          {primaryAction?.assignedTo || <span style={{ color: '#aaa' }}>—</span>}
                        </td>

                        {/* সময়সীমা */}
                        <td style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top', fontSize: '11px', lineHeight: '1.6', textAlign: 'center' }}>
                          {primaryAction?.dueDate
                            ? formatDateBangla(primaryAction.dueDate)
                            : <span style={{ color: '#aaa' }}>—</span>
                          }
                        </td>

                        {/* অবস্থা — 3 checkboxes */}
                        <td style={{ border: '1px solid black', padding: '10px', verticalAlign: 'top' }}>
                          <StatusCheckboxes status={primaryAction?.status ?? ''} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ══════════ CLOSING SPEECH (prints after Discussion & Decision table) ══════════ */}
          {showSection('agenda') && hasMeaningfulText(minutes.closingNotes) && (
            <div style={{ marginTop: '24px', pageBreakInside: 'avoid' }}>
              <h3 style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '6px', marginBottom: '16px', fontSize: '15px', lineHeight: '1.3' }}>সভার সমাপনী</h3>
              <div style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb', fontSize: '13px', lineHeight: '1.7', textAlign: 'justify' }}>
                {cleanSpeechText(minutes.closingNotes)}
              </div>
            </div>
          )}

        </main>

        {/* ══════════ APPROVAL FOOTER ══════════ */}
        {showSignatures && hasAnyApproval && (
          <footer className="print-footer" style={{ marginTop: '8px', paddingTop: '4px', pageBreakInside: 'avoid' }}>
            {/* <h3 style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '14px', textAlign: 'center', lineHeight: '1.3' }}>
              অনুমোদন ও স্বাক্ষর
            </h3> */}
            {renderSignatureBlocks(false)}

            {/* {(minutes.nextMeetingDate || minutes.nextMeetingTime || minutes.nextMeetingVenue) && (
              <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '4px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', lineHeight: '1.4' }}>পরবর্তী মিটিং:</p>
                <p style={{ fontSize: '11px', lineHeight: '1.4' }}>
                  {minutes.nextMeetingDate && `তারিখ: ${formatDateFullBangla(minutes.nextMeetingDate)}`}
                  {minutes.nextMeetingTime && ` | সময়: ${getTimePeriod(minutes.nextMeetingTime) ? getTimePeriod(minutes.nextMeetingTime) + ' ' : ''}${formatTimeBangla(minutes.nextMeetingTime)}`}
                  {minutes.nextMeetingVenue && ` | স্থান: ${minutes.nextMeetingVenue}`}
                </p>
              </div>
            )} */}
          </footer>
        )}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 19mm; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; font-family: 'Noto Sans Bengali', Arial, sans-serif !important; }

          /* ModuleShell renders this content inside a narrow, constrained
             grid column with overflow:hidden on several ancestors. Without
             this escape mechanism the printed output shrinks into that
             narrow column instead of using the full A4 page — same root
             cause already fixed in EmployeeNotice.tsx / Envelope.tsx. */
          body * { visibility: hidden; }
          .print-page, .print-page * { visibility: visible; }
          .print-page {
            position: absolute !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important; max-width: 100% !important;
            background: white !important; padding: 0 !important;
          }
          html, body, body * { overflow: visible !important; }

          footer:not(.print-footer), .app-footer, .page-footer, .developer-footer, .copyright-footer,
          [class*="copyright"], [class*="developer"], [class*="technology"], [class*="powered"], [class*="credit"],
          div[class*="footer"]:not(.print-footer), div[id*="footer"]:not(.print-footer) {
            display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; overflow: hidden !important;
          }
          table th { background-color: #e5e7eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table, th, td { border-color: black !important; }
          p, li, td, th { orphans: 3; widows: 3; }
          h1, h2, h3, h4, h5, h6 { page-break-after: avoid; orphans: 4; widows: 4; }
          tr { page-break-inside: avoid; }

          /* Notice and Attendance/Participant List must always fit on a
             single printed page — keep the whole block together rather
             than letting it spill onto a second page. */
          .print-single-page {
            page-break-inside: avoid;
            page-break-after: avoid;
            page-break-before: avoid;
          }
        }
      `}</style>
    </>
  );
}