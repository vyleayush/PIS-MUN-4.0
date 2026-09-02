import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCommittees, validateReferral, submitRegistration, uploadRegistrationScreenshot } from "@/lib/api";
import { ASSET } from "@/lib/assets";

const EXPERIENCE = ["First-timer", "1–2 conferences", "3–5 conferences", "6+ (veteran)"];
const STEPS = ["Personal", "Institution", "Preference 1", "Preference 2", "Preference 3", "Reference"];

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-2">
    <Label className="mono-label text-muted-foreground">
      {label} {required && <span className="text-brass">*</span>}
    </Label>
    {children}
    {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
  </div>
);

const inputCls =
  "bg-white/[0.02] border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-brass h-11 text-base sm:text-sm";

const DEFAULT_COMMITTEES = [
  { slug: "unga", name: "UNGA", open_count: 42, total_count: 60, portfolios: [] },
  { slug: "aippm", name: "AIPPM", open_count: 28, total_count: 50, portfolios: [] },
  { slug: "who", name: "WHO", open_count: 36, total_count: 60, portfolios: [] },
  { slug: "uncsw", name: "UNCSW", open_count: 31, total_count: 60, portfolios: [] },
  { slug: "unhrc", name: "UNHRC", open_count: 39, total_count: 60, portfolios: [] },
];

export default function Register() {
  const navigate = useNavigate();
  const [committees, setCommittees] = useState(DEFAULT_COMMITTEES);
  const [step, setStep] = useState(1); // 1..5
  const [phase, setPhase] = useState("form"); // form | payment | done
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [refState, setRefState] = useState(null); // null | 'valid' | 'invalid'
  const [refResult, setRefResult] = useState(null);
  const [reference, setReference] = useState("");

  const [f, setF] = useState({
    full_name: "", email: "", phone: "", school: "", city: "",
    experience: "", awards: "", is_delegation: false, delegation_size: "",
    heard_from: "",
    preference1: { committee: "", portfolio: "" },
    preference2: { committee: "", portfolio: "" },
    preference3: { committee: "", portfolio: "" },
    referral_code: "", accepted_terms: false, id_card: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    getCommittees()
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setCommittees(d);
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setPref = (which, k, v) => setF((p) => ({ ...p, [which]: { ...p[which], [k]: v } }));

  const onIdUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (max 5MB)");
    const reader = new FileReader();
    reader.onload = () => set("id_card", reader.result);
    reader.readAsDataURL(file);
  };

  const onScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) return toast.error("Please select an image (jpg or png)");
    if (file.size > 8 * 1024 * 1024) return toast.error("File too large (max 8MB)");
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result);
      setScreenshotFile(file);
      set("payment_screenshot", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const portfoliosFor = (slug) => {
    const c = committees.find((x) => x.slug === slug);
    if (!c) return [];
    return c.portfolios.filter((p) => p.status === "available");
  };
  const cName = (slug) => committees.find((c) => c.slug === slug)?.name || slug;
  
  // Calculate fee based on referral code
  const calculateFee = () => {
    if (refState === 'valid' && f.referral_code.trim()) {
      return 1500; // BASE_FEE (2000) - discount (500)
    }
    return 2000; // BASE_FEE
  };

  const validateStep = () => {
    if (step === 1) {
      if (!f.full_name.trim()) return "Enter your full name";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return "Enter a valid email";
      if (!f.phone.trim() || f.phone.replace(/\D/g, "").length < 8) return "Enter a valid phone number";
    }
    if (step === 2) {
      if (!f.school.trim()) return "Enter your school or college";
      if (!f.experience) return "Select your MUN experience level";
      if (f.is_delegation && (!f.delegation_size || Number(f.delegation_size) < 1)) return "Enter your delegation size";
    }
    if (step === 3) {
      if (!f.preference1.committee) return "Pick your first committee preference";
    }
    if (step === 4) {
      if (!f.preference2.committee) return "Pick your second committee preference";
    }
    if (step === 5) {
      if (!f.preference3.committee) return "Pick your third committee preference";
    }
    if (step === 6) {
      if (f.referral_code.trim() && !f.id_card) return "Please upload your ID card to use a referral code";
      if (!f.accepted_terms) return "Please accept the terms to continue";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return toast.error(err);
    if (step < 6) setStep((s) => s + 1);
    else setPhase("payment");
  };
  const back = () => {
    if (phase === "payment") return setPhase("form");
    if (step > 1) setStep((s) => s - 1);
    else navigate("/");
  };

  const checkReferral = async () => {
    const code = f.referral_code.trim();
    if (!code) { setRefState(null); setRefResult(null); return; }
    try {
      const r = await validateReferral(code);
      if (r.valid) { setRefState("valid"); setRefResult(r); toast.success("Referral code applied"); }
      else { setRefState("invalid"); setRefResult(null); toast.error("That code isn't valid"); }
    } catch { setRefState("invalid"); }
  };

  const doSubmit = async () => {
    if (!f.payment_screenshot && !screenshotFile) {
      return toast.error("Please upload a payment screenshot before submitting.");
    }
    setSubmitting(true);
    try {
      const payload = {
        ...f,
        delegation_size: f.is_delegation && f.delegation_size ? Number(f.delegation_size) : null,
        preference1: { committee: cName(f.preference1.committee), portfolio: f.preference1.portfolio || "" },
        preference2: { committee: cName(f.preference2.committee), portfolio: f.preference2.portfolio || "" },
        preference3: { committee: cName(f.preference3.committee), portfolio: f.preference3.portfolio || "" },
      };
      const res = await submitRegistration(payload);
      setReference(res.reference_id);
      setPhase("done");
      window.scrollTo(0, 0);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background/95">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display text-lg text-foreground">Paramount MUN</span>
            <span className="mono-label text-brass text-[9px]">Registration</span>
          </Link>
          <Link to="/" className="mono-label text-muted-foreground hover:text-brass transition-colors">Back to site</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {phase === "form" && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="mono-label text-brass font-medium">Step 0{step} / 06 — {STEPS[step - 1]}</div>
                <span className="mono-label text-muted-foreground text-xs">{Math.round((step / 6) * 100)}% completed</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden relative border border-border/40">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8F6F34] via-[#C7A35A] to-[#FBE7B6] rounded-full relative"
                  animate={{ width: `${(step / 6) * 100}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#C7A35A]" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.4)]"
              >
                {step === 1 && (
                  <div className="space-y-5">
                    <h1 className="font-display text-3xl text-foreground">Let's start with you.</h1>
                    <Field label="Full name" required>
                      <Input data-testid="reg-full-name" className={inputCls} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Aditya Sharma" />
                    </Field>
                    <Field label="Email" required>
                      <Input data-testid="reg-email" type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
                    </Field>
                    <Field label="Phone" required>
                      <Input data-testid="reg-phone" className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h1 className="font-display text-3xl text-foreground">Where are you from?</h1>
                    <Field label="School / College" required>
                      <Input data-testid="reg-school" className={inputCls} value={f.school} onChange={(e) => set("school", e.target.value)} placeholder="Paramount International School" />
                    </Field>
                    <Field label="City">
                      <Input data-testid="reg-city" className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="New Delhi" />
                    </Field>
                    <Field label="MUN experience level" required hint="Be honest — this feeds your allotment.">
                      <Select value={f.experience} onValueChange={(v) => set("experience", v)}>
                        <SelectTrigger data-testid="reg-experience" className={inputCls}><SelectValue placeholder="Select your level" /></SelectTrigger>
                        <SelectContent>
                          {EXPERIENCE.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Notable awards / MUNs attended">
                      <Textarea data-testid="reg-awards" className="bg-white/[0.02] border-border text-foreground focus-visible:ring-brass" value={f.awards} onChange={(e) => set("awards", e.target.value)} placeholder="Optional — best delegate at XYZ MUN, etc." />
                    </Field>
                    <div className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div>
                        <div className="text-sm text-foreground">Registering as a delegation / team?</div>
                        <div className="text-xs text-muted-foreground">Toggle on if you're coming as a group</div>
                      </div>
                      <Switch data-testid="reg-delegation" checked={f.is_delegation} onCheckedChange={(v) => set("is_delegation", v)} />
                    </div>
                    {f.is_delegation && (
                      <Field label="Delegation size" required>
                        <Input data-testid="reg-delegation-size" type="number" min="1" className={inputCls} value={f.delegation_size} onChange={(e) => set("delegation_size", e.target.value)} placeholder="e.g. 8" />
                      </Field>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="How did you hear about us?">
                        <Input data-testid="reg-heard" className={inputCls} value={f.heard_from} onChange={(e) => set("heard_from", e.target.value)} placeholder="Optional" />
                      </Field>
                    </div>
                  </div>
                )}

                {(step === 3 || step === 4 || step === 5) && (() => {
                  const which = step === 3 ? "preference1" : step === 4 ? "preference2" : "preference3";
                  const pref = f[which];
                  const titles = {
                    preference1: { h: "Your first choice.", s: "Which committee do you most want to be in?" },
                    preference2: { h: "And a backup.", s: "In case your first preference fills up." },
                    preference3: { h: "One more, to be safe.", s: "Your third and final committee preference." },
                  };
                  return (
                    <div className="space-y-5">
                      <h1 className="font-display text-3xl text-foreground">{titles[which].h}</h1>
                      <p className="text-sm text-muted-foreground">{titles[which].s}</p>
                      <Field label="Committee" required>
                        <Select value={pref.committee} onValueChange={(v) => { setPref(which, "committee", v); setPref(which, "portfolio", ""); }}>
                          <SelectTrigger data-testid={`reg-${which}-committee`} className={inputCls}><SelectValue placeholder="Select a committee" /></SelectTrigger>
                          <SelectContent>
                            {committees.map((c) => (
                              <SelectItem key={c.slug} value={c.slug}>
                                {c.name} — {c.open_count} of {c.total_count} open
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      {pref.committee && (
                        <Field label="Portfolio preference" hint="Optional — leave as 'Assign me one' if you're flexible.">
                          <Select value={pref.portfolio || "__any__"} onValueChange={(v) => setPref(which, "portfolio", v === "__any__" ? "" : v)}>
                            <SelectTrigger data-testid={`reg-${which}-portfolio`} className={inputCls}><SelectValue placeholder="Choose a portfolio" /></SelectTrigger>
                            <SelectContent className="max-h-72">
                              <SelectItem value="__any__">Assign me one</SelectItem>
                              {portfoliosFor(pref.committee).map((p) => (
                                <SelectItem key={p.name} value={p.party ? `${p.name} (${p.party})` : p.name}>
                                  {p.party ? `${p.name} — ${p.party}` : p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    </div>
                  );
                })()}

                {step === 6 && (
                  <div className="space-y-5">
                    <h1 className="font-display text-3xl text-foreground">Almost there.</h1>
                    <Field label="Reference / Ambassador code" hint="Have a referral code? Enter it here to apply your eligible rate.">
                      <div className="flex gap-2">
                        <Input
                          data-testid="reg-referral"
                          className={inputCls}
                          value={f.referral_code}
                          onChange={(e) => { set("referral_code", e.target.value); setRefState(null); }}
                          onBlur={checkReferral}
                          placeholder="Optional"
                        />
                        <button
                          type="button"
                          data-testid="reg-referral-apply"
                          onClick={checkReferral}
                          className="h-11 shrink-0 rounded-lg border border-[#3A2F18] bg-card px-4 text-sm text-foreground hover:border-brass transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </Field>
                    {refState === "valid" && (
                      <div className="flex items-center gap-2 text-sm text-[#2FBF71]"><ShieldCheck size={15} /> Code accepted{refResult?.label ? ` — ${refResult.label}` : ""}. You get ₹500 off.</div>
                    )}
                    {refState === "invalid" && f.referral_code && (
                      <div className="text-sm text-destructive">This code isn't recognised. You can still register without one.</div>
                    )}

                    {f.referral_code.trim() && (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[#3A2F18] bg-[#1A1710] p-4">
                          <div className="mono-label text-brass mb-1">Important</div>
                          <p className="text-sm text-secondary-foreground/85 leading-relaxed">
                            If you are <span className="text-foreground font-medium">not a student of Paramount International School</span>, we advise you not to use this code — it may lead to disqualification, and payment is non-refundable. Please upload your ID card below for verification.
                          </p>
                        </div>
                        <Field label="Upload your ID card" required hint="Image or PDF, up to 5MB. Used only to verify your eligibility for the code.">
                          <input
                            data-testid="reg-id-card"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={onIdUpload}
                            className="block w-full text-sm text-muted-foreground file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-brass file:px-4 file:text-sm file:font-medium file:text-[#070A0F] hover:file:bg-brass-hover file:cursor-pointer"
                          />
                        </Field>
                        {f.id_card && (
                          <div className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] p-2">
                            {f.id_card.startsWith("data:image") ? (
                              <img src={f.id_card} alt="ID preview" className="h-14 w-14 rounded object-cover" />
                            ) : (
                              <div className="h-14 w-14 rounded bg-secondary flex items-center justify-center mono-label text-brass">PDF</div>
                            )}
                            <span className="text-sm text-[#2FBF71] flex items-center gap-1"><ShieldCheck size={14} /> ID card attached</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                      <div className="mono-label text-muted-foreground mb-1">Before you pay</div>
                      <p className="text-sm text-secondary-foreground/85 leading-relaxed">
                        All registrations are <span className="text-foreground font-medium">non-refundable</span>. You may transfer your spot to another delegate, subject to organizer approval.
                      </p>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox data-testid="reg-terms" checked={f.accepted_terms} onCheckedChange={(v) => set("accepted_terms", !!v)} className="mt-0.5 border-border data-[state=checked]:bg-brass data-[state=checked]:border-brass" />
                      <span className="text-sm text-muted-foreground">
                        I've read and accept the registration terms and the no-refund policy.
                      </span>
                    </label>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-between">
              <button data-testid="reg-back" onClick={back} className="card-luxury inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm text-foreground hover:border-brass transition-colors">
                <ArrowLeft size={16} /> {step === 1 ? "Home" : "Back"}
              </button>
              <button data-testid="reg-next" onClick={next} className="btn-luxury inline-flex h-11 items-center gap-2 rounded-lg bg-brass px-7 text-sm font-semibold text-[#070A0F] hover:bg-brass-hover transition-all shadow-[0_0_15px_rgba(199,163,90,0.3)] hover:shadow-[0_0_25px_rgba(199,163,90,0.6)]">
                {step === 6 ? "Proceed to Payment" : "Continue"} <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {phase === "payment" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
            <div className="mono-label text-brass">Final step</div>
            <h1 className="font-display text-3xl text-foreground mt-2">Complete your payment</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Scan the QR below with any UPI app to pay your delegate fee. Once done, submit your registration — our team verifies every payment before allotting portfolios.
            </p>
            <div className="mt-6 inline-block rounded-2xl border border-border bg-white p-3 shadow-lg">
              <img data-testid="payment-qr" src={ASSET.qr} alt="UPI payment QR code" className="w-64 h-auto rounded-lg" />
            </div>
            <div className="mt-6 max-w-md mx-auto text-left">
              <div className="mono-label text-brass">Upload Payment Screenshot</div>
              <div className="mt-2 rounded-xl border border-border bg-white/[0.02] p-3">
                <input
                  data-testid="payment-screenshot"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={onScreenshotChange}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:h-10 file:rounded-lg file:border-0 file:bg-brass file:px-4 file:text-sm file:font-medium file:text-[#070A0F] hover:file:bg-brass-hover file:cursor-pointer"
                />
                {screenshotPreview && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={screenshotPreview} alt="Screenshot preview" className="h-16 w-16 rounded object-cover border" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        data-testid="submit-screenshot"
                        onClick={async () => {
                          if (!screenshotFile && !f.payment_screenshot) return toast.error("Select an image first");
                          if (reference) {
                            setScreenshotUploading(true);
                            try {
                              await uploadRegistrationScreenshot(reference, screenshotFile);
                              toast.success("Screenshot uploaded");
                            } catch (e) {
                              toast.error(e?.response?.data?.detail || "Upload failed");
                            } finally { setScreenshotUploading(false); }
                          } else {
                            // No reference yet — submit registration including attached screenshot
                            try {
                              setSubmitting(true);
                              const payload = {
                                ...f,
                                delegation_size: f.is_delegation && f.delegation_size ? Number(f.delegation_size) : null,
                                preference1: { committee: cName(f.preference1.committee), portfolio: f.preference1.portfolio || "" },
                                preference2: { committee: cName(f.preference2.committee), portfolio: f.preference2.portfolio || "" },
                                preference3: { committee: cName(f.preference3.committee), portfolio: f.preference3.portfolio || "" },
                              };
                              const res = await submitRegistration(payload);
                              setReference(res.reference_id);
                              setPhase("done");
                              window.scrollTo(0, 0);
                              toast.success("Registration submitted with screenshot");
                            } catch (e) {
                              toast.error(e?.response?.data?.detail || "Something went wrong. Try again.");
                            } finally { setSubmitting(false); }
                          }
                        }}
                        className="btn-luxury h-10 px-4 rounded-lg bg-brass text-[#070A0F] text-sm font-medium hover:bg-brass-hover transition-colors shadow"
                      >
                        {screenshotUploading ? "Uploading…" : "Submit Screenshot"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#3A2F18] bg-[#1A1710] px-4 py-2 shadow-sm">
              <span className="mono-label text-brass font-medium">₹{calculateFee()} per delegate</span>
            </div>
            <p className="mt-3 mono-label text-muted-foreground">Pay via BHIM / UPI / GPay / PhonePe / Paytm</p>
            <div className="mt-3 rounded-xl border border-[#3A2F18] bg-[#1A1710] p-3 max-w-md mx-auto">
              <p className="text-xs text-secondary-foreground/80">Reminder: this fee is non-refundable. Submitting confirms you've completed payment.</p>
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              <button data-testid="payment-back" onClick={back} className="card-luxury inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm text-foreground hover:border-brass transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <button data-testid="reg-submit" disabled={submitting} onClick={doSubmit} className="btn-luxury inline-flex h-11 items-center gap-2 rounded-lg bg-brass px-7 text-sm font-semibold text-[#070A0F] hover:bg-brass-hover transition-colors disabled:opacity-60 shadow-[0_0_20px_rgba(199,163,90,0.4)]">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>I've paid — Submit <Check size={16} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="rounded-2xl border border-border bg-card p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#1A1710] border border-brass/60 flex items-center justify-center animate-pulse-gold">
              <CheckCircle2 className="text-brass" size={32} />
            </div>
            <h1 className="font-display text-4xl text-foreground mt-5">You're registered.</h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto leading-relaxed">
              We've received your registration and sent a confirmation to <span className="text-foreground font-medium">{f.email}</span>. Keep your reference ID handy.
            </p>
            <div className="mt-6 inline-block rounded-2xl border border-brass/40 bg-[#0E1426] px-9 py-6 shadow-[0_0_30px_rgba(199,163,90,0.15)]">
              <div className="mono-label text-muted-foreground text-xs">Reference ID</div>
              <div data-testid="reg-reference-id" className="font-mono text-3xl text-brass tracking-wider mt-1 font-bold">{reference}</div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Our team will verify your payment and confirm your committee allotment by email.</p>
            <div className="mt-7 flex items-center justify-center gap-3.5">
              <Link to="/" className="card-luxury inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm text-foreground hover:border-brass transition-colors">Back to home</Link>
              <Link to="/handbook" className="btn-luxury inline-flex h-11 items-center rounded-lg bg-brass px-6 text-sm font-semibold text-[#070A0F] hover:bg-brass-hover transition-colors shadow-[0_0_15px_rgba(199,163,90,0.3)]">Read the Handbook</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
