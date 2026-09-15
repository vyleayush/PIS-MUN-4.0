/**
 * Email Relay — Google Apps Script Web App
 * -----------------------------------------
 * Deploy this as a standalone Google Apps Script web app.
 * It receives POST requests from the Render backend and sends
 * emails using Gmail's built-in MailApp service (which works
 * over HTTPS and is never blocked by hosting providers).
 *
 * SETUP:
 * 1. Go to https://script.google.com and create a NEW project
 *    (do NOT add this to the existing MUN spreadsheet script).
 * 2. Paste this entire file as the Code.gs contents.
 * 3. Set the RELAY_SECRET below to a strong random string.
 * 4. Click Deploy → New deployment → Web app
 *    - Execute as: Me (paramountinternationalmun.26@gmail.com)
 *    - Who has access: Anyone
 * 5. Copy the web app URL and set it as the EMAIL_RELAY_URL
 *    environment variable in your Render Backend service.
 * 6. Also set EMAIL_RELAY_SECRET in Render to match RELAY_SECRET below.
 */

// Shared secret — change this to something random and set the same value
// as EMAIL_RELAY_SECRET in Render's environment variables
var RELAY_SECRET = "pmun2026-email-relay-secret-change-me";

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Verify the shared secret
    if (payload.secret !== RELAY_SECRET) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "unauthorized" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var mailOptions = {
      to: payload.to,
      subject: payload.subject,
      htmlBody: payload.html,
    };

    if (payload.bcc) {
      mailOptions.bcc = payload.bcc;
    }

    if (payload.replyTo) {
      mailOptions.replyTo = payload.replyTo;
    }

    // Set the sender name
    mailOptions.name = payload.name || "Paramount MUN";

    MailApp.sendEmail(mailOptions);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, method: "apps-script-relay" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "Email relay is running", timestamp: new Date().toISOString() })
  ).setMimeType(ContentService.MimeType.JSON);
}
