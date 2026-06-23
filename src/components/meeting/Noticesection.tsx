import { MeetingMinutes } from './MeetingMinutesTypes';

// ==================== NOTICE PARAGRAPH COMPONENT ====================

// ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর করার ফাংশন
const toBanglaNumber = (num: string | number | undefined): string => {
  if (num === undefined || num === null) return '';
  const banglaDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().replace(/\d/g, (digit) => banglaDigits[digit]);
};

// ২৪ ঘণ্টা থেকে ১২ ঘণ্টার ফরম্যাটে রূপান্তর করার ফাংশন
const formatTo12Hour = (timeString: string): string => {
  if (!timeString) return '[সময়]';
  let [hours, minutes] = timeString.split(':').map(Number);
  hours = hours % 12 || 12; // ০ হলে ১২ হবে, আর ১২ এর বেশি হলে ১২ বিয়োগ হবে
  const formattedMinutes = minutes < 10 ? `০${minutes}` : minutes;
  return toBanglaNumber(`${hours}:${formattedMinutes}`);
};

const BANGLA_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার',
  'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

// সময়ের ওপর ভিত্তি করে সকাল/দুপুর/বিকাল নির্ধারণ
const getTimePeriod = (timeString: string): string => {
  if (!timeString) return '';
  const hour = parseInt(timeString.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'সকাল';
  if (hour >= 12 && hour < 15) return 'দুপুর';
  if (hour >= 15 && hour < 18) return 'বিকাল';
  if (hour >= 18 && hour < 20) return 'সন্ধ্যা';
  return 'রাত';
};

// তারিখ ফরম্যাট: ১২ জুন, ২০২৪
const formatBanglaDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const d = toBanglaNumber(date.getDate());
    const m = BANGLA_MONTHS[date.getMonth()];
    const y = toBanglaNumber(date.getFullYear());
    return `${d} ${m}, ${y}`;
  } catch (e) {
    return '[তারিখ]';
  }
};

// Internal Notice Paragraph Component
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

  return (
    <p style={{
      fontSize: '14px',
      lineHeight: '1.8',
      textAlign: 'justify',
      textIndent: '2em',
      margin: '0',
      wordSpacing: 'normal',
      letterSpacing: 'normal',
    }}>
      এতদ্বারা{' '}
      <span style={{ fontWeight: 'bold' }}>
        {minutes.organizationName || '[কারখানার নাম]'}
      </span>
      {' '}এর{' '}
      <span style={{ fontWeight: 'bold' }}>
        {minutes.meetingTitle || '[কমিটির নাম]'}
      </span>
      {' '}-র সকল সদস্যগণের অবগতির জন্য জানানো যাচ্ছে যে, আগামী{' '}
      <span style={{ fontWeight: 'bold' }}>
        {formattedDate}
      </span>
      {' '}ইং তারিখ রোজ{' '}
      <span style={{ fontWeight: 'bold' }}>
        {banglaDay}
      </span>
      {' '}
      {getTimePeriod(minutes.startTime) && (
        <span style={{ fontWeight: 'bold' }}>
          {getTimePeriod(minutes.startTime)}{' '}
        </span>
      )}
      <span style={{ fontWeight: 'bold' }}>
        {formattedTime}
      </span>
      {' '}ঘটিকার সময় কারখানার অভ্যন্তরে{' '}
      <span style={{ fontWeight: 'bold' }}>
        {minutes.venue || '[স্থান]'}
      </span>
      {' '}এ একটি জরুরী আলোচনা সভা অনুষ্ঠিত হবে। উক্ত সভায়{' '}
      <span style={{ fontWeight: 'bold' }}>
        {minutes.meetingTitle || '[কমিটির নাম]'}
      </span>
      {' '}-র সকল সদস্যগণকে যথা সময়ে নির্দিষ্ট স্থানে উপস্থিত থাকার জন্য বিশেষভাবে অনুরোধ করা হলো।
    </p>
  );
}

// ==================== MAIN NOTICE SECTION COMPONENT ====================

interface Props {
  minutes: MeetingMinutes;
  setMinutes: (data: MeetingMinutes) => void;
}

export default function NoticeSection({ minutes, setMinutes }: Props) {

  // Fields required for a complete notice
  const requiredFields: { label: string; value: string }[] = [
    { label: 'কারখানার নাম (Factory Name)',    value: minutes.organizationName },
    { label: 'কমিটির নাম (Committee Name)',    value: minutes.meetingTitle     },
    { label: 'মিটিং তারিখ (Meeting Date)',     value: minutes.meetingDate      },
    { label: 'সময় (Time)',                     value: minutes.startTime        },
    { label: 'স্থান (Venue)',                  value: minutes.venue            },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-pink-200 overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-base font-semibold text-white">নোটিশ / সার্কুলার</h2>
          <p className="text-xs text-pink-100">Meeting Notice / Circular</p>
        </div>

        <div className="p-6 space-y-6">

          {/* Info alert */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">নোটিশ তৈরি</p>
                <p className="text-xs text-yellow-800">
                  নিচের তথ্যগুলো ব্যবহার করে অফিস নোটিশ তৈরি হবে। Print থেকে "নোটিশ/সার্কুলার" সিলেক্ট করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Notice Preview */}
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b-2 border-gray-300 px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-800 text-center">
                নোটিশ প্রিভিউ (Notice Preview)
              </h3>
            </div>

            <div className="p-6 bg-white">
              <div className="max-w-3xl mx-auto space-y-4">

                {/* Notice title */}
                <div className="text-center py-2">
                  <h5 className="text-xl font-bold text-gray-900 underline">অফিস নোটিশ</h5>
                  <p className="text-sm text-gray-600 mt-1">Office Notice</p>
                </div>

                {/* Notice body - Using NoticeParagraph component */}
                <div className="text-justify leading-relaxed">
                  <NoticeParagraph minutes={minutes} />
                </div>

                {/* Agenda items (optional) */}
                {minutes.agendaItems.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold mb-2">আলোচ্যসূচি:</p>
                    <ol className="list-decimal list-inside text-sm space-y-1 pl-4">
                      {minutes.agendaItems.map((item, index) => (
                        <li key={item.id}>{item.topic || `বিষয় ${index + 1}`}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <p className="text-sm pt-4">ধন্যবাদান্তে,</p>

                {/* Signature placeholder */}
                <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800 text-center">
                    স্বাক্ষর প্রিন্ট ভার্সনে দেখানো হবে (অনুমোদন চেইন অনুযায়ী)<br />
                    Signatures will appear in print version (based on approval chain settings)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Print instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">প্রিন্ট নির্দেশনা</p>
                <p className="text-xs text-blue-800">
                  এই নোটিশ প্রিন্ট করতে উপরের "প্রিন্ট" বাটন থেকে "নোটিশ/সার্কুলার (Notice/Circular)" অপশন সিলেক্ট করুন। প্রিন্টে অনুমোদন চেইন অটোমেটিক যুক্ত হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Required field status indicators */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              প্রয়োজনীয় তথ্য (Required Information)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {requiredFields.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3 italic">
              * সবুজ চিহ্ন = তথ্য পূরণ হয়েছে | লাল চিহ্ন = তথ্য প্রয়োজন
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}