import type { FlowStep, UrgencyColor } from "./types";

// --- কনফিগ ---
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyZaVdQatGw8jEeEidf2UjDmjcNeRofJLqNNR51e75kOgYn1wiZazBfR_D3lsNTO2wnJA/exec";

// --- ধ্রুবক ---
export const DEPARTMENTS: string[] = [
  "স্টোর (Store)",
  "কাটিং (Cutting)",
  "সুইং (Sewing)",
  "ফিনিশিং (Finishing)",
  "স্যাম্পল (Sample)",
  "কোয়ালিটি (Quality)",
  "আইই (IE / Industrial Engineering)",
  "অফিস / প্রশাসন (Office / Administration)",
  "মেইনটেইন্যান্স (Maintenance)",
];

export const CATEGORIES: string[] = [
  "কর্মক্ষেত্রে হয়রানি",
  "বেতন / ক্ষতিপূরণ",
  "অতিরিক্ত কাজের চাপ",
  "বৈষম্য",
  "নিরাপত্তা উদ্বেগ",
  "নীতি লঙ্ঘন",
  "ব্যবস্থাপকের আচরণ",
  "সহকর্মীর সাথে দ্বন্দ্ব",
  "সুবিধাদি সমস্যা",
  "অন্যান্য",
];

export const URGENCY_LEVELS: string[] = [
  "কম",
  "মাঝারি",
  "বেশি",
  "জরুরি",
];

// --- Flow Steps ---
// Icon names are react-icons/fa (Font Awesome 5) component names
export const FLOW_STEPS: FlowStep[] = [
  {
    status: "দাখিল হয়েছে",
    icon: "FaFileAlt",           // was: faFileCirclePlus (FA6 only)
    label: "দাখিল",
    color: "#1D9E75",
  },
  {
    status: "পর্যালোচনাধীন",
    icon: "FaEye",               // ✓ exists in FA5
    label: "পর্যালোচনা",
    color: "#378ADD",
  },
  {
    status: "তদন্ত চলছে",
    icon: "FaSearch",            // was: faMagnifyingGlass (FA6 alias)
    label: "তদন্ত",
    color: "#BA7517",
  },
  {
    status: "ব্যবস্থা নেওয়া হয়েছে",
    icon: "FaBolt",              // ✓ exists in FA5
    label: "ব্যবস্থা গ্রহণ",
    color: "#7F77DD",
  },
  {
    status: "সমাধান হয়েছে",
    icon: "FaCheckCircle",       // was: faCircleCheck (FA6 name)
    label: "সমাধান",
    color: "#639922",
  },
  {
    status: "বন্ধ",
    icon: "FaLock",              // ✓ exists in FA5
    label: "বন্ধ",
    color: "#5F5E5A",
  },
];

export const URGENCY_COLORS: Record<string, UrgencyColor> = {
  "কম": {
    bg: "#EAF3DE",
    text: "#3B6D11",
    border: "#97C459",
  },
  "মাঝারি": {
    bg: "#FAEEDA",
    text: "#854F0B",
    border: "#EF9F27",
  },
  "বেশি": {
    bg: "#FAECE7",
    text: "#993C1D",
    border: "#F0997B",
  },
  "জরুরি": {
    bg: "#FCEBEB",
    text: "#A32D2D",
    border: "#F09595",
  },
};

export const STATUS_COLORS: Record<string, string> = {
  "দাখিল হয়েছে":         "#1D9E75",
  "পর্যালোচনাধীন":        "#378ADD",
  "তদন্ত চলছে":           "#BA7517",
  "ব্যবস্থা নেওয়া হয়েছে": "#7F77DD",
  "সমাধান হয়েছে":         "#639922",
  "বন্ধ":                 "#5F5E5A",
};
