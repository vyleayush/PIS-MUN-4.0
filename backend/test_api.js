const http = require("http");

async function runTests() {
  const baseUrl = "http://localhost:8000";

  function request(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl + path);
      const reqHeaders = { ...headers };
      let bodyData = null;

      if (data) {
        bodyData = JSON.stringify(data);
        reqHeaders["Content-Type"] = "application/json";
        reqHeaders["Content-Length"] = Buffer.byteLength(bodyData);
      }

      const req = http.request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method,
          headers: reqHeaders,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            let parsed = body;
            try {
              parsed = JSON.parse(body);
            } catch (e) {}
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          });
        }
      );

      req.on("error", reject);
      if (bodyData) req.write(bodyData);
      req.end();
    });
  }

  console.log("------------------------------------------");
  console.log("STARTING FULL API & DATABASE VERIFICATION");
  console.log("------------------------------------------\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test("GET /api (Health Check)", async () => {
    const res = await request("GET", "/api");
    if (res.status !== 200 || !res.data.status) throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
  });

  // 2. Get committees
  let committees = [];
  await test("GET /api/committees", async () => {
    const res = await request("GET", "/api/committees");
    if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error(`Expected array of committees`);
    }
    committees = res.data;
  });

  // 3. Get single committee
  await test("GET /api/committees/:slug (unga)", async () => {
    const res = await request("GET", "/api/committees/unga");
    if (res.status !== 200 || res.data.slug !== "unga") throw new Error(`Expected UNGA committee`);
  });

  // 4. Validate referral code
  await test("POST /api/referral/validate (Valid Code)", async () => {
    const res = await request("POST", "/api/referral/validate", { code: "PARAMOUNT500" });
    if (res.status !== 200 || !res.data.valid) throw new Error(`Expected valid code`);
  });

  await test("POST /api/referral/validate (Invalid Code)", async () => {
    const res = await request("POST", "/api/referral/validate", { code: "INVALID999" });
    if (res.status !== 200 || res.data.valid) throw new Error(`Expected invalid code response`);
  });

  // 5. Submit Registration
  let refId = "";
  let regId = "";
  await test("POST /api/registrations (Create Registration)", async () => {
    const res = await request("POST", "/api/registrations", {
      full_name: "Test Delegate",
      email: "delegate.test@example.com",
      phone: "+91 9876543210",
      school: "Delhi Public School",
      city: "New Delhi",
      experience: "1–2 conferences",
      awards: "Best Delegate 2025",
      is_delegation: false,
      heard_from: "Instagram",
      preference1: { committee: "UNGA", portfolio: "India" },
      preference2: { committee: "WHO", portfolio: "Brazil" },
      preference3: { committee: "AIPPM", portfolio: "Narendra Modi" },
      referral_code: "PARAMOUNT500",
      payment_screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      id_card: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      accepted_terms: true,
    });
    if (res.status !== 200 || !res.data.reference_id) throw new Error(`Registration creation failed`);
    refId = res.data.reference_id;
  });

  // 6. Admin Login
  let adminToken = "";
  await test("POST /api/admin/login", async () => {
    const res = await request("POST", "/api/admin/login", {
      email: "paramountinternationalmun.26@gmail.com",
      password: "Mun0910@",
    });
    if (res.status !== 200 || !res.data.token) throw new Error(`Admin login failed`);
    adminToken = res.data.token;
  });

  // 7. Admin Stats
  await test("GET /api/admin/stats", async () => {
    const res = await request("GET", "/api/admin/stats", null, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || typeof res.data.total !== "number") throw new Error(`Stats failed`);
  });

  // 8. Admin Registrations List
  await test("GET /api/admin/registrations", async () => {
    const res = await request("GET", "/api/admin/registrations", null, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || !Array.isArray(res.data)) throw new Error(`Expected registrations array`);
    const found = res.data.find((r) => r.reference_id === refId);
    if (!found) throw new Error(`Created registration ${refId} not found in DB list`);
    regId = found.id;
  });

  // 9. Admin Update Registration Note
  await test("PATCH /api/admin/registrations/:id (Update Note)", async () => {
    const res = await request("PATCH", `/api/admin/registrations/${regId}`, { admin_note: "Verified via Test" }, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || res.data.admin_note !== "Verified via Test") throw new Error(`Failed to update note`);
  });

  // 10. Admin Allot Registration
  await test("POST /api/admin/registrations/:id/allot", async () => {
    const res = await request("POST", `/api/admin/registrations/${regId}/allot`, { committeeSlug: "unga", portfolioName: "India" }, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || res.data.registration.allotted_committee !== "unga" || res.data.registration.allotted_portfolio !== "India") {
      throw new Error(`Allotment failed`);
    }
  });

  // 11. Admin Allotments CSV
  await test("GET /api/admin/allotments.csv", async () => {
    const res = await request("GET", "/api/admin/allotments.csv", null, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || !res.data.includes("Test Delegate") || !res.data.includes("India")) {
      throw new Error(`CSV missing allotted delegate info`);
    }
  });

  // 12. Admin Committee Update
  await test("PATCH /api/admin/committees/:slug", async () => {
    const res = await request("PATCH", "/api/admin/committees/unga", { chair: "Alex Morgan" }, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200 || res.data.chair !== "Alex Morgan") throw new Error(`Failed to update chair`);
  });

  // 13. Admin Portfolio Status Update
  await test("PATCH /api/admin/committees/:slug/portfolios", async () => {
    const res = await request("PATCH", "/api/admin/committees/unga/portfolios", { name: "Argentina", status: "reserved" }, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200) throw new Error(`Failed to update portfolio status`);
    const port = res.data.portfolios.find((p) => p.name === "Argentina");
    if (!port || port.status !== "reserved") throw new Error(`Portfolio status not updated`);
  });

  // 14. Admin Referral Code Management (CRUD)
  await test("POST & PATCH & DELETE /api/admin/referral-codes", async () => {
    // Create
    const createRes = await request("POST", "/api/admin/referral-codes", { code: "SPECIAL700", discount: 700, label: "Special Promo", active: true }, { Authorization: `Bearer ${adminToken}` });
    if (createRes.status !== 200 || createRes.data.code !== "SPECIAL700") throw new Error(`Failed to create code`);

    // Patch
    const patchRes = await request("PATCH", "/api/admin/referral-codes/SPECIAL700", { active: false }, { Authorization: `Bearer ${adminToken}` });
    if (patchRes.status !== 200 || patchRes.data.active !== false) throw new Error(`Failed to update code`);

    // Delete
    const deleteRes = await request("DELETE", "/api/admin/referral-codes/SPECIAL700", null, { Authorization: `Bearer ${adminToken}` });
    if (deleteRes.status !== 200) throw new Error(`Failed to delete code`);
  });

  // 15. Delete Test Registration
  await test("DELETE /api/admin/registrations/:id", async () => {
    const res = await request("DELETE", `/api/admin/registrations/${regId}`, null, { Authorization: `Bearer ${adminToken}` });
    if (res.status !== 200) throw new Error(`Failed to delete registration`);
  });

  console.log("\n------------------------------------------");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("------------------------------------------");

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
