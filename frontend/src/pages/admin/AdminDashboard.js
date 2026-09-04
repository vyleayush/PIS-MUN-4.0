import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Users, ClipboardList, Ticket, Search, Plus, Trash2, X, Download, RefreshCw } from "lucide-react";
import {
  adminStats, adminRegistrations, adminUpdateRegistration, adminDeleteRegistration, adminAllotRegistration,
  adminCommittees, adminUpdateCommittee, adminUpdatePortfolio,
  adminReferralCodes, adminCreateCode, adminUpdateCode, adminDeleteCode,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { API } from "@/lib/api";

const STATUS_COLOR = {
  pending: "#E0B84A",
  verified: "#2FBF71",
  rejected: "#E35D6A",
};

const TABS = [
  { id: "registrations", label: "Registrations", icon: ClipboardList },
  { id: "committees", label: "Committees", icon: Users },
  { id: "referrals", label: "Referral Codes", icon: Ticket },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("registrations");
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [regs, setRegs] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [codes, setCodes] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const autoRefreshRef = useRef(null);
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const refreshStats = useCallback(() => adminStats().then(setStats).catch(() => {}), []);

  const loadAll = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [s, r, c, k] = await Promise.all([
        adminStats(),
        adminRegistrations(),
        adminCommittees(),
        adminReferralCodes(),
      ]);
      setStats(s);
      setRegs(r);
      setCommittees(c);
      setCodes(k);
      // Update the open drawer with fresh data if there is one
      const curr = selectedRef.current;
      if (curr) {
        const fresh = r.find((x) => x.id === curr.id);
        if (fresh) setSelected(fresh);
      }
      if (isManual) toast.success("Data refreshed");
    } catch (e) {
      toast.error("Session expired. Please sign in again.");
      localStorage.removeItem("pmun_admin_token");
      navigate("/admin/login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("pmun_admin_token")) { navigate("/admin/login"); return; }
    loadAll();
    // Auto-refresh every 60 seconds so admins always see fresh data
    autoRefreshRef.current = setInterval(() => loadAll(false), 60000);
    return () => { if (autoRefreshRef.current) clearInterval(autoRefreshRef.current); };
    // eslint-disable-next-line
  }, []);

  const logout = () => { localStorage.removeItem("pmun_admin_token"); navigate("/admin/login"); };

  const setRegStatus = async (reg, status) => {
    // The API returns { ok, registration, ...spread } — extract the clean registration object
    const response = await adminUpdateRegistration(reg.id, { payment_status: status });
    const updated = response.registration ?? response;
    setRegs((prev) => prev.map((x) => (x.id === reg.id ? updated : x)));
    if (selected?.id === reg.id) setSelected(updated);
    refreshStats();
    if (status === "verified") {
      toast.success(`Marked verified & confirmation email sent to ${reg.email}!`);
    } else {
      toast.success(`Marked ${status}`);
    }
  };

  const saveNote = async (reg, note) => {
    const response = await adminUpdateRegistration(reg.id, { admin_note: note });
    const updated = response.registration ?? response;
    setRegs((prev) => prev.map((x) => x.id === reg.id ? updated : x));
    if (selected?.id === reg.id) setSelected(updated);
    toast.success("Note saved");
  };

  // CSV download with auth token + cache-busting (avoids browser caching stale data)
  const downloadCsv = async (endpoint, filename) => {
    try {
      const token = localStorage.getItem("pmun_admin_token");
      const res = await fetch(`${API}${endpoint}?t=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download CSV");
    }
  };

  const allotPortfolio = async (reg, committeeSlug, portfolioName) => {
    try {
      const resp = await adminAllotRegistration(reg.id, { committeeSlug, portfolioName });
      const updatedReg = resp.registration ?? resp;
      setRegs((prev) => prev.map((x) => (x.id === reg.id ? updatedReg : x)));
      if (selected?.id === reg.id) setSelected(updatedReg);
      // Reload committees to get updated portfolio status
      const updatedCommittees = await adminCommittees();
      setCommittees(updatedCommittees);
      refreshStats();
      toast.success(`Allotted to ${committeeSlug.toUpperCase()} — ${portfolioName} & email sent to ${reg.email}!`);
    } catch { toast.error("Allotment failed"); }
  };



  const deleteReg = async (reg) => {
    if (!window.confirm(`Are you sure you want to delete ${reg.full_name}'s registration? This action cannot be undone.`)) return;
    try {
      await adminDeleteRegistration(reg.id);
      autoRefreshRef.current && clearInterval(autoRefreshRef.current); // pause auto-refresh during delete flow
      setRegs((prev) => prev.filter((x) => x.id !== reg.id));
      setSelected(null);
      refreshStats();
      toast.success("Registration deleted");
      // Restart auto-refresh after delete
      autoRefreshRef.current = setInterval(() => loadAll(false), 60000);
    } catch { toast.error("Failed to delete registration"); }
  };

  const filtered = regs.filter((r) => {
    if (!q) return true;
    const s = `${r.full_name} ${r.email} ${r.school} ${r.reference_id}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      {/* topbar */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg text-foreground">Paramount MUN · Admin</span>
            <span className="mono-label text-brass text-[9px]">Organizing Committee</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAll(true)}
              disabled={refreshing || loading}
              title="Refresh all data"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground hover:border-brass transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={logout} data-testid="admin-logout" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm text-foreground hover:border-brass transition-colors">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { k: "Total", v: stats.total, c: "#C7A35A" },
            { k: "Pending", v: stats.pending, c: STATUS_COLOR.pending },
            { k: "Verified", v: stats.verified, c: STATUS_COLOR.verified },
            { k: "Rejected", v: stats.rejected, c: STATUS_COLOR.rejected },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-border bg-card p-5">
              <div className="mono-label text-muted-foreground">{s.k}</div>
              <div className="font-display text-4xl mt-1" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="mt-8 flex gap-2 border-b border-border">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                data-testid={`admin-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
                  tab === t.id ? "border-brass text-brass" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {loading && <div className="mt-8 text-muted-foreground">Loading…</div>}

        {/* Registrations */}
        {!loading && tab === "registrations" && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="relative max-w-sm w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input data-testid="admin-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, ref ID…" className="bg-white/[0.02] border-border text-foreground focus-visible:ring-brass h-10 pl-9 w-full" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => downloadCsv("/admin/registrations.csv", "registrations.csv")}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/[0.05] border border-border px-3.5 text-sm font-medium text-foreground hover:bg-white/[0.09] hover:border-brass/40 transition-colors whitespace-nowrap"
                  title="Export complete list of all registered delegates"
                >
                  <Download size={15} className="text-brass" /> Export Full List (CSV)
                </button>
                <button
                  onClick={() => downloadCsv("/admin/allotments.csv", "allotments.csv")}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-brass px-3.5 text-sm font-medium text-[#070A0F] hover:bg-brass-hover transition-colors whitespace-nowrap"
                  title="Export confirmed allotments only"
                >
                  <ClipboardList size={15} /> Export Allotments (CSV)
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table data-testid="admin-registrations-table" className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-white/[0.02] text-left">
                    {["Ref ID", "Name", "School", "Prefs", "Fee", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 mono-label text-muted-foreground font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No registrations yet.</td></tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-border hover:bg-[rgba(199,163,90,0.06)] transition-colors">
                      <td className="px-4 py-3 font-mono text-brass">{r.reference_id}</td>
                      <td className="px-4 py-3 text-foreground">{r.full_name}<div className="text-xs text-muted-foreground">{r.email}</div></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.school}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.preference1?.committee}{r.preference2?.committee ? ` / ${r.preference2.committee}` : ""}</td>
                      <td className="px-4 py-3 text-foreground">
                        <div>₹{r.fee}</div>
                        {r.applied_referral ? (
                          <div className="text-[11px] text-[#2FBF71] font-mono mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF71]" />
                            {r.applied_referral} (Active)
                          </div>
                        ) : r.referral_code ? (
                          <div className="text-[11px] text-[#E0B84A] font-mono mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E0B84A]" />
                            {r.referral_code}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className="mono-label rounded-full px-2.5 py-1 border" style={{ color: STATUS_COLOR[r.payment_status], borderColor: STATUS_COLOR[r.payment_status] }}>
                          {r.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(r)} data-testid={`admin-view-${r.reference_id}`} className="text-brass hover:underline text-sm">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Committees */}
        {!loading && tab === "committees" && (
          <div className="mt-6 space-y-4">
            {committees.map((c) => (
              <CommitteeEditor key={c.slug} committee={c} onCommitteeSaved={(nc) => setCommittees((prev) => prev.map((x) => x.slug === nc.slug ? { ...x, ...nc } : x))} />
            ))}
          </div>
        )}

        {/* Referral codes */}
        {!loading && tab === "referrals" && (
          <ReferralManager codes={codes} setCodes={setCodes} />
        )}
      </div>

      {/* registration drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#070A0F]/70" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <div className="font-mono text-brass text-lg">{selected.reference_id}</div>
              <button onClick={() => setSelected(null)}><X className="text-muted-foreground hover:text-foreground" size={20} /></button>
            </div>
            <h3 className="font-display text-3xl text-foreground mt-2">{selected.full_name}</h3>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ["Email", selected.email], ["Phone", selected.phone], ["School", selected.school],
                ["City", selected.city || "—"], ["Experience", selected.experience],
                ["Awards", selected.awards || "—"],
                ["Delegation", selected.is_delegation ? `Yes (${selected.delegation_size || "?"})` : "No"],
                ["Heard from", selected.heard_from || "—"],
                ["Preference 1", `${selected.preference1?.committee || "—"} — ${selected.preference1?.portfolio || "Any"}`],
                ["Preference 2", `${selected.preference2?.committee || "—"} — ${selected.preference2?.portfolio || "Any"}`],
                ["Preference 3", `${selected.preference3?.committee || "—"} — ${selected.preference3?.portfolio || "Any"}`],
                ["Referral Code", selected.applied_referral ? `${selected.applied_referral} (Active · Discount Applied)` : (selected.referral_code ? `${selected.referral_code} (Not Activated / Standard Fee)` : "None")],
                ["Fee", `₹${selected.fee} (${selected.fee_tier})`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border/60 py-1.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="mono-label text-muted-foreground mb-2">ID card (referral verification)</div>
              {selected.id_card ? (
                <a href={selected.id_card} target="_blank" rel="noreferrer" data-testid="admin-id-card" className="block">
                  {selected.id_card.startsWith("data:image") ? (
                    <img src={selected.id_card} alt="Delegate ID card" className="max-h-44 rounded-lg border border-border" />
                  ) : (
                    <span className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm text-brass">Open uploaded ID (PDF)</span>
                  )}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">No ID uploaded (no referral code used).</span>
              )}
            </div>

            <div className="mt-5">
              <div className="mono-label text-muted-foreground mb-2">Payment screenshot</div>
              {selected.payment_screenshot ? (
                <a href={selected.payment_screenshot} target="_blank" rel="noreferrer" className="block">
                  <img src={selected.payment_screenshot} alt="Payment screenshot" className="max-h-44 rounded-lg border border-border" />
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">No payment screenshot uploaded.</span>
              )}
            </div>

            <div className="mt-5">
              <div className="mono-label text-muted-foreground mb-2">Payment status & Allotment</div>
              <StatusButtons reg={selected} onSetStatus={setRegStatus} />
              
              <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                <div className="mono-label text-muted-foreground mb-3">Accept & Allot Portfolio</div>
                {selected.allotted_committee ? (
                  <div className="text-sm">
                    <span className="text-brass">Currently Allotted:</span> {selected.allotted_committee} — {selected.allotted_portfolio}
                  </div>
                ) : (
                  <AllotmentEditor reg={selected} onAllot={allotPortfolio} />
                )}
              </div>

              {selected.payment_status === "rejected" && (
                <button
                  onClick={() => deleteReg(selected)}
                  className="mt-3 w-full h-10 rounded-lg text-sm border border-destructive text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete Registration
                </button>
              )}
            </div>

            <div className="mt-5">
              <div className="mono-label text-muted-foreground mb-2">Admin note</div>
              <NoteEditor reg={selected} onSave={saveNote} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Extracted status buttons with per-button loading state to prevent accidental double-clicks
function StatusButtons({ reg, onSetStatus }) {
  const [loadingStatus, setLoadingStatus] = useState(null);

  const handleSetStatus = async (status) => {
    if (loadingStatus) return;
    setLoadingStatus(status);
    try {
      await onSetStatus(reg, status);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <div className="flex gap-2 mb-3">
      {["pending", "verified", "rejected"].map((s) => (
        <button
          key={s}
          data-testid={`admin-set-${s}`}
          onClick={() => handleSetStatus(s)}
          disabled={!!loadingStatus}
          className={`flex-1 h-10 rounded-lg text-sm border transition-colors disabled:opacity-60 ${reg.payment_status === s ? "text-[#070A0F]" : "text-foreground"}`}
          style={reg.payment_status === s ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] } : { borderColor: "hsl(var(--border))" }}
        >
          {loadingStatus === s ? "…" : s}
        </button>
      ))}
    </div>
  );
}

function AllotmentEditor({ reg, onAllot }) {
  const [pref, setPref] = useState("pref1");
  const [customComm, setCustomComm] = useState("");
  const [customPort, setCustomPort] = useState("");
  const [allotting, setAllotting] = useState(false);

  const handleAllot = async () => {
    if (allotting) return;
    let comm = "", port = "";
    if (pref === "pref1") { comm = reg.preference1?.committee; port = reg.preference1?.portfolio; }
    else if (pref === "pref2") { comm = reg.preference2?.committee; port = reg.preference2?.portfolio; }
    else if (pref === "pref3") { comm = reg.preference3?.committee; port = reg.preference3?.portfolio; }
    else { comm = customComm; port = customPort; }

    if (!comm || !port) return toast.error("Please enter both committee and portfolio");
    
    // Normalize committee name to slug (very simple normalization for UI matches, but backend uses slug matching)
    // If it's a known committee, backend expects a slug like "unga", "aippm".
    // For our system, the preference fields usually store full names. We should just pass what we have and let backend handle, 
    // BUT the backend expects `committeeSlug`.
    let slug = comm.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (comm.toUpperCase() === "UNGA") slug = "unga";
    if (comm.toUpperCase() === "AIPPM") slug = "aippm";
    if (comm.toUpperCase() === "WHO") slug = "who";
    if (comm.toUpperCase() === "UNCSW") slug = "uncsw";
    if (comm.toUpperCase() === "UNHRC") slug = "unhrc";

    setAllotting(true);
    try {
      await onAllot(reg, slug, port);
    } finally {
      setAllotting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Select value={pref} onValueChange={setPref}>
        <SelectTrigger className="bg-[rgba(255,255,255,0.02)] border-border text-sm h-9">
          <SelectValue placeholder="Select Preference" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pref1">Pref 1: {reg.preference1?.committee} ({reg.preference1?.portfolio || "Any"})</SelectItem>
          <SelectItem value="pref2">Pref 2: {reg.preference2?.committee} ({reg.preference2?.portfolio || "Any"})</SelectItem>
          <SelectItem value="pref3">Pref 3: {reg.preference3?.committee} ({reg.preference3?.portfolio || "Any"})</SelectItem>
          <SelectItem value="custom">Custom Allotment</SelectItem>
        </SelectContent>
      </Select>

      {pref === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Committee Slug (e.g. unga)" value={customComm} onChange={(e) => setCustomComm(e.target.value)} className="h-9 bg-transparent border-border text-sm" />
          <Input placeholder="Portfolio (e.g. India)" value={customPort} onChange={(e) => setCustomPort(e.target.value)} className="h-9 bg-transparent border-border text-sm" />
        </div>
      )}

      <button onClick={handleAllot} disabled={allotting} className="w-full h-9 rounded-lg bg-brass text-[#070A0F] text-sm font-medium hover:bg-brass-hover transition-colors disabled:opacity-60">
        {allotting ? "Allotting…" : "Confirm & Allot"}
      </button>
    </div>
  );
}

function NoteEditor({ reg, onSave }) {
  const [note, setNote] = useState(reg.admin_note || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => setNote(reg.admin_note || ""), [reg.id, reg.admin_note]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try { await onSave(reg, note); } finally { setSaving(false); }
  };

  return (
    <div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} data-testid="admin-note" rows={3} className="w-full rounded-lg bg-white/[0.02] border border-border text-foreground p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brass" placeholder="Verification notes…" />
      <button onClick={handleSave} disabled={saving} className="mt-2 h-9 px-4 rounded-lg bg-brass text-[#070A0F] text-sm font-medium hover:bg-brass-hover transition-colors disabled:opacity-60">{saving ? "Saving…" : "Save note"}</button>
    </div>
  );
}

function CommitteeEditor({ committee, onCommitteeSaved }) {
  const [c, setC] = useState(committee);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local state when parent refreshes committee data (e.g. after global refresh)
  useEffect(() => { setC(committee); }, [committee]);

  const saveMeta = async () => {
    setSaving(true);
    try {
      const updated = await adminUpdateCommittee(c.slug, { chair: c.chair, eb: c.eb, difficulty: c.difficulty });
      onCommitteeSaved(updated);
      toast.success(`${c.name} updated`);
    } catch { toast.error("Save failed"); } finally { setSaving(false); }
  };

  const togglePortfolio = async (p, status) => {
    try {
      const updated = await adminUpdatePortfolio(c.slug, { name: p.name, status });
      setC((prev) => ({ ...prev, portfolios: updated.portfolios, open_count: updated.open_count }));
      onCommitteeSaved(updated);
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-5 flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-foreground">{c.name}</div>
          <div className="mono-label text-muted-foreground">{c.open_count} of {c.total_count} open</div>
        </div>
        <button data-testid={`admin-committee-toggle-${c.slug}`} onClick={() => setExpanded((e) => !e)} className="mono-label text-brass hover:underline">{expanded ? "Collapse" : "Edit"}</button>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="mono-label text-muted-foreground">Chair</label>
              <Input value={c.chair === "TBA" ? "" : c.chair} onChange={(e) => setC({ ...c, chair: e.target.value || "TBA" })} placeholder="TBA" className="bg-white/[0.02] border-border text-foreground h-10 focus-visible:ring-brass" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="mono-label text-muted-foreground">Executive Board</label>
              <Input value={c.eb === "TBA" ? "" : c.eb} onChange={(e) => setC({ ...c, eb: e.target.value || "TBA" })} placeholder="TBA" className="bg-white/[0.02] border-border text-foreground h-10 focus-visible:ring-brass" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="mono-label text-muted-foreground">Difficulty</label>
              <Select value={c.difficulty} onValueChange={(v) => setC({ ...c, difficulty: v })}>
                <SelectTrigger className="bg-white/[0.02] border-border text-foreground h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["TBA", "Beginner", "Intermediate", "Advanced"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <button onClick={saveMeta} disabled={saving} data-testid={`admin-committee-save-${c.slug}`} className="mt-3 h-9 px-4 rounded-lg bg-brass text-[#070A0F] text-sm font-medium hover:bg-brass-hover transition-colors disabled:opacity-60">Save details</button>

          <div className="mono-label text-muted-foreground mt-6 mb-2">Portfolios ({c.portfolios.length})</div>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
            {c.portfolios.map((p) => (
              <div key={p.name} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-foreground">{p.name}{p.party ? <span className="text-muted-foreground"> — {p.party}</span> : ""}</span>
                <Select value={p.status} onValueChange={(v) => togglePortfolio(p, v)}>
                  <SelectTrigger className="w-32 h-8 bg-white/[0.02] border-border text-foreground text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["available", "reserved", "allotted"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReferralManager({ codes, setCodes }) {
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [discount, setDiscount] = useState(500);

  const create = async () => {
    if (!code.trim()) return toast.error("Enter a code");
    try {
      const created = await adminCreateCode({ code: code.trim(), label, discount: Number(discount), active: true });
      setCodes((prev) => [...prev, created]);
      setCode(""); setLabel(""); setDiscount(500);
      toast.success("Code created");
    } catch (e) { toast.error(e?.response?.data?.detail || "Failed"); }
  };
  const toggle = async (c) => {
    const nextState = !c.active;
    try {
      const updated = await adminUpdateCode(c.code, { active: nextState });
      setCodes((prev) => prev.map((x) => x.code === c.code ? { ...x, active: nextState } : x));
      toast.success(`Code ${c.code} is now ${nextState ? "Active" : "Not Active"}`);
    } catch { toast.error("Failed to update status"); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete referral code ${c.code}?`)) return;
    try { await adminDeleteCode(c.code); setCodes((prev) => prev.filter((x) => x.code !== c.code)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mono-label text-muted-foreground mb-3">Create referral code</div>
        <div className="grid sm:grid-cols-4 gap-3">
          <Input data-testid="admin-code-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" className="bg-white/[0.02] border-border text-foreground h-10 focus-visible:ring-brass" />
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (who it's for)" className="bg-white/[0.02] border-border text-foreground h-10 focus-visible:ring-brass sm:col-span-2" />
          <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="₹ off" className="bg-white/[0.02] border-border text-foreground h-10 focus-visible:ring-brass" />
        </div>
        <button onClick={create} data-testid="admin-code-create" className="mt-3 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-brass text-[#070A0F] text-sm font-medium hover:bg-brass-hover transition-colors">
          <Plus size={15} /> Add code
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-white/[0.02] text-left">
            {["Code", "Label", "₹ Off", "Used", "Status / Toggle", ""].map((h) => <th key={h} className="px-4 py-3 mono-label text-muted-foreground font-normal">{h}</th>)}
          </tr></thead>
          <tbody>
            {codes.map((c) => {
              const isActive = Boolean(c.active);
              return (
                <tr key={c.code} className="border-t border-border hover:bg-white/[0.01]">
                  <td className="px-4 py-3 font-mono font-semibold text-brass">{c.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.label || "—"}</td>
                  <td className="px-4 py-3 text-foreground font-medium">₹{c.discount}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.usage_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => toggle(c)}
                        aria-label={`Toggle ${c.code} active status`}
                      />
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isActive
                            ? "bg-[#2FBF71]/15 text-[#2FBF71] border-[#2FBF71]/30"
                            : "bg-[#E35D6A]/15 text-[#E35D6A] border-[#E35D6A]/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#2FBF71]" : "bg-[#E35D6A]"}`} />
                        {isActive ? "Active" : "Not Active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right"><button onClick={() => remove(c)} className="text-destructive hover:opacity-80 p-1"><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
