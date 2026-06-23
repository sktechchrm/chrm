// ═══════════════════════════════════════════════════════════════════════════════
// RMS V16.4 — Google Apps Script Backend
// ═══════════════════════════════════════════════════════════════════════════════
//
// CHANGES FROM V16.3:
//   FIX 1 — ping no longer blocked by spreadsheetId guard (was always failing)
//   FIX 2 — maternity: 8 new installment snapshot columns added
//            (installment1Amount/Salary/Others/OthersLabel ×2)
//   FIX 3 — increments: removed unused incrementPercent + purpose; columns now
//            match exactly what the frontend sends
//   FIX 4 — requisitions: removed department + purpose (frontend never sends them)
//   FIX 5 — handleDelete now has a script lock (prevents race conditions)
//   FIX 6 — workerGuideline is read-only (no module needed — removed non-issue)
//
// HOW TO SET UP:
//   1. Paste this into script.google.com → New Project
//   2. Project Settings → Script Properties → Add:
//        SECRET_KEY  = any strong password
//        SHEET_ID    = your master Google Sheet ID (fallback)
//        FACTORY_IDS = comma-separated list of all factory spreadsheet IDs
//                      e.g. "19vrtzi...,1Dnks...,199v6j...,1W7QI4..."
//   3. Deploy → New Deployment → Web App
//        Execute as: Me  |  Who has access: Anyone
//   4. Copy Web App URL → paste into your .env as VITE_SHEETS_URL
//
// AFTER UPDATING FROM V16.3:
//   Run migrateSheets() once in the Apps Script editor — it safely adds the
//   8 new maternity columns to existing sheets without touching existing data.
//
// AUTO SHEET CREATION:
//   - Every save/update/load call auto-creates the module tab if missing
//   - Run setupAllFactories() once after adding a new factory's SHEET_ID
//     to FACTORY_IDS Script Property — creates all module tabs immediately
//   - Run migrateSheets() when SHEET_COLUMNS changes (adds new columns safely)
//   - Run rebuildModule(module) to fix any broken header on a specific module
//
// ═══════════════════════════════════════════════════════════════════════════════

const SHEET_COLUMNS = {

  // ── Final Settlement ────────────────────────────────────────────────────────
  settlements: [
    'id','savedAt','savedBy','factoryId',
    'employeeName','cardNo','designation','section',
    'joiningDate','lastAttendance','settlementDate','terminationType',
    'serviceYears','serviceMonths','serviceDays','benefitYears',
    'totalDays','absentDays',
    'totalWage','basicWage','houseRent',
    'foodAllowance','medicalAllowance','transportAllowance',
    'dailyBasic','dailyGross',
    'elQty','noticePayDay','noticeDeductionDay',
    'payableDay','payableHours','lastMonthName','lastMonthYear',
    'earnedLeave','serviceCompensation','deathCompensation','noticePay',
    'lastMonthSalary','lastMonthOvertime','others',
    'serviceCompDaysPerYear','DeathCompensationDaysPerYear',
    'advanceDeduction','noticeDeduction','otherDeduction','totalDeductions',
    'totalReceivable','finalTotal',
  ],

  // ── Maternity Benefit ───────────────────────────────────────────────────────
  // FIX 2: Added 8 installment snapshot columns (installment1/2 Amount/Salary/Others/OthersLabel)
  // Run migrateSheets() after deploying this update to add columns to existing sheets.
  maternity: [
    'id','savedAt','savedBy','factoryId',
    'employeeName','cardNo','designation','department','aliveChildren',
    'joiningDate','maternityLeavenoticedDate','maternitySymptomDate',
    'deliveryDate','leaveStartDate','leaveEndDate',
    'serviceYears','serviceMonths','serviceDays','eligibilityStatus',
    'monthlyWage','dailyGross',
    'benefitInstallment','benifitDays','benefitAmount',
    'earnedLeaveDays','currentMonth','currentYear',
    'latestMonth','latestYear',
    'otherBenefits','otherBenefitsType','otherBenefitsValue',
    'totalPayable','formDate',
    // Installment tracking
    'installment1Date','installment1Status',
    'installment1Amount','installment1Salary',
    'installment1Others','installment1OthersLabel',
    'installment2Date','installment2Status',
    'installment2Amount','installment2Salary',
    'installment2Others','installment2OthersLabel',
    'activeInstallment',
  ],

  // ── Left Employee Notice ────────────────────────────────────────────────────
  leftnotice: [
    'id','savedAt','savedBy','factoryId',
    'employeeName','cardNo','designation','department',
    'fatherName','motherName','gender','husbandName','date','joiningDate',
    'absentFrom','absentTo','totalAbsentDays',
    'firstNoticeDate','secondNoticeDate','thirdNoticeDate',
    'noticeType','notes','addressesJson',
  ],

  // ── Employee Personal File ──────────────────────────────────────────────────
  employees: [
    'id','savedAt','savedBy','factoryId','date',
    'fullName','fullNameBengali','fatherName','motherName',
    'dateOfBirth','gender','bloodGroup','maritalStatus',
    'nationality','religion','nid','presentAddress',
    'permanentAddress','mobile','email','presentUnion',
    'presentVillage','presentPostOffice','presentThana','presentDistrict',
    'presentDivision','permanentUnion','permanentVillage','permanentPostOffice',
    'permanentThana','permanentDistrict','permanentDivision','employeeId',
    'designation','department','joiningDate','salary',
    'cardNo','idNo','proximityNumber','grade',
    'sectionLine','fixedSalary','probationEndDate','basicSalary',
    'houseRent','medicalAllowance','transportAllowance','foodAllowance',
    'height','weight','identificationMark','birthRegistrationNo',
    'passportNumber','tinNumber','spouseName','spouseBloodGroup',
    'spousePhone','spouseProfession','spouseDob','spouseEducation',
    'numberOfSons','numberOfDaughters',
    'educationHistoryJson','previousJobsJson',
    'emergencyName','emergencyRelation',
    'emergencyMobile','emergencyProfession','nomineeName','nomineeRelation',
    'nomineeNid','nomineeAddress','nomineePercentage','nomineeProfession',
    'nomineeUnion','nomineeVillage','nomineePostOffice','nomineeThana',
    'nomineeDistrict','nomineeDob','nomineePhone','nomineeEducation',
    'nomineeBloodGroup','supervisorName','supervisorOrg','supervisorProfession',
    'supervisorDesignation','supervisorAddress','supervisorRelation','supervisorPhone',
    'bankName','bankAccountNo','bankBranch','companyName',
    'companyAddress','jobSource','localRepresentative','greeting',
  ],

  // ── Requisition ─────────────────────────────────────────────────────────────
  // FIX 4: Removed 'department' and 'purpose' — frontend never sends these fields.
  // Frontend sends: subject, date, preparedBy, approvedBy, itemsJson, totalItems, status
  requisitions: [
    'id','savedAt','savedBy','factoryId',
    'subject','date','preparedBy','preparedByDesignation',
    'itemsJson','totalItems','quantityType','totalAmount',
    'status',
  ],

  // ── Increment Bill ──────────────────────────────────────────────────────────
  // FIX 3: Removed 'incrementPercent' and 'purpose' — frontend never sends them.
  // Frontend sends: employeeName, cardNo, designation, department,
  //                 oldBasic, oldTotal, newBasic, newTotal,
  //                 incrementAmount, effectiveDate, reason
  increments: [
    'id','savedAt','savedBy','factoryId',
    'subject','date','preparedBy','preparedByDesignation',
    'employeeName','cardNo','designation','department',
    'oldBasic','oldTotal','newBasic','newTotal',
    'incrementAmount','effectiveDate','reason',
    'employeesJson','totalEmployees',
  ],

  // ── Meeting Minutes ─────────────────────────────────────────────────────────
  meetings: [
    'id','savedAt','savedBy','factoryId',
    'organizationName','organizationAddress','department',
    'meetingTitle','meetingEstablishDate','meetingType','meetingNumber',
    'noticeDate','meetingDate','startTime','endTime','venue',
    'virtualMeetingLink','meetingImage',
    'chairperson','secretary','attendeesJson',
    'previousMinutesReference','previousMinutesApproval','previousMinutesRejectionDetails',
    'agendaJson',
    'generalNotes','closingNotes','annexuresJson',
    'nextMeetingDate','nextMeetingTime','nextMeetingVenue',
    'authorizationJson','distributionJson',
  ],

};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProps() {
  var p = PropertiesService.getScriptProperties();
  return {
    secretKey:  p.getProperty('SECRET_KEY'),
    sheetId:    p.getProperty('SHEET_ID'),
    factoryIds: (p.getProperty('FACTORY_IDS') || '')
                  .split(',').map(function(s) { return s.trim(); }).filter(Boolean),
  };
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId(module, factoryId) {
  var prefix = {
    settlements: 'FS', maternity: 'MB', leftnotice: 'LN',
    employees: 'EP', requisitions: 'RQ', increments: 'INC', meetings: 'MTG',
  }[module] || 'REC';
  var factory = (factoryId || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  return prefix + '-' + factory + '-' + new Date().getTime().toString(36).toUpperCase();
}

// ── styleHeader ───────────────────────────────────────────────────────────────
function styleHeader(sheet, numCols) {
  var r = sheet.getRange(1, 1, 1, numCols);
  r.setBackground('#1e3a5f');
  r.setFontColor('#ffffff');
  r.setFontWeight('bold');
  r.setFontSize(11);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= numCols; i++) sheet.setColumnWidth(i, 140);
}

// ── getSheet — auto-creates tab if missing ────────────────────────────────────
function getSheet(spreadsheet, module) {
  var sheet = spreadsheet.getSheetByName(module);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(module);
    var cols = SHEET_COLUMNS[module] || ['id','savedAt','savedBy','factoryId'];
    sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
    styleHeader(sheet, cols.length);
    Logger.log('Auto-created sheet: ' + module + ' in ' + spreadsheet.getName());
  }
  return sheet;
}

// ── getHeaders — always reads live from sheet row 1 ──────────────────────────
function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

// ── getAllFactoryIds — SHEET_ID + FACTORY_IDS combined, deduped ───────────────
function getAllFactoryIds() {
  var props = getProps();
  var ids   = props.factoryIds.slice();
  if (props.sheetId && ids.indexOf(props.sheetId) === -1) ids.unshift(props.sheetId);
  return ids.filter(Boolean);
}

// ── Action Handlers ───────────────────────────────────────────────────────────

function handleSave(body, spreadsheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var module    = body.module;
    var factoryId = body.factoryId;
    var savedBy   = body.savedBy;
    var record    = body.record;

    if (!module || !SHEET_COLUMNS[module]) {
      return respond({ ok: false, error: 'Unknown module: ' + module });
    }

    var sheet   = getSheet(spreadsheet, module);
    var headers = getHeaders(sheet);
    var id      = generateId(module, factoryId);
    var savedAt = new Date().toISOString();

    var rowObj = Object.assign(
      { id: id, savedAt: savedAt, savedBy: savedBy || '', factoryId: factoryId || '' },
      record
    );

    var row = headers.map(function(h) {
      var val = rowObj[h];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });

    sheet.appendRow(row);
    return respond({ ok: true, id: id, savedAt: savedAt });

  } finally {
    lock.releaseLock();
  }
}

function handleLoad(params, spreadsheet) {
  var module    = params.module;
  var factoryId = params.factoryId;
  var limit     = params.limit;

  if (!module || !SHEET_COLUMNS[module]) {
    return respond({ ok: false, error: 'Unknown module: ' + module });
  }

  var sheet   = getSheet(spreadsheet, module);
  var headers = getHeaders(sheet);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) return respond({ ok: true, records: [] });

  var data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  var records = data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  }).filter(function(r) { return r.id; });

  if (factoryId && factoryId !== 'all') {
    records = records.filter(function(r) { return r.factoryId === factoryId; });
  }

  records.sort(function(a, b) {
    return new Date(b.savedAt || 0) - new Date(a.savedAt || 0);
  });

  var max = parseInt(limit) || 50;
  records = records.slice(0, max);

  return respond({ ok: true, records: records, count: records.length });
}

function handleUpdate(body, spreadsheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var module    = body.module;
    var id        = body.id;
    var record    = body.record;
    var factoryId = body.factoryId;
    var savedBy   = body.savedBy;

    if (!module || !id || !record) {
      return respond({ ok: false, error: 'module, id and record are required' });
    }

    var sheet   = getSheet(spreadsheet, module);
    var headers = getHeaders(sheet);
    var idIndex = headers.indexOf('id');

    if (idIndex === -1) return respond({ ok: false, error: 'id column not found in sheet' });

    var data     = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][idIndex] === id) { rowIndex = i; break; }
    }

    if (rowIndex === -1) return respond({ ok: false, error: 'Record not found: ' + id });

    var existing = {};
    headers.forEach(function(h, i) { existing[h] = data[rowIndex][i]; });

    var merged = Object.assign({}, existing, record, {
      id:        id,
      savedAt:   new Date().toISOString(),
      savedBy:   savedBy   || existing.savedBy   || '',
      factoryId: factoryId || existing.factoryId || '',
    });

    var newRow = headers.map(function(h) {
      var val = merged[h];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });

    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([newRow]);
    return respond({ ok: true, id: id, savedAt: merged.savedAt });

  } finally {
    lock.releaseLock();
  }
}

// FIX 5: handleDelete now uses a script lock to prevent race conditions
function handleDelete(body, spreadsheet) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var module = body.module;
    var id     = body.id;

    if (!module || !id) return respond({ ok: false, error: 'module and id required' });

    var sheet   = getSheet(spreadsheet, module);
    var headers = getHeaders(sheet);
    var idIndex = headers.indexOf('id');

    var data     = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][idIndex] === id) { rowIndex = i; break; }
    }

    if (rowIndex === -1) return respond({ ok: false, error: 'Record not found: ' + id });

    sheet.deleteRow(rowIndex + 1);
    return respond({ ok: true, deleted: id });

  } finally {
    lock.releaseLock();
  }
}

function handleStats(params, spreadsheet) {
  var factoryId = params.factoryId;
  var stats     = {};

  Object.keys(SHEET_COLUMNS).forEach(function(module) {
    var sheet = spreadsheet.getSheetByName(module);
    if (!sheet) { stats[module] = 0; return; }

    var data    = sheet.getDataRange().getValues();
    var headers = data[0];
    var rows    = data.slice(1).filter(function(r) { return r[0]; });

    if (factoryId && factoryId !== 'all') {
      var fidx = headers.indexOf('factoryId');
      rows = rows.filter(function(r) { return r[fidx] === factoryId; });
    }

    stats[module] = rows.length;
  });

  return respond({ ok: true, stats: stats });
}

// ── Entry Points ──────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var props = getProps();
    var body  = JSON.parse(e.postData.contents);

    if (!props.secretKey || body.key !== props.secretKey) {
      return respond({ ok: false, error: 'Unauthorized' });
    }
    if (!body.spreadsheetId) return respond({ ok: false, error: 'spreadsheetId required' });

    var ss = SpreadsheetApp.openById(body.spreadsheetId);

    switch (body.action) {
      case 'save':   return handleSave(body, ss);
      case 'update': return handleUpdate(body, ss);
      case 'delete': return handleDelete(body, ss);
      default:       return respond({ ok: false, error: 'Unknown action: ' + body.action });
    }
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}

function doGet(e) {
  try {
    var props = getProps();
    var p     = e.parameter;

    // Auth check applies to all actions including ping
    if (!props.secretKey || p.key !== props.secretKey) {
      return respond({ ok: false, error: 'Unauthorized' });
    }

    // FIX 1: ping is handled BEFORE the spreadsheetId guard.
    // The frontend adapter sends only { action:'ping', key } — no spreadsheetId.
    // In V16.3 the spreadsheetId guard blocked ping, so connection always showed
    // as failed even when the backend was perfectly reachable.
    if (p.action === 'ping') {
      return respond({ ok: true, message: 'RMS backend online', ts: new Date().toISOString() });
    }

    // All other GET actions require a spreadsheetId
    if (!p.spreadsheetId) return respond({ ok: false, error: 'spreadsheetId required' });

    var ss = SpreadsheetApp.openById(p.spreadsheetId);

    switch (p.action) {
      case 'load':  return handleLoad(p, ss);
      case 'stats': return handleStats(p, ss);
      default:      return respond({ ok: false, error: 'Unknown action: ' + p.action });
    }
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── Setup & Migration Tools ───────────────────────────────────────────────────

/**
 * setupAllFactories()
 * Run once after adding a new factory ID to FACTORY_IDS Script Property.
 * Creates all module tabs in every factory spreadsheet.
 * Safe to re-run — skips tabs that already exist.
 */
function setupAllFactories() {
  var ids = getAllFactoryIds();
  if (ids.length === 0) {
    Logger.log('ERROR: No factory IDs found. Set SHEET_ID and/or FACTORY_IDS in Script Properties.');
    return;
  }

  ids.forEach(function(ssId) {
    try {
      var ss = SpreadsheetApp.openById(ssId);
      Logger.log('Setting up: ' + ss.getName() + ' (' + ssId + ')');
      Object.keys(SHEET_COLUMNS).forEach(function(module) {
        getSheet(ss, module);
      });
      Logger.log('  Done: ' + Object.keys(SHEET_COLUMNS).length + ' modules ready');
    } catch(err) {
      Logger.log('  ERROR with ' + ssId + ': ' + err.message);
    }
  });

  Logger.log('setupAllFactories complete.');
}

/**
 * migrateSheets()
 * Run after updating SHEET_COLUMNS — adds new columns to existing sheets.
 * Never deletes existing columns or data. Safe to run multiple times.
 *
 * REQUIRED after upgrading from V16.3 → V16.4:
 *   Adds the 8 new maternity installment snapshot columns to existing sheets.
 */
function migrateSheets() {
  var ids = getAllFactoryIds();
  if (ids.length === 0) {
    Logger.log('ERROR: No factory IDs. Set SHEET_ID and/or FACTORY_IDS in Script Properties.');
    return;
  }

  ids.forEach(function(ssId) {
    try {
      var ss = SpreadsheetApp.openById(ssId);
      Logger.log('Migrating: ' + ss.getName());

      Object.keys(SHEET_COLUMNS).forEach(function(module) {
        var expectedCols = SHEET_COLUMNS[module];
        var sheet        = ss.getSheetByName(module);

        if (!sheet) {
          sheet = ss.insertSheet(module);
          sheet.getRange(1, 1, 1, expectedCols.length).setValues([expectedCols]);
          styleHeader(sheet, expectedCols.length);
          Logger.log('  Created: ' + module);
          return;
        }

        var lastCol      = sheet.getLastColumn();
        var existingCols = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
        var missing      = expectedCols.filter(function(c) { return existingCols.indexOf(c) === -1; });

        if (missing.length === 0) {
          Logger.log('  ' + module + ': up to date ✓');
          return;
        }

        missing.forEach(function(col) {
          var newColIndex = sheet.getLastColumn() + 1;
          var cell = sheet.getRange(1, newColIndex);
          cell.setValue(col);
          cell.setBackground('#1e3a5f').setFontColor('#fff').setFontWeight('bold').setFontSize(11);
          sheet.setColumnWidth(newColIndex, 140);
          Logger.log('  ' + module + ': added "' + col + '" at col ' + newColIndex);
        });
      });

    } catch(err) {
      Logger.log('  ERROR with ' + ssId + ': ' + err.message);
    }
  });

  Logger.log('migrateSheets complete.');
}

/**
 * rebuildModule(module)
 * Nuclear option — rebuilds a specific module tab in all factories.
 * Preserves all existing data, fixes any column order/header issues.
 * Call from editor: rebuildModule('maternity') or rebuildModule('settlements')
 */
function rebuildModule(module) {
  if (!module || !SHEET_COLUMNS[module]) {
    Logger.log('ERROR: Unknown module "' + module + '". Available: ' + Object.keys(SHEET_COLUMNS).join(', '));
    return;
  }

  var ids      = getAllFactoryIds();
  var expected = SHEET_COLUMNS[module];

  ids.forEach(function(ssId) {
    try {
      var ss    = SpreadsheetApp.openById(ssId);
      var sheet = ss.getSheetByName(module);
      Logger.log('Rebuilding ' + module + ' in ' + ss.getName());

      if (!sheet) {
        sheet = ss.insertSheet(module);
        sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
        styleHeader(sheet, expected.length);
        Logger.log('  Created fresh sheet');
        return;
      }

      // Read all existing data
      var data    = sheet.getDataRange().getValues();
      var headers = data[0];
      var rows    = data.slice(1);

      // Remap each row to the new expected columns
      var rebuilt = rows.map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        return expected.map(function(c) {
          var v = obj[c];
          return (v !== undefined && v !== null) ? v : '';
        });
      }).filter(function(row) { return row[0]; }); // skip empty rows

      // Clear and rewrite
      sheet.clear();
      sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
      if (rebuilt.length > 0) {
        sheet.getRange(2, 1, rebuilt.length, expected.length).setValues(rebuilt);
      }
      styleHeader(sheet, expected.length);

      Logger.log('  Rebuilt: ' + rebuilt.length + ' rows, ' + expected.length + ' columns');

    } catch(err) {
      Logger.log('  ERROR with ' + ssId + ': ' + err.message);
    }
  });

  Logger.log('rebuildModule("' + module + '") complete.');
}

/**
 * rebuildAll()
 * Rebuilds all modules across all factories.
 * Use only if multiple modules have header issues.
 */
function rebuildAll() {
  Object.keys(SHEET_COLUMNS).forEach(function(module) {
    rebuildModule(module);
  });
}

/**
 * verifySetup()
 * Diagnostic — logs what columns each module has in each factory sheet
 * vs what SHEET_COLUMNS expects. Run this to spot mismatches quickly.
 */
function verifySetup() {
  var ids = getAllFactoryIds();
  if (ids.length === 0) {
    Logger.log('ERROR: No factory IDs configured.');
    return;
  }

  Logger.log('=== RMS V16.4 Setup Verification ===');

  ids.forEach(function(ssId) {
    try {
      var ss = SpreadsheetApp.openById(ssId);
      Logger.log('\nFactory: ' + ss.getName() + ' (' + ssId + ')');

      Object.keys(SHEET_COLUMNS).forEach(function(module) {
        var expected = SHEET_COLUMNS[module];
        var sheet    = ss.getSheetByName(module);

        if (!sheet) {
          Logger.log('  [MISSING] ' + module + ' — tab does not exist');
          return;
        }

        var lastCol  = sheet.getLastColumn();
        var existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
        var missing  = expected.filter(function(c) { return existing.indexOf(c) === -1; });
        var extra    = existing.filter(function(c) { return expected.indexOf(c) === -1; });
        var rows     = Math.max(0, sheet.getLastRow() - 1);

        if (missing.length === 0 && extra.length === 0) {
          Logger.log('  [OK] ' + module + ' — ' + rows + ' records, ' + existing.length + ' columns ✓');
        } else {
          Logger.log('  [WARN] ' + module + ' — ' + rows + ' records');
          if (missing.length > 0) Logger.log('    Missing cols: ' + missing.join(', '));
          if (extra.length > 0)   Logger.log('    Extra cols:   ' + extra.join(', '));
        }
      });

    } catch(err) {
      Logger.log('  ERROR opening ' + ssId + ': ' + err.message);
    }
  });

  Logger.log('\n=== Verification complete. Run migrateSheets() to fix any [WARN] items. ===');
}