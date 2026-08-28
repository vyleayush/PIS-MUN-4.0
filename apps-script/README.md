# Apps Script — Deployment & Test Checklist

This document explains how to install the updated `Code.gs` into your Google Apps Script project (Spreadsheet-bound), deploy it as a Web App, and test the Accept confirmation flow and the sheet-side deletion menu.

Important: you asked that I only change the backend `Code.gs` and not touch your form or live matrix; this README assumes you'll paste `/app/Code.gs` into the Apps Script editor yourself.

## Before you begin

- Open the Google Sheet used by the registration system.
- Open Extensions → Apps Script.
- If the project already contains `Code.gs`, keep a copy of the original before pasting the new file.

## Install the new `Code.gs`

1. In the Apps Script editor, create a new script file named `Code.gs` (or replace the existing file with the contents of `/app/Code.gs`).
2. Update the CONFIG values at the top of the file (NOTIFY_EMAIL, REVIEWER_EMAILS, etc.).
3. Save the project.

## Required scopes & APIs

- The script uses `MailApp`, `DriveApp`, `SpreadsheetApp`, `ContentService`, and `HtmlService`. When you first run or deploy, Apps Script will request the required permissions.
- No additional advanced APIs are required for the changes made here.

## Deploy as Web App

1. In Apps Script, click Deploy → New deployment.
2. Choose **Web app**.
3. Set **Execute as** to `Me` (the owner) and **Who has access** to `Anyone` or `Anyone with the link` depending on your workflow (the original project used a public web-app endpoint for Accept/Decline links).
4. Deploy and copy the Web App URL. (If you replace an existing project, you may reuse the existing deployment URL.)

Important: The Accept/Decline links in the review email are built from `ScriptApp.getService().getUrl()`, which returns the deployed web app URL. If you redeploy under a new URL, new emails will contain the new link.

## Let the spreadsheet UI menu appear

- Open the Google Sheet and refresh the page. The `onOpen()` function will add a top-level menu `MUN Tools → Delete Selected Row(s)`.

## Test checklist — end-to-end

1. Submit a test registration through your existing form (use a distinct name/email so you can find it in the sheet).
2. In the spreadsheet, confirm a new row appears with `Status = Pending`.
3. Locate the review email sent to `NOTIFY_EMAIL` and click the **Accept** link.
   - You should see a confirmation page that shows the requested Committee and Country and a dropdown (defaults to the requested value).
   - Choose a different country from the dropdown or type a custom value in **Other**, then click **Confirm Accept**.
4. After confirmation, reload the Responses sheet and verify:
   - The row's `Status` is now `Accepted`.
   - The `Country/Portfolio` column contains the final value you confirmed.
5. Re-open the registration form and confirm the final allotted seat is no longer available (the form queries the live endpoint and excludes Pending/Accepted entries).

## Test checklist — Decline

1. Click the **Decline** link from the review email for a different Pending registration.
2. Confirm the sheet row's `Status` becomes `Declined`.
3. Confirm the country becomes available again on the registration form.

## Test checklist — Delete Selected Row(s)

1. In the sheet, select one or more full rows (click the row numbers) you want to tidy up.
2. Choose `MUN Tools → Delete Selected Row(s)`.
3. Confirm the prompt. Expected behavior:
   - If a selected row is `Accepted`: script scrubs personal data (Timestamp, ResponseID/Token, Details, ID/Payment links) but leaves `Status` and `EntryId` intact so the seat remains taken.
   - If a selected row is `Pending` or `Declined`: the row is deleted entirely.

## Notes & Troubleshooting

- The Accept confirmation page is a best-effort helper: it lists candidate country strings found for the same committee from existing rows and always includes the delegate's requested value. Reviewers can still type any custom country/portfolio in the Other field.
- The deletion menu is sheet-side only and intentionally does not interact with `doGet`/`doPost` endpoints.
- If the Accept link opens a blank or 404 page, verify the web app is deployed and that the URL returned by `ScriptApp.getService().getUrl()` matches the deployment.
- If you change deployments, regenerate a test submission email to get links with the correct URL.

If you want, I can also:
- Provide a small test script that programmatically creates a Pending registration row for quicker testing; or
- Use `clasp` to push this code directly to your Apps Script project if you provide the project id.

File added to this repo: `/app/Code.gs` (paste into Apps Script editor)
