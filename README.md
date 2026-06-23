# RMS — HR Management System

A bilingual (Bangla + English) HR management platform for the MG Shirtex group of garment factories in Bangladesh.

---

## Modules

| Module | Description |
|---|---|
| Maternity Benefit | Calculates and generates maternity benefit bills per Bangladesh Labour Law |
| Final Settlement | Computes termination payments (earned leave, gratuity, notice pay) |
| Left Worker Notice | Tracks unofficial absences and generates formal notice letters |
| Personal File | Full employee record with documents, nominee, and employment history |
| Requisition | Staff requisition form with approval workflow |
| Salary Increment | Increment proposal form and printable approval bill |
| Meeting Minutes | Bilingual meeting documentation with attendance, agenda, and print export |
| Worker Rights | Informational reference for worker legal rights |
| Worker Guideline | Factory induction booklet — accessible via QR code without login |

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite 7 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM v7 |
| Forms | Formik + Yup |
| Export | jsPDF, html2canvas, SheetJS, react-to-print |
| Auth | Client-side SHA-256 (see Security Note below) |
| Hosting | GitHub Pages |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Install and Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:5173/rms/
```

### Build for Production

```bash
npm run build
```

The output will be in `dist/`. A `dist/404.html` is automatically created from `dist/index.html` to support GitHub Pages SPA routing.

### Deploy to GitHub Pages

```bash
npm run deploy
```

---

## Project Structure

```
src/
├── auth/               # Login page and user registry
│   ├── login.tsx       # Login UI
│   └── users.ts        # User accounts and authenticateUser()
├── components/
│   ├── common/         # Shared: Navigation, Footer, ErrorBoundary, ExportButtons
│   ├── finalSettlement/
│   ├── maternityBenefit/
│   ├── meeting/
│   ├── employeePersonalFile/
│   ├── incrementBill/
│   ├── LeftEmployeeNotice/
│   ├── requisition/
│   ├── workerGuideline/
│   └── mapp/           # Worker Rights module
├── config/
│   ├── factory.ts      # Factory convenience re-exports
│   └── support.ts      # Support contact details (single source of truth)
├── context/
│   ├── AuthContext.tsx  # Session management (JWT-ready interface)
│   └── LanguageContext.tsx
├── factories/          # One file per factory — add new factories here
│   ├── FactoryRegistry.ts
│   ├── FactoryTypes.ts
│   ├── MgShirtex.ts
│   ├── MgFashion.ts
│   ├── MgApparels.ts
│   └── Mohammadi.ts
├── hooks/
│   └── useFactory.ts
├── pages/
│   ├── RewardApp.tsx   # Main authenticated shell
│   └── notFound.tsx
├── types/              # Shared TypeScript interfaces
├── utils/              # Pure functions: formulas, export helpers, date utils
└── assets/             # Images and fonts
```

---

## How to Add a New Factory

1. **Create a factory file** — copy `src/factories/MgApparels.ts` and update all values. Set `active: true`.
2. **Register it** — import your new factory in `src/factories/FactoryRegistry.ts` and add it to `FACTORY_REGISTRY`.
3. **Add users** — add user entries in `src/auth/users.ts` with the matching `factoryId`.

That's it. Every module in the app picks up the new factory automatically.

---

## How to Add a User

1. Open a browser console on the running app.
2. Generate a password hash:
   ```js
   // Paste this into the browser console
   const SALT = 'rms_sk_tech_2025';
   const data = new TextEncoder().encode(SALT + 'YourNewPassword');
   const buf = await crypto.subtle.digest('SHA-256', data);
   console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join(''));
   ```
3. Copy the hash and add a new entry to `USERS` in `src/auth/users.ts`.

---

## User Roles

| Role | Access |
|---|---|
| `superadmin` | All modules, all factories |
| `admin` | All modules, own factory |
| `manager` | Defined `allowedModules` list |
| `viewer` | Defined `allowedModules` list |

Parent factory users can switch between sub-factories in the navigation bar.

---

## Support Contact

Support contact details are configured in `src/config/support.ts`. Edit that file to update the phone number or email — it is the single source of truth used by the login page, footer, and support panel.

---

## Security Note

> ⚠️ The current authentication is **client-side only**. All user credentials are compiled into the JavaScript bundle. This is acceptable for an internal intranet tool during development, but **must be replaced with a backend API + JWT** before any production or internet-facing deployment.
>
> See the improvement roadmap for migration steps.

---

## Known Limitations

- **No data persistence** — all form data lives in React state and is lost when the browser tab is closed. A backend API + database is required for real-world use.
- **Client-side auth** — see Security Note above.
- No automated test suite yet (Vitest setup is the next planned step).

---

## Changelog

| Version | Date | Notes |
|---|---|---|
| V15 | Apr 2026 | Refactor: fixed naming typos, centralised support config, added README, removed duplicate hashPassword.ts |
| V14 | Mar 2026 | Worker Guideline QR flow, lazy-loaded modules |
| V13 | Feb 2026 | Factory Registry pattern, multi-factory switching |

---

## License

Private — MG Shirtex Group / SK-TECH. All rights reserved.
