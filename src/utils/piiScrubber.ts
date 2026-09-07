export type PiiMaskReport = {
  originalLength: number;
  maskedLength: number;
  emails: number;
  phones: number;
  taxIds: number;
  oldPassports: number;
  idCards: number;
  unzr: number;
};

export type PiiMaskResult = {
  maskedText: string;
  report: PiiMaskReport;
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<!\d)(?:\+?380[\s\-()]*)?(?:0\d{2}[\s\-()]*)\d{3}[\s\-()]*\d{2}[\s\-()]*\d{2}(?!\d)/g;
const OLD_PASSPORT_PATTERN = /\b[А-ЯІЇЄҐ]{2}\s?\d{6}\b/giu;
const UNZR_PATTERN = /(?<!\d)\d{8}-\d{5}(?!\d)/g;

function countMatches(text: string, pattern: RegExp): number {
  // Counts matches without mutating shared regex state.
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function maskExactDigits(text: string, digitCount: number, replacement: string): { text: string; count: number } {
  // Masks standalone exact-length digit identifiers.
  const pattern = new RegExp(`(?<!\\d)\\d{${digitCount}}(?!\\d)`, "g");
  let count = 0;
  const nextText = text.replace(pattern, () => {
    count += 1;
    return replacement;
  });
  return { text: nextText, count };
}

export function maskPersonalData(input: string): PiiMaskResult {
  // Masks Ukrainian PII locally before any IPC or backend request.
  let maskedText = input;

  const emails = countMatches(maskedText, EMAIL_PATTERN);
  maskedText = maskedText.replace(EMAIL_PATTERN, "[EMAIL ПРИХОВАНО]");

  const phones = countMatches(maskedText, PHONE_PATTERN);
  maskedText = maskedText.replace(PHONE_PATTERN, "[ТЕЛЕФОН ПРИХОВАНО]");

  const oldPassports = countMatches(maskedText, OLD_PASSPORT_PATTERN);
  maskedText = maskedText.replace(OLD_PASSPORT_PATTERN, "[ПАСПОРТ ПРИХОВАНО]");

  const unzr = countMatches(maskedText, UNZR_PATTERN);
  maskedText = maskedText.replace(UNZR_PATTERN, "[УНЗР ПРИХОВАНО]");

  const taxIdResult = maskExactDigits(maskedText, 10, "[ІПН ПРИХОВАНО]");
  maskedText = taxIdResult.text;

  const idCardResult = maskExactDigits(maskedText, 9, "[ID-КАРТКА ПРИХОВАНО]");
  maskedText = idCardResult.text;

  return {
    maskedText,
    report: {
      originalLength: input.length,
      maskedLength: maskedText.length,
      emails,
      phones,
      taxIds: taxIdResult.count,
      oldPassports,
      idCards: idCardResult.count,
      unzr,
    },
  };
}
