/**
 * acceptTestRow(chosenCountry)
 * ------------------------------
 * Finds the first Pending test row (Country = "TEST — Wakanda") and
 * programmatically finalizes an Accept for it by calling the existing
 * `handleDecision_` function with `confirm=1`.
 *
 * Usage:
 * - Paste into the same Apps Script project as `Code.gs` and `add_test_row.gs`.
 * - Run `acceptTestRow()` from the Apps Script editor to accept the
 *   first matching test row. Optionally pass a `chosenCountry` string
 *   to override the country used when finalizing.
 *
 * Note: this helper is for testing only. It looks specifically for rows
 * with Country/Portfolio exactly equal to `TEST — Wakanda` and Status = Pending.
 */
function acceptTestRow(chosenCountry) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(typeof RESPONSES_SHEET_NAME !== 'undefined' ? RESPONSES_SHEET_NAME : 'Responses');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Responses sheet not found');
    return;
  }
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var statusIdx = header.indexOf('Status');
  var countryIdx = header.indexOf('Country/Portfolio');
  var responseIdIdx = header.indexOf('ResponseID');
  var tokenIdx = header.indexOf('Token');

  for (var i = 1; i < data.length; i++) {
    var status = data[i][statusIdx];
    var country = data[i][countryIdx];
    if (status === STATUS_PENDING && country === 'TEST — Wakanda') {
      var responseId = data[i][responseIdIdx];
      var token = data[i][tokenIdx];
      var finalCountry = chosenCountry || country;
      // Call the existing handler to finalize acceptance.
      var res = handleDecision_({ id: responseId, token: token, action: 'accept', confirm: '1', chosenCountry: finalCountry });
      // If handler returned HtmlOutput, try to surface its content to the user.
      var msg = 'Acceptance attempted for ResponseID: ' + responseId;
      try {
        if (res && typeof res.getContent === 'function') msg += '\n\n' + res.getContent();
        else if (res) msg += '\n\n' + String(res);
      } catch (e) {
        msg += '\n\n(accept handler returned non-displayable result)';
      }
      SpreadsheetApp.getUi().alert('acceptTestRow', msg, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }
  SpreadsheetApp.getUi().alert('No matching test row found', 'No Pending row with Country set to "TEST — Wakanda" was found.', SpreadsheetApp.getUi().ButtonSet.OK);
}
