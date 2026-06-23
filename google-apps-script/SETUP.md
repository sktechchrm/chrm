# Google Sheets Database — Setup Guide

## What you need
- A Google account (you already have one for Google Drive)
- 15 minutes

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+** to create a new blank spreadsheet
3. Name it: `RMS V16 Database`
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
   ```
   Save this — you need it in Step 3.

---

## Step 2 — Create the Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Name it: `RMS V16 Backend`
4. Delete all existing code in the editor
5. Copy the entire contents of `Code.gs` (from this folder) and paste it in
6. Click **Save** (Ctrl+S)

---

## Step 3 — Set Script Properties (your secret configuration)

1. In the Apps Script editor, click the **⚙️ gear icon** (Project Settings)
2. Scroll down to **Script Properties**
3. Click **Add Script Property** and add these two:

   | Property | Value |
   |---|---|
   | `SHEET_ID` | *(the ID you copied in Step 1)* |
   | `SECRET_KEY` | *(choose any strong password, e.g. `rms_sk_tech_2026_abc123`)* |

4. Click **Save Script Properties**

---

## Step 4 — Set up the sheet tabs (one-time)

1. Back in the code editor, select function `setupSheets` from the function dropdown
2. Click **▶ Run**
3. When prompted, click **Review Permissions** → **Allow**
4. Go back to your Google Sheet — you should now see 7 tabs:
   `settlements | maternity | leftnotice | employees | requisitions | increments | meetings`

---

## Step 5 — Deploy as Web App

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the **gear icon ⚙️** next to "Select type" → choose **Web app**
3. Set:
   - **Description**: `RMS V16 API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. Copy the **Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 6 — Configure the RMS frontend

1. In your RMS project, open `src/config/sheets.ts`
2. Replace the placeholder values:

```typescript
export const SHEETS_CONFIG = {
  url: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',  // ← paste here
  key: 'rms_sk_tech_2026_abc123',  // ← your SECRET_KEY from Step 3
};
```

3. Save the file, run `npm run dev` — the save buttons will now work.

---

## How to re-deploy after code changes

If you ever update `Code.gs`:
1. Apps Script editor → **Deploy** → **Manage deployments**
2. Click the **✏️ pencil** on your existing deployment
3. Change version to **New version**
4. Click **Deploy**

> ⚠️ Do NOT create a new deployment — always update the existing one,
> otherwise the URL changes and you have to update your frontend config.

---

## Checking your data

Your data is always visible in the Google Sheet:
- Open [sheets.google.com](https://sheets.google.com) → **RMS V16 Database**
- Each module has its own tab
- You can filter, sort, and export from there at any time

---

## Security notes

- The `SECRET_KEY` prevents unauthorized people from saving to your sheet
- The Web App URL + key are stored in your frontend config (`sheets.ts`)
- Anyone who has your deployed app URL can see the config — this is acceptable
  for an internal intranet tool but NOT suitable for a public-facing app
- For higher security in the future, move the key to an environment variable:
  `VITE_SHEETS_KEY=your_key` in a `.env` file (never commit `.env` to GitHub)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Unauthorized" error | Check SECRET_KEY matches in Script Properties and sheets.ts |
| "SHEET_ID not configured" | Add SHEET_ID to Script Properties (Step 3) |
| Save button shows error after 30 seconds | Re-deploy the Web App (Step 5) |
| Tabs not created | Run `setupSheets` function manually (Step 4) |
| Old URL stopped working | You created a new deployment — use the original URL |
