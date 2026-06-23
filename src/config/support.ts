// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT CONFIG — Single source of truth for support contact details.
//
// WHY THIS FILE EXISTS:
//   Previously, the support phone number was hardcoded in three separate files
//   (login.tsx, footer.tsx, SupportPanel.tsx). This meant:
//     • A public GitHub repository exposed a personal phone number
//     • Changing the number required editing 3 files
//     • There was no way to configure different numbers per environment
//
// HOW TO UPDATE:
//   Change the values here — all components pick it up automatically.
//
// FUTURE (when backend exists):
//   Replace these constants with a fetch() call to GET /api/config/support
//   so contact details can be managed without redeploying the app.
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORT = {
  /** WhatsApp number in international format (no + or spaces) */
  whatsappNumber:  '8801732484884',

  /** Display format shown in the UI */
  whatsappDisplay: '01732-484884',

  /** Full WhatsApp deep link */
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappNumber}`;
  },

  /** Support email — update when available */
  email: 'support@sk-tech.com.bd',
} as const;
