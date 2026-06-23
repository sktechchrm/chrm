// =============================================================================
// RMS — Grievance Module Apps Script Backend  (GrievanceCode.gs)
//
// SETUP:
//   1. Create a new Google Spreadsheet for grievances
//   2. Open Extensions → Apps Script
//   3. Paste this entire file, replacing any existing content
//   4. Click Deploy → New deployment → Web App
//      - Execute as: Me
//      - Who has access: Anyone
//   5. Copy the Web App URL
//   6. Paste it as VITE_GRIEVANCE_URL in your .env file
//   7. Rebuild: npm run build
//
// Sheet structure (auto-created on first save):
//   Grievances tab → columns: ID | Name | EmployeeID | Department |
//                              Category | Description | Urgency | Status |
//                              History | SubmittedAt | UpdatedAt
// =============================================================================

var SHEET_NAME = "Grievances";
var SECRET_KEY = "Saiful@1985"; // Must match VITE_SHEETS_KEY in .env (shared secret)

// ── Entry points ──────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    var action = e.parameter.action;
    var sheet   = getOrCreateSheet_();

    if (action === "ping") {
      return json_({ ok: true, message: "Grievance backend online" });
    }

    if (action === "getAll") {
      var data    = sheet.getDataRange().getValues();
      if (data.length < 2) return json_({ success: true, data: [] });
      var headers = data[0];
      var rows    = data.slice(1).map(function(row) {
        return rowToObj_(headers, row);
      }).reverse(); // newest first
      return json_({ success: true, data: rows });
    }

    if (action === "getOne") {
      var id   = e.parameter.id;
      var data = sheet.getDataRange().getValues();
      if (data.length < 2) return json_({ success: false, message: "পাওয়া যায়নি" });
      var headers = data[0];
      var row     = data.slice(1).find(function(r) { return r[0] === id; });
      if (!row) return json_({ success: false, message: "অভিযোগ পাওয়া যায়নি" });
      return json_({ success: true, data: rowToObj_(headers, row) });
    }

    return json_({ success: false, message: "অজানা অনুরোধ: " + action });
  } catch (err) {
    return json_({ success: false, message: err.toString() });
  }
}

function doPost(e) {
  try {
    var body  = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();

    if (body.action === "submit") {
      var id      = "GRV-" + Date.now();
      var now     = new Date().toISOString();
      var history = JSON.stringify([{
        status: "দাখিল হয়েছে",
        note:   "কর্মী কর্তৃক অভিযোগ দাখিল করা হয়েছে।",
        by:     body.name || "কর্মী",
        at:     now,
      }]);

      ensureHeader_(sheet);
      sheet.appendRow([
        id, body.name, body.employeeId, body.department,
        body.category, body.description, body.urgency || "মাঝারি",
        "দাখিল হয়েছে", history, now, now,
      ]);
      return json_({ success: true, id: id });
    }

    if (body.action === "update") {
      var data      = sheet.getDataRange().getValues();
      var rowIndex  = data.findIndex(function(r) { return r[0] === body.id; });
      if (rowIndex === -1) return json_({ success: false, message: "অভিযোগ পাওয়া যায়নি" });

      var historyCell  = sheet.getRange(rowIndex + 1, 9);
      var historyArr   = JSON.parse(historyCell.getValue() || "[]");
      historyArr.push({
        status: body.status,
        note:   body.note,
        by:     body.by || "ব্যবস্থাপনা",
        at:     new Date().toISOString(),
      });

      sheet.getRange(rowIndex + 1, 8).setValue(body.status);
      historyCell.setValue(JSON.stringify(historyArr));
      sheet.getRange(rowIndex + 1, 11).setValue(new Date().toISOString());
      return json_({ success: true });
    }

    return json_({ success: false, message: "অজানা অনুরোধ: " + body.action });
  } catch (err) {
    return json_({ success: false, message: err.toString() });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateSheet_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    ensureHeader_(sheet);
  }
  return sheet;
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  var headers = ["ID","Name","EmployeeID","Department","Category","Description","Urgency","Status","History","SubmittedAt","UpdatedAt"];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#1a1a18")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function rowToObj_(headers, row) {
  var obj = {};
  headers.forEach(function(h, i) { obj[h] = row[i] === undefined ? "" : row[i]; });
  return obj;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
