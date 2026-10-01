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

function stripHtml_(html) {
  return String(html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    // Verify the shared secret (trimmed, strip quotes)
    var cleanProvidedSecret = String(payload.secret || "").trim().replace(/^["']|["']$/g, "");
    var cleanExpectedSecret = String(RELAY_SECRET || "").trim().replace(/^["']|["']$/g, "");

    // Accept if matches RELAY_SECRET OR if it matches this Web App's deployment ID / URL
    var isAuthorized = false;
    if (cleanProvidedSecret && cleanExpectedSecret && cleanProvidedSecret === cleanExpectedSecret) {
      isAuthorized = true;
    } else {
      try {
        var serviceUrl = ScriptApp.getService().getUrl() || "";
        if (cleanProvidedSecret && cleanProvidedSecret.length >= 20 && serviceUrl.indexOf(cleanProvidedSecret) !== -1) {
          isAuthorized = true;
        }
      } catch (svcErr) {}
    }

    if (!isAuthorized) {
      return ContentService.createTextOutput(
        JSON.stringify({
          ok: false,
          error: "unauthorized",
          hint: "Secret mismatch. Apps Script expected length " + cleanExpectedSecret.length + ", received length " + cleanProvidedSecret.length + " (starts with " + cleanProvidedSecret.slice(0, 6) + "...)"
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var cleanTo = String(payload.to || "").trim();
    if (!cleanTo) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "missing_recipient" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var cleanSubject = String(payload.subject || "Paramount International MUN Notification").trim();
    var plainBody = payload.body || payload.text || stripHtml_(payload.html) || "Paramount International MUN Registration Confirmation";
    var senderName = payload.name || "Paramount MUN";

    var options = {
      htmlBody: payload.html,
      name: senderName,
    };

    if (payload.bcc) {
      options.bcc = String(payload.bcc).trim();
    }

    if (payload.replyTo) {
      options.replyTo = String(payload.replyTo).trim();
    }

    // Try GmailApp first (sends from the authenticated Google account with full SPF/DKIM and logs in Sent Mail)
    try {
      GmailApp.sendEmail(cleanTo, cleanSubject, plainBody, options);
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, method: "gmail-app", to: cleanTo })
      ).setMimeType(ContentService.MimeType.JSON);
    } catch (gmailErr) {
      // Fallback to MailApp if GmailApp encounters permission or scope issues
      var mailOptions = {
        to: cleanTo,
        subject: cleanSubject,
        body: plainBody,
        htmlBody: payload.html,
        name: senderName,
      };
      if (options.bcc) mailOptions.bcc = options.bcc;
      if (options.replyTo) mailOptions.replyTo = options.replyTo;

      MailApp.sendEmail(mailOptions);
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, method: "mail-app-fallback", to: cleanTo })
      ).setMimeType(ContentService.MimeType.JSON);
    }

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

/**
 * Diagnostic test function you can run directly from the Apps Script editor.
 * Click "Run" on testRelayEmail to test delivery and grant permissions in one click.
 */
function testRelayEmail() {
  var testRecipient = "paramountinternationalmun.26@gmail.com";
  try {
    GmailApp.sendEmail(
      testRecipient,
      "Relay Self-Test — Paramount MUN",
      "This is a self-test email verifying that GmailApp permissions are active.",
      { name: "Paramount MUN" }
    );
    Logger.log("SUCCESS: GmailApp sent test email to " + testRecipient);
  } catch (e) {
    Logger.log("GmailApp failed: " + e + ". Trying MailApp...");
    MailApp.sendEmail({
      to: testRecipient,
      subject: "Relay Self-Test (MailApp) — Paramount MUN",
      body: "This is a self-test email verifying that MailApp permissions are active.",
      name: "Paramount MUN"
    });
    Logger.log("SUCCESS: MailApp sent test email to " + testRecipient);
  }
}
