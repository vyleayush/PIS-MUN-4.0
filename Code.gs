/**
 * MUN Registration backend — Paramount International School
 * ------------------------------------------------------------------
 * Paste this into the Apps Script editor of a NEW Google Sheet, fill
 * in the CONFIG values below, then deploy as a Web App.
 * Full steps are in SETUP_INSTRUCTIONS.md.
 *
 * What this does:
 *  - Receives the registration form's POST (including the ID card and
 *    payment screenshot files), saves the files to Drive, and adds a
 *    row to the "Responses" sheet with Status = Pending.
 *  - Emails NOTIFY_EMAIL with the details and two links: Accept / Decline.
 *  - Accept -> marks the row Accepted. That committee/country is now
 *    permanently taken.
 *  - Decline -> marks the row Declined. No other change is made — the
 *    country goes back to being available, exactly as if the
 *    registration had never been submitted.
 *  - Serves the current list of taken committee/country seats (Pending
 *    or Accepted) to the form on request, so the "available countries"
 *    list on the form is always live, not just per-browser.
 */

// ---------------------------------------------------------------------
// CONFIG — fill these in before deploying
// ---------------------------------------------------------------------
var NOTIFY_EMAIL         = 'paramountinternationalmun.26@gmail.com'; // where review emails land
var SCHOOL_NAME          = 'Paramount International School';
var EVENT_DATES          = '13–14 October 2026';
var RESPONSES_SHEET_NAME = 'Responses';
var UPLOAD_FOLDER_NAME   = 'MUN Registration Uploads';

// The 3 designated members from your access plan who should be able to
// open uploaded ID cards / payment screenshots directly from the email
// links. Leave an entry blank ('') to skip it. Files are NOT shared
// "anyone with the link" — only these addresses get access, since ID
// cards are sensitive.
var REVIEWER_EMAILS = [
  '', // e.g. 'member1@school.org'
  '',
  ''
];
// ---------------------------------------------------------------------

var STATUS_PENDING  = 'Pending';
var STATUS_ACCEPTED = 'Accepted';
var STATUS_DECLINED = 'Declined';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RESPONSES_SHEET_NAME);
    sheet.appendRow([
      'Timestamp',
      'ResponseID',
      'Student Name',
      'Phone Number',
      'Email',
      'School / College',
      'City',
      'Committee',
      'Country/Portfolio',
      'Status',
      'Fee Tier',
      'Referral Code',
      'Experience',
      'Delegation Size',
      'ID Card Link',
      'Payment Screenshot Link',
      'EntryId',
      'Token',
      'Details (JSON)'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getUploadFolder_() {
  var folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(UPLOAD_FOLDER_NAME);
}

function saveUploadedFile_(blob, responseId, label) {
  if (!blob || typeof blob.getBytes !== 'function') return '';
  if (blob.getBytes().length === 0) return '';
  var folder = getUploadFolder_();
  var file = folder.createFile(blob).setName(responseId + ' - ' + label + ' - ' + blob.getName());
  REVIEWER_EMAILS.forEach(function (email) {
    if (email && email.indexOf('@') !== -1) {
      try { file.addViewer(email); } catch (err) { /* already a viewer / invalid — skip */ }
    }
  });
  return file.getUrl();
}

/** Handles the registration submission (with file uploads). */
function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var responseId = Utilities.getUuid();
    var token = Utilities.getUuid();

    var entryId   = params['EntryId'] || '';
    var committee = params['Committee'] || '';
    var country   = params['Country/Portfolio'] || '';
    var replyTo   = params['ReplyTo'] || params['Email'] || params['email'] || '';

    if (!entryId || !committee || !country) {
      return jsonOut_({ ok: false, error: 'Missing committee/country selection.' });
    }

    var sheet = getSheet_();
    var blocked = findRowsByEntryId_(sheet, entryId).some(function (row) {
      return row.status === STATUS_PENDING || row.status === STATUS_ACCEPTED;
    });
    if (blocked) {
      return jsonOut_({ ok: false, error: 'That seat was just taken or put under review by someone else.' });
    }

    var idCardLink  = saveUploadedFile_(params['Student ID Card'], responseId, 'ID Card');
    var paymentLink = saveUploadedFile_(params['Payment Screenshot'], responseId, 'Payment Screenshot');

    var studentName = params['Full Name'] || params['full_name'] || params['Name'] || params['Student Name'] || '';
    var phone       = params['Phone'] || params['phone'] || params['Phone Number'] || '';
    var email       = params['Email'] || params['email'] || '';
    var school      = params['School / College'] || params['school'] || params['School'] || '';
    var city        = params['City'] || params['city'] || '';
    var feeTier     = params['Fee'] || params['fee_tier'] || params['Fee Tier'] || 'Standard';
    var referral    = params['Referral Code'] || params['referral_code'] || '';
    var experience  = params['Experience'] || params['experience'] || '';
    var delegation  = params['Delegation Size'] || params['delegation_size'] || (params['is_delegation'] ? 'Yes' : 'No');

    // Every other field in readable list for email notification
    var detailLines = [];
    var detailObj = {};
    Object.keys(params).forEach(function (key) {
      var val = params[key];
      if (typeof val === 'object') return; // file field — already handled above
      detailObj[key] = val;
      detailLines.push(key + ': ' + val);
    });

    sheet.appendRow([
      new Date(),
      responseId,
      studentName,
      phone,
      email,
      school,
      city,
      committee,
      country,
      STATUS_PENDING,
      feeTier,
      referral,
      experience,
      delegation,
      idCardLink,
      paymentLink,
      entryId,
      token,
      JSON.stringify(detailObj)
    ]);

    sendReviewEmail_(responseId, token, committee, country, detailLines, idCardLink, paymentLink, replyTo);

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function findRowsByEntryId_(sheet, entryId) {
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var entryIdx = header.indexOf('EntryId');
  var statusIdx = header.indexOf('Status');
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][entryIdx] === entryId) rows.push({ rowNum: i + 1, status: data[i][statusIdx] });
  }
  return rows;
}

function sendReviewEmail_(responseId, token, committee, country, detailLines, idCardLink, paymentLink, replyTo) {
  var baseUrl = ScriptApp.getService().getUrl();
  var acceptUrl  = baseUrl + '?action=accept&id='  + encodeURIComponent(responseId) + '&token=' + encodeURIComponent(token);
  var declineUrl = baseUrl + '?action=decline&id=' + encodeURIComponent(responseId) + '&token=' + encodeURIComponent(token);

  var body = SCHOOL_NAME + ' MUN (' + EVENT_DATES + ') — new registration to review\n\n' +
    'Committee: ' + committee + '\n' +
    'Country / Portfolio: ' + country + '\n\n' +
    detailLines.join('\n') + '\n\n' +
    (idCardLink  ? 'Student ID card: ' + idCardLink + '\n' : 'Student ID card: (not uploaded)\n') +
    (paymentLink ? 'Payment screenshot: ' + paymentLink + '\n' : 'Payment screenshot: (not uploaded)\n') +
    '\nACCEPT this registration — confirms the country, locks it in:\n' + acceptUrl + '\n\n' +
    'DECLINE this registration — no changes made, country stays open:\n' + declineUrl + '\n';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New MUN Registration — ' + committee + ' — ' + country,
    body: body,
    replyTo: replyTo || NOTIFY_EMAIL
  });
}

/** Serves live availability (?mode=availability, or no params) and handles Accept/Decline links. */
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.action === 'accept' || params.action === 'decline') {
    return handleDecision_(params);
  }

  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var entryIdx = header.indexOf('EntryId');
  var statusIdx = header.indexOf('Status');
  var taken = [];
  for (var i = 1; i < data.length; i++) {
    var status = data[i][statusIdx];
    if (status === STATUS_PENDING || status === STATUS_ACCEPTED) taken.push(data[i][entryIdx]);
  }
  return jsonOut_({ taken: taken });
}

function handleDecision_(params) {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var idIdx = header.indexOf('ResponseID');
  var tokenIdx = header.indexOf('Token');
  var statusIdx = header.indexOf('Status');
  var committeeIdx = header.indexOf('Committee');
  var countryIdx = header.indexOf('Country/Portfolio');
  var entryIdx = header.indexOf('EntryId');

  for (var i = 1; i < data.length; i++) {
    if (data[i][idIdx] === params.id && data[i][tokenIdx] === params.token) {
      var currentStatus = data[i][statusIdx];
      if (currentStatus !== STATUS_PENDING) {
        return htmlOut_('Already handled',
          'This registration was already marked "' + currentStatus + '". No further action was taken.');
      }

      // Handle Decline immediately (unchanged behavior)
      if (params.action === 'decline') {
        sheet.getRange(i + 1, statusIdx + 1).setValue(STATUS_DECLINED);
        return htmlOut_('Registration declined',
          'No changes were made. ' + data[i][countryIdx] + ' (' + data[i][committeeIdx] +
          ') is open again for other delegates.');
      }

      // At this point params.action === 'accept'
      // If the confirmation step has already been submitted (confirm=1),
      // finalize the acceptance with the chosen country/entry.
      if (params.confirm === '1') {
        var finalCountry = params.chosenCountry || data[i][countryIdx];
        var finalEntryId = params.chosenEntryId || data[i][entryIdx];
        // Write the possibly-corrected choice back to the row and mark Accepted
        sheet.getRange(i + 1, countryIdx + 1).setValue(finalCountry);
        if (entryIdx !== -1 && finalEntryId) {
          sheet.getRange(i + 1, entryIdx + 1).setValue(finalEntryId);
        }
        sheet.getRange(i + 1, statusIdx + 1).setValue(STATUS_ACCEPTED);
        return htmlOut_('Registration accepted',
          finalCountry + ' (' + data[i][committeeIdx] + ') is now confirmed and locked in. ' +
          'It will no longer show as available to other delegates.');
      }

      // Otherwise, show a confirmation page so the reviewer can confirm/choose
      // the exact country/portfolio to allot. The page defaults to the requested value.
      // Build a small set of candidate countries to show in the dropdown:
      // - always include the requested country
      // - include any country values already present in the sheet for the same committee
      //   that are not currently marked pending/accepted for that committee (best-effort)
      var requestedCommittee = data[i][committeeIdx];
      var requestedCountry = data[i][countryIdx];

      // Collect entryIds taken for this committee
      var takenForCommittee = {};
      for (var j = 1; j < data.length; j++) {
        if (data[j][committeeIdx] === requestedCommittee &&
            (data[j][statusIdx] === STATUS_PENDING || data[j][statusIdx] === STATUS_ACCEPTED)) {
          if (entryIdx !== -1) takenForCommittee[data[j][entryIdx]] = true;
        }
      }

      // Collect candidate country strings seen in this committee's rows
      var candidateCountries = {};
      for (var j = 1; j < data.length; j++) {
        if (data[j][committeeIdx] === requestedCommittee) {
          var c = data[j][countryIdx];
          if (c && c.toString().trim()) candidateCountries[c] = true;
        }
      }
      // Ensure requestedCountry is present
      candidateCountries[requestedCountry] = true;

      // Convert to array (note: this is a best-effort dropdown — reviewers may also type a custom value)
      var availableList = Object.keys(candidateCountries).sort();

      return serveAcceptConfirmationPage_(params.id, params.token, requestedCommittee, requestedCountry, availableList);
    }
  }
  return htmlOut_('Not found', 'This link is invalid or has already been used.');
}

/**
 * Builds and returns an HtmlService page that allows the reviewer to
 * confirm / correct the country before finalizing Accept.
 *
 * Parameters:
 *  - responseId, token: used to construct the confirmation submit URL.
 *  - committee: the committee string (display only)
 *  - requestedCountry: the delegate's original input (used as default)
 *  - availableList: an array of country strings to populate the dropdown (best-effort)
 */
function serveAcceptConfirmationPage_(responseId, token, committee, requestedCountry, availableList) {
  var baseUrl = ScriptApp.getService().getUrl();
  var esc = function (s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var countriesJson = JSON.stringify(availableList || []);

  var html = '<!doctype html><html><head><meta charset="utf-8"><title>Confirm Acceptance</title>' +
    '<style>body{font-family:sans-serif;max-width:680px;margin:40px auto;padding:0 18px;color:#222}' +
    'h1{font-size:18px;margin-bottom:6px}label{display:block;margin-top:12px}select,input[type=text]{width:100%;padding:8px;margin-top:6px}' +
    '.btn{display:inline-block;margin-top:14px;padding:8px 14px;border-radius:4px;background:#1a73e8;color:#fff;text-decoration:none}' +
    '.note{color:#555;font-size:13px;margin-top:10px}</style></head><body>' +
    '<h1>Confirm / correct allotment</h1>' +
    '<p><strong>Committee:</strong> ' + esc(committee) + '</p>' +
    '<p><strong>Requested country/portfolio:</strong> ' + esc(requestedCountry) + '</p>' +
    '<form id="confirmForm" onsubmit="return submitForm();">' +
    '<label for="countrySelect">Choose country/portfolio to allot (or pick "Other" and type below):</label>' +
    '<select id="countrySelect" name="countrySelect"></select>' +
    '<label for="otherInput">Other (type to override):</label>' +
    '<input id="otherInput" type="text" placeholder="Type a country/portfolio to allot" />' +
    '<div class="note">Default is the delegate\'s requested value. Confirming will mark the registration Accepted.</div>' +
    '<button class="btn" type="submit">Confirm Accept</button>' +
    '</form>' +
    '<script>' +
    'var baseUrl = ' + JSON.stringify(baseUrl) + ';' +
    'var responseId = ' + JSON.stringify(responseId) + ';' +
    'var token = ' + JSON.stringify(token) + ';' +
    'var requested = ' + JSON.stringify(requestedCountry) + ';' +
    'var countries = ' + countriesJson + ';' +
    '(function populate(){' +
      'var sel = document.getElementById("countrySelect");' +
      'var added = {}; ' +
      'if (countries && countries.length) {' +
        'countries.forEach(function(c){ if(!added[c]){ var opt=document.createElement("option"); opt.value=c; opt.text=c; sel.appendChild(opt); added[c]=true; } });' +
      '}' +
      'if (!added[requested]){ var opt2=document.createElement("option"); opt2.value=requested; opt2.text=requested; sel.insertBefore(opt2, sel.firstChild); added[requested]=true; }' +
      'sel.value = requested;' +
    '})();' +
    'function submitForm(){' +
      'var other = document.getElementById("otherInput").value.trim();' +
      'var chosen = other || document.getElementById("countrySelect").value || requested;' +
      'var url = baseUrl + "?action=accept&id=" + encodeURIComponent(responseId) + "&token=" + encodeURIComponent(token) + "&confirm=1&chosenCountry=" + encodeURIComponent(chosen);' +
      'window.location.href = url; return false;' +
    '}' +
    '</script></body></html>';

  return HtmlService.createHtmlOutput(html).setWidth(700);
}

/**
 * Adds a "MUN Tools" menu with a "Delete Selected Row(s)" item.
 * This is sheet-side only and does not touch doGet/doPost endpoints.
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('MUN Tools')
      .addItem('Delete Selected Row(s)', 'deleteSelectedRows_')
      .addToUi();
  } catch (e) {
    // If running outside spreadsheet editor, ignore.
  }
}

/**
 * Deletes the user's selected row(s) with confirmation.
 * Behavior:
 *  - If a selected row is Accepted: do NOT remove the status/entryId that keeps the seat taken.
 *    Instead, scrub personal data (Timestamp, Token, Details, ID/Payment links) but leave
 *    Status and EntryId so availability does not change.
 *  - If a selected row is Pending or Declined: delete the row entirely.
 */
function deleteSelectedRows_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var ui = SpreadsheetApp.getUi();
  var rangeList = sheet.getActiveRangeList();
  if (!rangeList) {
    ui.alert('No rows selected', 'Select one or more rows to delete, then choose MUN Tools → Delete Selected Row(s).', ui.ButtonSet.OK);
    return;
  }
  var ranges = rangeList.getRanges();
  // Build list of row numbers to operate on (unique)
  var rows = [];
  for (var r = 0; r < ranges.length; r++) {
    var start = ranges[r].getRow();
    var num = ranges[r].getNumRows();
    for (var k = 0; k < num; k++) rows.push(start + k);
  }
  rows = Array.from(new Set(rows)).sort(function(a,b){return b-a;}); // delete from bottom-up

  var response = ui.alert('Confirm deletion', 'This will delete/clean ' + rows.length + ' selected row(s). Accepted rows will be scrubbed but kept to preserve seat allotments. Continue?', ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  var header = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  var statusIdx = header.indexOf('Status') + 1;
  var entryIdx = header.indexOf('EntryId') + 1;
  var detailsIdx = header.indexOf('Details (JSON)') + 1;
  var idCardIdx = header.indexOf('ID Card Link') + 1;
  var paymentIdx = header.indexOf('Payment Screenshot Link') + 1;
  var timestampIdx = header.indexOf('Timestamp') + 1;
  var responseIdIdx = header.indexOf('ResponseID') + 1;
  var tokenIdx = header.indexOf('Token') + 1;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    // Skip header
    if (row === 1) continue;
    var status = sheet.getRange(row, statusIdx).getValue();
    if (status === STATUS_ACCEPTED) {
      // Scrub personal/confidential columns but leave Status and EntryId to preserve availability
      if (timestampIdx) sheet.getRange(row, timestampIdx).setValue('DELETED ' + new Date());
      if (responseIdIdx) sheet.getRange(row, responseIdIdx).setValue('');
      if (tokenIdx) sheet.getRange(row, tokenIdx).setValue('');
      if (detailsIdx) sheet.getRange(row, detailsIdx).setValue('');
      if (idCardIdx) sheet.getRange(row, idCardIdx).setValue('');
      if (paymentIdx) sheet.getRange(row, paymentIdx).setValue('');
      // Keep Committee / Country / EntryId / Status intact.
    } else {
      // Safe to remove the row entirely for Pending and Declined
      sheet.deleteRow(row);
    }
  }
  ui.alert('Done', 'Selected rows were processed.', ui.ButtonSet.OK);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function htmlOut_(title, message) {
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
    '<style>body{font-family:sans-serif;max-width:520px;margin:60px auto;padding:0 20px;color:#222;}' +
    'h1{font-size:20px;}p{font-size:15px;line-height:1.5;}</style></head><body>' +
    '<h1>' + title + '</h1><p>' + message + '</p></body></html>';
  return HtmlService.createHtmlOutput(html);
}
