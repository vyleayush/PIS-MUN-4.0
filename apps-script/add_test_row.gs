/**
 * addTestRegistrationRow()
 * ------------------------
 * Inserts a clearly-labeled test row into the `Responses` sheet so you
 * can verify the Accept confirmation flow without submitting the live
 * form. The row uses a conspicuous country value `TEST — Wakanda` and
 * a Details JSON flag so it's easy to spot and remove.
 *
 * Usage:
 * - Paste this file into the same Apps Script project as your `Code.gs`.
 * - Run `addTestRegistrationRow` from the Apps Script editor or the
 *   Run menu. (You'll be asked to authorize if needed.)
 * - After testing, delete the test row with the new `MUN Tools` menu.
 */
function addTestRegistrationRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(typeof RESPONSES_SHEET_NAME !== 'undefined' ? RESPONSES_SHEET_NAME : 'Responses') || ss.getActiveSheet();
  var responseId = 'TEST-' + Utilities.getUuid();
  var token = 'TEST-' + Utilities.getUuid();
  var timestamp = new Date();
  var status = (typeof STATUS_PENDING !== 'undefined') ? STATUS_PENDING : 'Pending';
  var committee = 'Test Committee';
  var country = 'TEST — Wakanda';
  var entryId = 'TEST-WAK';
  var details = { TEST: true, note: 'AUTO TEST ROW - delete when finished' };

  sheet.appendRow([timestamp, responseId, token, status, committee, country, entryId, JSON.stringify(details), '', '']);
  SpreadsheetApp.flush();
  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert('Test row added', 'Added test row: ' + responseId + '\nCountry: ' + country + '\nUse MUN Tools → Delete Selected Row(s) to remove.', ui.ButtonSet.OK);
  } catch (e) {
    // If UI isn't available, ignore.
  }
}
