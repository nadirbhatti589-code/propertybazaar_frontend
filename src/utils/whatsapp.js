// WhatsApp phone number utilities for Pakistani numbers.
// Accepts formats like "0312 3456789", "+92 312 3456789", "92 312 345 6789"
// and normalises them into the international E.164 form used by wa.me links.

export const formatPhoneForWa = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/[^\d]/g, '');

  if (digits.length === 0) return '';
  if (digits.startsWith('92') && digits.length === 12) return digits; // +92 3xx xxxxxxx
  if (digits.startsWith('0') && digits.length === 11) return `92${digits.slice(1)}`; // 03xx...
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`; // 3xx...
  if (digits.length === 11 && digits.startsWith('9')) return digits;
  return digits;
};

export const waMeLink = (phone) => {
  const number = formatPhoneForWa(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(
    'Hello! I found your listing on PropertyBazaar and would like more details.'
  )}`;
};