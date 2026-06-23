/* ---------------- Bangla Number Converter ---------------- */
export const toBanglaNumber = (num: string | number) => {
  const bnNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return num.toString().replace(/\d/g, d => bnNums[Number(d)]);
};

/* ---------------- Date Formatter ---------------- */
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2,'0')}/${String(
    date.getMonth() + 1
  ).padStart(2,'0')}/${date.getFullYear()}`;
};

/* ---------------- Number to Words (EN) ---------------- */
export const numberToWordsEN = (num: number): string => {
  if (isNaN(num)) return '';
  if (num === 0) return 'Zero';

  if (num < 0) {
    return 'Negative ' + numberToWordsEN(Math.abs(num));
  }

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const inWords = (n: number): string => {
    let words = '';

    if (n < 20) return a[n];

    if (n < 100) {
      words += b[Math.floor(n / 10)];
      if (n % 10) words += ' ' + a[n % 10];
      return words;
    }

    if (n < 1000) {
      words += a[Math.floor(n / 100)] + ' Hundred';
      if (n % 100) words += ' ' + inWords(n % 100);
      return words;
    }

    if (n < 1_000_000) {
      words += inWords(Math.floor(n / 1000)) + ' Thousand';
      if (n % 1000) words += ' ' + inWords(n % 1000);
      return words;
    }

    if (n < 1_000_000_000) {
      words += inWords(Math.floor(n / 1_000_000)) + ' Million';
      if (n % 1_000_000) words += ' ' + inWords(n % 1_000_000);
      return words;
    }

    words += inWords(Math.floor(n / 1_000_000_000)) + ' Billion';
    if (n % 1_000_000_000) words += ' ' + inWords(n % 1_000_000_000);
    return words;
  };

  // Decimal support (same flow as BN version)
  const [intPart, decimalPart] = num.toString().split('.');
  let result = inWords(parseInt(intPart, 10));

  if (decimalPart) {
    const decimalWords = decimalPart
      .split('')
      .map(d => a[Number(d)])
      .join(' ');
    result += ' Point ' + decimalWords;
  }

  return result.trim();
};

/* ---------------- Number to Words (BN) ---------------- */
export const numberToWordsBN = (num: number): string => {
  if (isNaN(num)) return "";
  if (num === 0) return "শূন্য";

  if (num < 0) {
    return "-" + numberToWordsBN(Math.abs(num));
  }

  const units = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
  const teens = [
    "দশ",
    "এগারো",
    "বারো",
    "তেরো",
    "চৌদ্দ",
    "পনেরো",
    "ষোল",
    "সতেরো",
    "আঠারো",
    "উনিশ",
  ];

  // Only for exact tens: 20,30,40...
  const tens = [
    "",
    "",
    "বিশ",
    "ত্রিশ",
    "চল্লিশ",
    "পঞ্চাশ",
    "ষাট",
    "সত্তর",
    "আশি",
    "নব্বই",
  ];

  // Correct Bangla special numbers (20–99)
  const specialMap: Record<number, string[]> = {
    2: ["", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ"],
    3: ["", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁইত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ"],
    4: ["", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ"],
    5: ["", "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট"],
    6: ["", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর"],
    7: ["", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি"],
    8: ["", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই"],
    9: ["", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"],
  };

  const inWords = (n: number): string => {
    let words = "";

    if (n >= 10000000) {
      words += inWords(Math.floor(n / 10000000)) + " কোটি ";
      n %= 10000000;
    }

    if (n >= 100000) {
      words += inWords(Math.floor(n / 100000)) + " লক্ষ ";
      n %= 100000;
    }

    if (n >= 1000) {
      words += inWords(Math.floor(n / 1000)) + " হাজার ";
      n %= 1000;
    }

    if (n >= 100) {
      words += units[Math.floor(n / 100)] + " শত ";
      n %= 100;
    }

    if (n >= 20) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;

      if (unit === 0) {
        words += tens[ten];
      } else {
        words += specialMap[ten]?.[unit] || "";
      }
    } else if (n >= 10) {
      words += teens[n - 10];
    } else if (n > 0) {
      words += units[n];
    }

    return words.trim();
  };

  // Decimal support (same structure)
  const [intPart, decimalPart] = num.toString().split(".");
  let result = inWords(parseInt(intPart));

  if (decimalPart) {
    const decimalWords = decimalPart
      .split("")
      .map(d => units[Number(d)])
      .join(" ");
    result += " দশমিক " + decimalWords;
  }

  return result;
};
